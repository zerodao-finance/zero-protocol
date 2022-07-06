// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import "./loans/LendableSharesVault.sol";
import { BtcVaultBase, ModuleFeesCoder, ModuleType, ModuleFees, GlobalFeesCoder, GlobalFees } from "./storage/BtcVaultBase.sol";
import { IGateway } from "../interfaces/IGateway.sol";
import { IChainlinkOracle } from "../interfaces/IChainlinkOracle.sol";
import { IGatewayRegistry } from "../interfaces/IGatewayRegistry.sol";
import { EIP712 } from "./EIP712/EIP712.sol";
import "./interfaces/IZeroModule.sol";
import "./IQuoter.sol";
import "./Governable.sol";

uint256 constant ReceiveLoanErrorSelector = 0x83f44e2200000000000000000000000000000000000000000000000000000000;
uint256 constant RepayLoanErrorSelector = 0x0ccaea8800000000000000000000000000000000000000000000000000000000;

uint256 constant RepayLoanSelector = 0x2584dde800000000000000000000000000000000000000000000000000000000;
uint256 constant ReceiveLoanSelector = 0x332b578c00000000000000000000000000000000000000000000000000000000;

uint256 constant RepayLoan_borrower_ptr = 0x04;
uint256 constant RepayLoan_repaidAmount_ptr = 0x24;
uint256 constant RepayLoan_loanId_ptr = 0x44;
uint256 constant RepayLoan_data_ptr = 0x64;
uint256 constant RepayLoan_calldata_baseLength = 0x84;

uint256 constant ReceiveLoan_borrower_ptr = 0x04;
uint256 constant ReceiveLoan_borrowAmount_ptr = 0x24;
uint256 constant ReceiveLoan_loanId_ptr = 0x44;
uint256 constant ReceiveLoan_data_ptr = 0x64;
uint256 constant ReceiveLoan_calldata_baseLength = 0x84;

uint256 constant OneBitcoin = 1e8;
uint256 constant BasisPointsOne = 1e4;
// Used to convert a price expressed as wei per btc to one expressed
// as satoshi per ETH
uint256 constant BtcEthPriceInversionNumerator = 1e26;

