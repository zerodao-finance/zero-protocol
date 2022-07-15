// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import { LendableSharesVault } from "./loans/LendableSharesVault.sol";
import { VaultBase, ModuleStateCoder, DefaultModuleState, ModuleType, ModuleState, GlobalStateCoder, GlobalState, LoanRecordCoder, LoanRecord } from "./storage/VaultBase.sol";
import { IGateway, IGatewayRegistry } from "../interfaces/IGatewayRegistry.sol";
import { EIP712 } from "./EIP712/EIP712.sol";
import { ModuleInteractions } from "./ModuleInteractions.sol";
import "./interfaces/IZeroModule.sol";
import "./Governable.sol";
import "./utils/Math.sol";
import "./utils/SafeTransferLib.sol";

uint256 constant OneBitcoin = 1e8;

// Used to convert a price expressed as wei per btc to one expressed
// as satoshi per ETH
uint256 constant BtcEthPriceInversionNumerator = 1e26;

abstract contract ZeroBitcoinVault is VaultBase, LendableSharesVault, ModuleInteractions, Governable {
  using SafeTransferLib for address;
  using ModuleStateCoder for ModuleState;
  using GlobalStateCoder for GlobalState;
  using LoanRecordCoder for LoanRecord;
  using Math for uint256;

  receive() external payable {}

  /*//////////////////////////////////////////////////////////////
                        External Loan Actions
  //////////////////////////////////////////////////////////////*/

  /**
   * @param module Module to use for conversion
   * @param borrower Account to receive loan
   * @param borrowAmount Amount of vault's underlying asset to borrow
   * @param nonce Nonce for the loan, provided by Zero network
   * @param signature User's EIP712 signature
   * @param data User provided data
   */
  function loan(
    address module,
    address borrower,
    uint256 borrowAmount,
    uint256 nonce,
    bytes memory signature,
    bytes memory data
  ) external nonReentrant {
    (GlobalState state, ModuleState moduleState) = _getUpdatedGlobalAndModuleState(module);

    bytes32 loanId = _verifyTransferRequestSignature(borrower, asset, borrowAmount, module, nonce, data, signature);

    (uint256 actualBorrowAmount, uint256 lenderDebt, uint256 vaultExpenseWithoutRepayFee) = _calculateLoanFees(
      state,
      moduleState,
      borrowAmount
    );

    // Store loan information (underlying and shares locked for lender)
    // and transfer their shares to the vault. The lender
    _borrowFrom(uint256(loanId), msg.sender, borrower, actualBorrowAmount, lenderDebt, vaultExpenseWithoutRepayFee);

    (ModuleType moduleType, uint256 ethRefundForLoanGas) = moduleState.getLoanParams();
    if (uint256(moduleType) > 0) {
      // Execute module interaction
      _executeReceiveLoan(module, borrower, loanId, borrowAmount, data);
    } else {
      // If module does not override loan behavior,
      asset.safeTransfer(borrower, borrowAmount);
    }

    tx.origin.safeTransferETH(ethRefundForLoanGas);
  }

  /**
   * @param lender Address of account that gave the loan
   * @param borrower Address of account that took out the loan
   * @param borrowAmount Original loan amount before fees
   * @param nonce Nonce for the loan
   * @param module Module used for the loan
   * @param nHash Nonce hash from RenVM deposit
   * @param renSignature Signature from RenVM
   * @param data Extra data used by module
   */
  function repay(
    address lender,
    address borrower,
    uint256 borrowAmount,
    uint256 nonce,
    address module,
    bytes32 nHash,
    bytes memory renSignature,
    bytes memory data
  ) external nonReentrant {
    (, ModuleState moduleState) = _getUpdatedGlobalAndModuleState(module);

    bytes32 loanId = _digestTransferRequest(borrower, asset, borrowAmount, module, nonce, data);
    uint256 mintAmount = _getGateway().mint(loanId, borrowAmount, nHash, renSignature);

    (ModuleType moduleType, uint256 ethRefundForRepayGas, uint256 btcFeeForRepayGas) = moduleState.getRepayParams();
    uint256 collateralToUnlock = mintAmount;

    if (moduleType == ModuleType.LoanAndRepayOverride) {
      collateralToUnlock = _executeRepayLoan(module, borrower, loanId, mintAmount, data);
    }

    _repayTo(lender, uint256(loanId), collateralToUnlock, btcFeeForRepayGas);

    tx.origin.safeTransferETH(ethRefundForRepayGas);
  }

  /*//////////////////////////////////////////////////////////////
                         Governance Actions
  //////////////////////////////////////////////////////////////*/

  function setGlobalFees(
    uint256 zeroBorrowFeeBips,
    uint256 renBorrowFeeBips,
    uint256 zeroBorrowFeeStatic,
    uint256 renBorrowFeeStatic
  ) external onlyGovernance nonReentrant {
    if (zeroBorrowFeeBips > 2000 || renBorrowFeeBips > 2000 || zeroBorrowFeeBips == 0 || renBorrowFeeBips == 0) {
      revert InvalidDynamicBorrowFee();
    }
    _state = _state.setFees(zeroBorrowFeeBips, renBorrowFeeBips, zeroBorrowFeeStatic, renBorrowFeeStatic);
  }

  function setModuleGasFees(
    address module,
    uint256 loanGas,
    uint256 repayGas
  ) external onlyGovernance nonReentrant {
    (GlobalState state, ) = _getUpdatedGlobalState();
    ModuleState moduleState = _getExistingModuleState(module);
    // Divide loan and repay gas by 10000
    uint256 loanGasE4 = loanGas.uncheckedDivUpE4();
    uint256 repayGasE4 = repayGas.uncheckedDivUpE4();
    moduleState = moduleState.setGasParams(loanGasE4, repayGasE4);
    _updateModuleCache(state, moduleState, module);
  }

  function addModule(
    address module,
    ModuleType moduleType,
    uint256 loanGas,
    uint256 repayGas
  ) external onlyGovernance nonReentrant {
    if (module != address(0)) {
      address moduleAsset = IZeroModule(module).asset();
      if (moduleAsset != asset) {
        revert ModuleAssetDoesNotMatch(moduleAsset);
      }
    }

    if (loanGas == 0 || repayGas == 0) {
      revert InvalidNullValue();
    }

    // Module type can not be null unless address is 0
    // If address is 0, module type must be null
    if ((moduleType == ModuleType.Null) != (module == address(0))) {
      revert InvalidModuleType();
    }

    // Divide loan and repay gas by 10000
    uint256 loanGasE4 = loanGas.uncheckedDivUpE4();
    uint256 repayGasE4 = repayGas.uncheckedDivUpE4();

    // Get updated global state, with cache refreshed if it had expired
    (GlobalState state, ) = _getUpdatedGlobalState();

    // Calculate the new gas refunds for the module
    (
      uint256 ethRefundForLoanGas,
      uint256 ethRefundForRepayGas,
      uint256 btcFeeForLoanGas,
      uint256 btcFeeForRepayGas
    ) = _calculateModuleGasFees(state, loanGasE4, repayGasE4);

    // Write the module data to storage
    _moduleFees[module] = ModuleStateCoder.encode(
      moduleType,
      loanGasE4,
      repayGasE4,
      ethRefundForLoanGas,
      ethRefundForRepayGas,
      btcFeeForLoanGas,
      btcFeeForRepayGas,
      block.timestamp
    );

    emit ModuleStateUpdated(module, moduleType, loanGasE4, repayGasE4);
  }

  function removeModule(address module) external onlyGovernance nonReentrant {
    _moduleFees[module] = DefaultModuleState;
  }

  /*//////////////////////////////////////////////////////////////
                          External Updaters
  //////////////////////////////////////////////////////////////*/

  function pokeGlobalCache() external nonReentrant {
    _updateGlobalCache(_state);
  }

  function pokeModuleCache(address module) external nonReentrant {
    _getUpdatedGlobalAndModuleState(module);
  }

  /*//////////////////////////////////////////////////////////////
                          External Getters
  //////////////////////////////////////////////////////////////*/

  function getGlobalState()
    external
    view
    returns (
      uint256 zeroBorrowFeeBips,
      uint256 renBorrowFeeBips,
      uint256 zeroBorrowFeeStatic,
      uint256 renBorrowFeeStatic,
      uint256 zeroFeeShareBips,
      uint256 totalBitcoinBorrowed,
      uint256 satoshiPerEth,
      uint256 gweiPerGas,
      uint256 lastUpdateTimestamp
    )
  {
    return _state.decode();
  }

  function getModuleState(address module)
    external
    view
    returns (
      ModuleType moduleType,
      uint256 loanGasE4,
      uint256 repayGasE4,
      uint256 ethRefundForLoanGas,
      uint256 ethRefundForRepayGas,
      uint256 btcFeeForLoanGas,
      uint256 btcFeeForRepayGas,
      uint256 lastUpdateTimestamp
    )
  {
    return _getExistingModuleState(module).decode();
  }

  /*//////////////////////////////////////////////////////////////
                           Oracle Queries
  //////////////////////////////////////////////////////////////*/

  function _getSatoshiPerEth() internal view returns (uint256) {
    uint256 ethPerBitcoin = btcEthPriceOracle.latestAnswer();
    return BtcEthPriceInversionNumerator / ethPerBitcoin;
  }

  function _getGweiPerGas() internal view returns (uint256) {
    uint256 gasPrice = gasPriceOracle.latestAnswer();
    return gasPrice / 1e9;
  }

  function _getGateway() internal view returns (IGateway gateway) {
    gateway = IGateway(gatewayRegistry.getGatewayByToken(asset));
  }

  /*//////////////////////////////////////////////////////////////
                  Internal Fee Getters and Updaters               
  //////////////////////////////////////////////////////////////*/

  function _updateGlobalCache(GlobalState state) internal returns (GlobalState) {
    uint256 satoshiPerEth = _getSatoshiPerEth();
    uint256 gweiPerGas = _getGweiPerGas();
    state = state.setCached(satoshiPerEth, gweiPerGas, block.timestamp);
    _state = state;
    emit GlobalStateCacheUpdated(satoshiPerEth, gweiPerGas);
    return state;
  }

  function _updateModuleCache(
    GlobalState state,
    ModuleState moduleState,
    address module
  ) internal returns (ModuleState) {
    // Read the gas parameters
    (uint256 loanGasE4, uint256 repayGasE4) = moduleState.getGasParams();
    // Calculate the new gas refunds for the module
    (
      uint256 ethRefundForLoanGas,
      uint256 ethRefundForRepayGas,
      uint256 btcFeeForLoanGas,
      uint256 btcFeeForRepayGas
    ) = _calculateModuleGasFees(state, loanGasE4, repayGasE4);
    // Update the module's cache and write it to storage
    moduleState = moduleState.setCached(
      ethRefundForLoanGas,
      ethRefundForRepayGas,
      btcFeeForLoanGas,
      btcFeeForRepayGas,
      block.timestamp
    );
    _moduleFees[module] = moduleState;
    return moduleState;
  }

  function _getUpdatedGlobalState() internal returns (GlobalState state, uint256 lastUpdateTimestamp) {
    state = _state;
    lastUpdateTimestamp = state.getLastUpdateTimestamp();
    if (block.timestamp - lastUpdateTimestamp > cacheTimeToLive) {
      state = _updateGlobalCache(state);
    }
  }

  function _getUpdatedGlobalAndModuleState(address module)
    internal
    returns (GlobalState state, ModuleState moduleState)
  {
    // Get updated global state, with cache refreshed if it had expired
    uint256 lastGlobalUpdateTimestamp;
    (state, lastGlobalUpdateTimestamp) = _getUpdatedGlobalState();
    // Read module state from storage
    moduleState = _getExistingModuleState(module);
    // Check if module's cache is older than global cache
    if (moduleState.getLastUpdateTimestamp() < lastGlobalUpdateTimestamp) {
      moduleState = _updateModuleCache(state, moduleState, module);
    }
  }

  /*//////////////////////////////////////////////////////////////
                      Internal Fee Calculators
  //////////////////////////////////////////////////////////////*/

  function _calculateModuleGasFees(
    GlobalState state,
    uint256 loanGasE4,
    uint256 repayGasE4
  )
    internal
    pure
    returns (
      uint256 ethRefundForLoanGas,
      uint256 ethRefundForRepayGas,
      uint256 btcFeeForLoanGas,
      uint256 btcFeeForRepayGas
    )
  {
    (uint256 satoshiPerEth, uint256 gasPrice) = state.getParamsForModuleState();
    // Unchecked because gasPrice can not exceed 60 bits,
    // refunds can not exceed 68 bits and the numerator for
    // borrowGasFeeBitcoin can not exceed 108 bits
    unchecked {
      // Multiply gasPrice (expressed in gwei) by 1e9 to convert to wei, and by 1e4 to convert
      // the gas values (expressed as gas * 1e-4) to ETH
      gasPrice *= 1e13;
      // Compute ETH cost of running loan function
      ethRefundForLoanGas = loanGasE4 * gasPrice;
      // Compute ETH cost of running repay function
      ethRefundForRepayGas = repayGasE4 * gasPrice;
      // Compute BTC value of `ethRefundForLoanGas`
      btcFeeForLoanGas = (satoshiPerEth * ethRefundForLoanGas) / OneEth;
      // Compute BTC value of `ethRefundForRepayGas`
      btcFeeForRepayGas = (satoshiPerEth * ethRefundForRepayGas) / OneEth;
    }
  }

  function _calculateRenAndZeroFees(GlobalState state, uint256 borrowAmount)
    internal
    pure
    returns (uint256 renFees, uint256 zeroFees)
  {
    (
      uint256 zeroBorrowFeeBips,
      uint256 renBorrowFeeBips,
      uint256 zeroBorrowFeeStatic,
      uint256 renBorrowFeeStatic
    ) = state.getFees();

    renFees = renBorrowFeeStatic + borrowAmount.uncheckedMulBipsUp(renBorrowFeeBips);
    zeroFees = zeroBorrowFeeStatic + borrowAmount.uncheckedMulBipsUp(zeroBorrowFeeBips);
  }

  function _calculateLoanFees(
    GlobalState state,
    ModuleState moduleState,
    uint256 borrowAmount
  )
    internal
    pure
    returns (
      uint256 actualBorrowAmount,
      uint256 lenderDebt,
      uint256 vaultExpenseWithoutRepayFee
    )
  {
    (uint256 renFees, uint256 zeroFees) = _calculateRenAndZeroFees(state, borrowAmount);
    (uint256 btcFeeForLoanGas, uint256 btcFeeForRepayGas) = moduleState.getBitcoinGasFees();

    lenderDebt = borrowAmount - renFees;
    vaultExpenseWithoutRepayFee = borrowAmount - (renFees + zeroFees + btcFeeForLoanGas);
    actualBorrowAmount = lenderDebt - btcFeeForRepayGas;
  }

  /*//////////////////////////////////////////////////////////////
                          Internal Getters
  //////////////////////////////////////////////////////////////*/

  function _getExistingModuleState(address module) internal view returns (ModuleState moduleState) {
    moduleState = _moduleFees[module];
    if (moduleState.isNull()) {
      revert ModuleDoesNotExist();
    }
  }
}