contract BtcVault is BtcVaultBase, LendableSharesVault, EIP712, Governable {
  using SafeTransferLib for address;
  using ModuleFeesCoder for ModuleFees;
  using GlobalFeesCoder for GlobalFees;

  // gasPriceOracle MUST return gas prices expressed as wei per unit of gas
  IChainlinkOracle public immutable gasPriceOracle;
  // btcEthPriceOracle MUST return prices expressed as wei per full bitcoin
  IChainlinkOracle public immutable btcEthPriceOracle;
  uint256 public immutable feesTimeToLive;
  IGatewayRegistry public immutable gatewayRegistry;
  string public constant version = "v0.1";

  function _getSatoshiPerEth() internal view returns (uint256) {
    uint256 ethPerBitcoin = btcEthPriceOracle.latestAnswer();
    return BtcEthPriceInversionNumerator / ethPerBitcoin;
  }

  function _getGweiPerGas() internal view returns (uint256) {
    uint256 gasPrice = gasPriceOracle.latestAnswer();
    return gasPrice / 1e9;
  }

  constructor(
    IGatewayRegistry _gatewayRegistry,
    address _btcAddress,
    IChainlinkOracle _btcEthPriceOracle,
    IChainlinkOracle _gasPriceOracle,
    uint256 _feesTimeToLive,
    uint16 _dynamicBorrowFeeBips,
    uint24 _staticBorrowFee
  )
    ERC4626(_btcAddress)
    ERC20Metadata("ZeroBTC", "ZBTC", 18)
    ReentrancyGuard()
    Governable()
    EIP712("ZeroBTC", version)
  {
    btcEthPriceOracle = _btcEthPriceOracle;
    gasPriceOracle = _gasPriceOracle;
    gatewayRegistry = _gatewayRegistry;
    feesTimeToLive = _feesTimeToLive;
    _globalFees = GlobalFeesCoder.encode(
      _dynamicBorrowFeeBips,
      _staticBorrowFee,
      _getSatoshiPerEth(),
      _getGweiPerGas(),
      uint32(block.timestamp)
    );
    if (
      uint256(bytes32(IZeroModule.receiveLoan.selector)) != ReceiveLoanSelector ||
      uint256(bytes32(IZeroModule.repayLoan.selector)) != RepayLoanSelector ||
      uint256(bytes32(ReceiveLoanError.selector)) != ReceiveLoanErrorSelector ||
      uint256(bytes32(RepayLoanError.selector)) != RepayLoanErrorSelector
    ) {
      revert InvalidSelector();
    }
  }

  function getGlobalFees()
    external
    view
    returns (
      uint256 dynamicBorrowFeeBips,
      uint256 staticBorrowFee,
      uint256 satoshiPerEth,
      uint256 gweiPerGas,
      uint256 lastUpdateTimestamp
    )
  {
    return _globalFees.decode();
  }

  function getModuleFees(address module)
    external
    view
    returns (
      ModuleType moduleType,
      uint256 loanGasE4,
      uint256 repayGasE4,
      uint256 loanRefundEth,
      uint256 repayRefundEth,
      uint256 staticBorrowFee,
      uint256 lastUpdateTimestamp
    )
  {
    return _moduleFees[module].decode();
  }

  function _getUpdatedGlobalFees() internal returns (GlobalFees fees, uint256 lastUpdateTimestamp) {
    lastUpdateTimestamp = fees.getLastUpdateTimestamp();
    fees = _globalFees;
    if (block.timestamp - lastUpdateTimestamp > feesTimeToLive) {
      fees = fees.setCached(_getSatoshiPerEth(), _getGweiPerGas(), block.timestamp);
      _globalFees = fees;
    }
  }

  function _calculateModuleFees(
    GlobalFees globalFees,
    uint256 loanGasE4,
    uint256 repayGasE4
  )
    internal
    view
    returns (
      uint256 loanRefundEth,
      uint256 repayRefundEth,
      uint256 staticBorrowFee
    )
  {
    uint256 satoshiPerEth;
    uint256 gasPrice;
    (staticBorrowFee, satoshiPerEth, gasPrice) = globalFees.getParamsForModuleFees();
    // Multiply gasPrice (expressed in gwei) by 1e9 to convert to wei, and by 1e4 to convert
    // the gas values (expressed as gas * 1e-4) to ETH
    gasPrice *= 1e13;
    // Compute ETH cost of running loan function
    loanRefundEth = loanGasE4 * gasPrice;
    // Compute ETH cost of running repay function
    repayRefundEth = repayGasE4 * gasPrice;
    // Compute BTC value of the total gas cost for both functions and add it to the
    // global static borrow fee
    staticBorrowFee += (satoshiPerEth * (loanRefundEth + repayRefundEth)) / 1e18;
  }

  function _getUpdatedGlobalAndModuleFees(address module)
    internal
    returns (GlobalFees globalFees, ModuleFees moduleFees)
  {
    uint256 lastGlobalUpdateTimestamp;
    (globalFees, lastGlobalUpdateTimestamp) = _getUpdatedGlobalFees();
    moduleFees = _moduleFees[module];
    if (moduleFees.getLastUpdateTimestamp() < lastGlobalUpdateTimestamp) {
      (uint256 loanGasE4, uint256 repayGasE4) = moduleFees.getGasParams();
      (uint256 loanRefundEth, uint256 repayRefundEth, uint256 staticBorrowFee) = _calculateModuleFees(
        globalFees,
        loanGasE4,
        repayGasE4
      );
      moduleFees = moduleFees.setCached(loanRefundEth, repayRefundEth, staticBorrowFee, block.timestamp);
      _moduleFees[module] = moduleFees;
    }
  }

  function addModule(
    address module,
    bool overrideRepayAndLoan,
    uint256 loanGas,
    uint256 repayGas
  ) external onlyGovernance {
    if (IZeroModule(module).asset() != asset) {
      revert ModuleAssetDoesNotMatch(module);
    }
    uint256 loanGasE4 = (loanGas + 9999) / 10000;
    uint256 repayGasE4 = (repayGas + 9999) / 10000;
    (GlobalFees globalFees, ) = _getUpdatedGlobalFees();
    (uint256 loanRefundEth, uint256 repayRefundEth, uint256 staticBorrowFee) = _calculateModuleFees(
      globalFees,
      loanGasE4,
      repayGasE4
    );
    ModuleType moduleType;
    assembly {
      moduleType := add(1, overrideRepayAndLoan)
    }
    _moduleFees[module] = ModuleFeesCoder.encode(
      moduleType,
      loanGasE4,
      repayGasE4,
      uint64(loanRefundEth),
      uint64(repayRefundEth),
      uint24(staticBorrowFee),
      uint32(block.timestamp)
    );

    emit ModuleFeesUpdated(module, moduleType, loanGasE4, repayGasE4);
  }

  function removeModule(address module) external onlyGovernance {
    ModuleFees _fees;
    assembly {
      _fees := 0
    }
    _moduleFees[module] = _fees; //ModuleFees.wrap(0);
  }

  function getGateway() internal view returns (IGateway gateway) {
    gateway = IGateway(gatewayRegistry.getGatewayByToken(asset));
  }

  function executeReceiveLoan(
    address module,
    address borrower,
    bytes32 loanId,
    uint256 borrowAmount,
    bytes memory data
  ) internal RestoreFiveWordsBefore(data) returns (uint256 collateralToLock, uint256 gasRefundEth) {
    assembly {
      let startPtr := sub(data, 0x84)
      // Write receiveLoan selector
      mstore(startPtr, ReceiveLoanSelector)
      // Write borrower
      mstore(add(startPtr, 0x04), borrower)
      // Write borrowAmount
      mstore(add(startPtr, 0x24), borrowAmount)
      // Write loanId
      mstore(add(startPtr, 0x44), loanId)
      // Write data offset
      mstore(add(startPtr, 0x64), 0x80)
      // Size of data + (selector, borrower, borrowAmount, loanId, data_offset, data_length)
      let calldataLength := add(mload(data), 0xa4)

      let status := delegatecall(gas(), module, startPtr, calldataLength, 0, 0x40)
      if iszero(status) {
        if returndatasize() {
          returndatacopy(0, 0, returndatasize())
          revert(0, returndatasize())
        }
        // Write ReceiveLoanError.selector
        mstore(sub(startPtr, 0x20), ReceiveLoanSelector)
        // Write module to memory
        mstore(sub(startPtr, 0x1c), module)
        // Update data offset
        mstore(add(startPtr, 0x64), 0xa0)
        revert(sub(startPtr, 0x20), add(calldataLength, 0x20))
      }

      collateralToLock := mload(0)
      gasRefundEth := mload(0x20)
    }
  }

  function executeRepayLoan(
    address module,
    bytes32 loanId,
    address borrower,
    uint256 repayAmount,
    bytes memory data
  ) internal RestoreFiveWordsBefore(data) returns (uint256 collateralToUnlock, uint256 gasRefundEth) {
    assembly {
      let startPtr := sub(data, 0x84)
      // Write repayLoan selector
      mstore(startPtr, RepayLoanSelector)
      calldatacopy(add(startPtr, 0x04), 0x24, 0x40)
      // Write borrower
      mstore(add(startPtr, 0x04), borrower)
      // Write repayAmount
      mstore(add(startPtr, 0x24), repayAmount)
      // Write loanId
      mstore(add(startPtr, 0x44), loanId)
      // Write data offset
      mstore(add(startPtr, 0x64), 0x80)
      // Size of data + (selector, borrower, repayAmount, loanId, data_offset, data_length)
      let calldataLength := add(mload(data), 0xa4)

      let status := delegatecall(gas(), module, startPtr, calldataLength, 0, 0x40)
      if iszero(status) {
        if returndatasize() {
          returndatacopy(0, 0, returndatasize())
          revert(0, returndatasize())
        }
        // Write RepayLoanError.selector
        mstore(sub(startPtr, 0x20), RepayLoanSelector)
        // Write module to memory
        mstore(sub(startPtr, 0x1c), module)
        // Update data offset
        mstore(add(startPtr, 0x64), 0xa0)
        revert(sub(startPtr, 0x20), add(calldataLength, 0x20))
      }

      collateralToUnlock := mload(0)
      gasRefundEth := mload(0x20)
    }
  }

  function getLoanFee(
    GlobalFees globalFees,
    uint256 borrowAmount,
    uint256 staticBorrowFee
  ) internal pure returns (uint256) {
    return staticBorrowFee + (borrowAmount * globalFees.getDynamicBorrowFeeBips()) / BasisPointsOne;
  }

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
    (GlobalFees globalFees, ModuleFees moduleFees) = _getUpdatedGlobalAndModuleFees(module);
    (ModuleType moduleType, uint256 loanRefundEth, uint256 staticBorrowFee) = moduleFees.getLoanParams();

    if (moduleType == ModuleType.Null && module != address(0)) {
      revert ModuleNotApproved();
    }

    bytes32 loanId = verifyTransferRequestSignature(borrower, asset, borrowAmount, module, nonce, data, signature);

    borrowAmount -= getLoanFee(globalFees, borrowAmount, staticBorrowFee);

    // Store loan information (underlying and shares locked for lender)
    // and transfer their shares to the vault.
    _borrowFrom(uint256(loanId), msg.sender, borrower, borrowAmount);

    bool overrideLoan;
    assembly {
      overrideLoan := gt(moduleType, 1)
    }
    if (overrideLoan) {
      // Execute module interaction
      executeReceiveLoan(module, borrower, loanId, borrowAmount, data);
    } else {
      asset.safeTransfer(borrower, borrowAmount);
    }

    tx.origin.safeTransferETH(loanRefundEth);
  }

  /**
   * @param lender Address of lender that backed the loan
   * @param borrower Address of account that took out the loan
   * @param borrowAmount Original loan amount before fees
   * @param nonce Nonce for the loan
   * @param module Module used for the loan
   * @param nHash Nonce hash from RenVM deposit
   * @param data Extra data used by module
   * @param signature Signature from RenVM
   */
  function repay(
    address lender,
    address borrower,
    uint256 borrowAmount,
    uint256 nonce,
    address module,
    bytes32 nHash,
    bytes memory data,
    bytes memory signature
  ) external nonReentrant {
    (, ModuleFees moduleFees) = _getUpdatedGlobalAndModuleFees(module);

    bytes32 loanId = digestTransferRequest(asset, borrowAmount, module, nonce, data);
    uint256 mintAmount = getGateway().mint(loanId, borrowAmount, nHash, signature);

    bool repayOverride;
    {
      ModuleType moduleType = moduleFees.getModuleType();
      assembly {
        repayOverride := or(eq(moduleType, 1), eq(moduleType, 3))
      }
    }
    if (repayOverride) {
      (uint256 collateralToUnlock, ) = executeRepayLoan(module, loanId, borrower, mintAmount, data);
      _repayTo(lender, uint256(loanId), collateralToUnlock);
    } else {
      _repayTo(lender, uint256(loanId), mintAmount);
    }
    tx.origin.safeTransferETH(moduleFees.getRepayRefundEth());
  }
}
