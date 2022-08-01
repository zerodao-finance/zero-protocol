// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import "./ZeroBTCCache.sol";
import { DefaultLoanRecord } from "../utils/LoanRecordCoder.sol";
import "../utils/FixedPointMathLib.sol";

uint256 constant ReceiveLoanError_selector = 0x83f44e2200000000000000000000000000000000000000000000000000000000;
uint256 constant RepayLoanError_selector = 0x0ccaea8800000000000000000000000000000000000000000000000000000000;
uint256 constant RepayLoan_selector = 0x2584dde800000000000000000000000000000000000000000000000000000000;
uint256 constant ReceiveLoan_selector = 0x332b578c00000000000000000000000000000000000000000000000000000000;

uint256 constant ModuleCall_borrower_offset = 0x04;
uint256 constant ModuleCall_amount_offset = 0x24;
uint256 constant ModuleCall_loanId_offset = 0x44;
uint256 constant ModuleCall_data_head_offset = 0x64;
uint256 constant ModuleCall_data_length_offset = 0x84;
uint256 constant ModuleCall_data_offset = 0x80;
uint256 constant ModuleCall_calldata_baseLength = 0xa4;

abstract contract ZeroBTCLoans is ZeroBTCCache {
  using ModuleStateCoder for ModuleState;
  using GlobalStateCoder for GlobalState;
  using LoanRecordCoder for LoanRecord;
  using SafeTransferLib for address;
  using FixedPointMathLib for uint256;
  using Math for uint256;

  /*//////////////////////////////////////////////////////////////
                             Constructor
  //////////////////////////////////////////////////////////////*/

  constructor() {
    if (
      uint256(bytes32(IZeroModule.receiveLoan.selector)) !=
      ReceiveLoan_selector ||
      uint256(bytes32(IZeroModule.repayLoan.selector)) != RepayLoan_selector ||
      uint256(bytes32(ReceiveLoanError.selector)) !=
      ReceiveLoanError_selector ||
      uint256(bytes32(RepayLoanError.selector)) != RepayLoanError_selector
    ) {
      revert InvalidSelector();
    }
  }

  /*//////////////////////////////////////////////////////////////
                        External Loan Actions
  //////////////////////////////////////////////////////////////*/

  /**
   * @param module Module to use for conversion
   * @param borrower Account to receive loan
   * @param borrowAmount Amount of vault's underlying asset to borrow
   * @param nonce Nonce for the loan, provided by keeper
   * @param data User provided data
   */
  function loan(
    address module,
    address borrower,
    uint256 borrowAmount,
    uint256 nonce,
    bytes memory data
  ) external override nonReentrant {
    (
      GlobalState state,
      ModuleState moduleState
    ) = _getUpdatedGlobalAndModuleState(module);

    uint256 loanId = _deriveLoanId(msg.sender, _deriveLoanPHash(data));

    (
      uint256 actualBorrowAmount,
      uint256 lenderDebt,
      uint256 btcFeeForLoanGas
    ) = _calculateLoanFees(state, moduleState, borrowAmount);

    // Store loan information and lock lender's shares
    _borrowFrom(
      uint256(loanId),
      msg.sender,
      borrower,
      actualBorrowAmount,
      lenderDebt,
      btcFeeForLoanGas
    );

    (ModuleType moduleType, uint256 ethRefundForLoanGas) = moduleState
      .getLoanParams();
    if (uint256(moduleType) > 0) {
      // Execute module interaction
      _executeReceiveLoan(module, borrower, loanId, actualBorrowAmount, data);
    } else {
      // If module does not override loan behavior,
      asset.safeTransfer(borrower, actualBorrowAmount);
    }

    tx.origin.safeTransferETH(ethRefundForLoanGas);
  }

  /**
   * @param module Module used for the loan
   * @param borrower Address of account that took out the loan
   * @param borrowAmount Original loan amount before fees
   * @param nonce Nonce for the loan
   * @param data Extra data used by module
   * @param lender Address of account that gave the loan
   * @param nHash Nonce hash from RenVM deposit
   * @param renSignature Signature from RenVM
   */
  function repay(
    address module,
    address borrower,
    uint256 borrowAmount,
    uint256 nonce,
    bytes memory data,
    address lender,
    bytes32 nHash,
    bytes memory renSignature
  ) external override nonReentrant {
    (
      GlobalState state,
      ModuleState moduleState
    ) = _getUpdatedGlobalAndModuleState(module);

    bytes32 pHash = _deriveLoanPHash(data);
    uint256 repaidAmount = _getGateway().mint(
      pHash,
      borrowAmount,
      nHash,
      renSignature
    );

    ModuleType moduleType = moduleState.getModuleType();

    uint256 loanId = _deriveLoanId(lender, pHash);
    if (moduleType == ModuleType.LoanAndRepayOverride) {
      repaidAmount = _executeRepayLoan(
        module,
        borrower,
        loanId,
        repaidAmount,
        data
      );
    }
    LoanRecord loanRecord = _deleteLoan(loanId);

    _repayTo(state, moduleState, loanRecord, lender, loanId, repaidAmount);

    tx.origin.safeTransferETH(moduleState.getEthRefundForRepayGas());
  }

  function closeExpiredLoan(
    address module,
    address borrower,
    uint256 borrowAmount,
    uint256 nonce,
    bytes memory data,
    address lender
  ) external override nonReentrant {
    uint256 loanId = _deriveLoanId(lender, _deriveLoanPHash(data));
    LoanRecord loanRecord = _deleteLoan(loanId);
    if (loanRecord.getExpiry() >= block.timestamp) {
      revert LoanNotExpired(loanId);
    }
    (
      GlobalState state,
      ModuleState moduleState
    ) = _getUpdatedGlobalAndModuleState(module);
    ModuleType moduleType = moduleState.getModuleType();
    uint256 repaidAmount = 0;
    if (moduleType == ModuleType.LoanAndRepayOverride) {
      repaidAmount = _executeRepayLoan(
        module,
        borrower,
        loanId,
        repaidAmount,
        data
      );
    }

    _repayTo(state, moduleState, loanRecord, lender, loanId, repaidAmount);

    tx.origin.safeTransferETH(moduleState.getEthRefundForRepayGas());
  }

  function earn() external override nonReentrant {
    (GlobalState state, ) = _getUpdatedGlobalState();
    (uint256 unburnedGasReserveShares, uint256 unburnedZeroFeeShares) = state
      .getUnburnedShares();
    _state = state.setUnburnedShares(0, 0);
    uint256 totalFeeShares;
    uint256 totalFees;
    uint256 supply = _totalSupply;
    uint256 assets = totalAssets();
    unchecked {
      totalFeeShares = unburnedGasReserveShares + unburnedZeroFeeShares;
      totalFees = totalFeeShares.mulDivDown(assets, supply);
      _totalSupply = supply - totalFeeShares;
    }
    uint256 minimumEthOut = (_btcToEth(totalFees, state.getSatoshiPerEth()) *
      98) / 100;
    asset.safeTransfer(address(_renBtcConverter), totalFees);
    uint256 actualEthOut = _renBtcConverter.convertToEth(minimumEthOut);
    uint256 ethForZero = unburnedZeroFeeShares.mulDivDown(
      actualEthOut,
      totalFeeShares
    );
    _zeroFeeRecipient.safeTransferETH(ethForZero);
    emit FeeSharesBurned(
      actualEthOut - ethForZero,
      unburnedGasReserveShares,
      ethForZero,
      unburnedZeroFeeShares
    );
  }

  /*//////////////////////////////////////////////////////////////
                          External Getters
  //////////////////////////////////////////////////////////////*/

  function getOutstandingLoan(uint256 loanId)
    external
    view
    override
    returns (
      uint256 sharesLocked,
      uint256 actualBorrowAmount,
      uint256 lenderDebt,
      uint256 btcFeeForLoanGas,
      uint256 expiry
    )
  {
    return _outstandingLoans[loanId].decode();
  }

  /**
   * @dev Derives a loan ID from the combination of the loan's
   * pHash, derived from the loan parameters (module, borrower,
   * borrowAmount, nonce, data), and the lender's address.
   */
  function calculateLoanId(
    address module,
    address borrower,
    uint256 borrowAmount,
    uint256 nonce,
    bytes memory data,
    address lender
  ) external view override returns (uint256) {
    return _deriveLoanId(lender, _deriveLoanPHash(data));
  }

  /*//////////////////////////////////////////////////////////////
                          Module Interactions
  //////////////////////////////////////////////////////////////*/

  function _prepareModuleCalldata(
    uint256 selector,
    address borrower,
    uint256 loanId,
    uint256 amount,
    bytes memory data
  ) internal pure {
    assembly {
      let startPtr := sub(data, ModuleCall_data_length_offset)
      // Write function selector
      mstore(startPtr, selector)
      // Write borrower
      mstore(add(startPtr, ModuleCall_borrower_offset), borrower)
      // Write borrowAmount or repaidAmount
      mstore(add(startPtr, ModuleCall_amount_offset), amount)
      // Write loanId
      mstore(add(startPtr, ModuleCall_loanId_offset), loanId)
      // Write data offset
      mstore(add(startPtr, ModuleCall_data_head_offset), ModuleCall_data_offset)
    }
  }

  function _executeReceiveLoan(
    address module,
    address borrower,
    uint256 loanId,
    uint256 borrowAmount,
    bytes memory data
  ) internal RestoreFiveWordsBefore(data) {
    _prepareModuleCalldata(
      ReceiveLoan_selector,
      borrower,
      loanId,
      borrowAmount,
      data
    );
    assembly {
      let startPtr := sub(data, ModuleCall_data_length_offset)
      // Size of data + (selector, borrower, borrowAmount, loanId, data_offset, data_length)
      let calldataLength := add(mload(data), ModuleCall_calldata_baseLength)
      // Delegatecall module
      let status := delegatecall(gas(), module, startPtr, calldataLength, 0, 0)

      // Handle failures
      if iszero(status) {
        // If return data was provided, bubble up
        if returndatasize() {
          returndatacopy(0, 0, returndatasize())
          revert(0, returndatasize())
        }
        // If no return data was provided, throw generic error
        // Write ReceiveLoanError.selector
        mstore(sub(startPtr, 0x20), ReceiveLoanError_selector)
        // Write module to memory
        mstore(sub(startPtr, 0x1c), module)
        // Update data offset
        mstore(add(startPtr, 0x64), 0xa0)
        // Revert with ReceiveLoanError
        revert(sub(startPtr, 0x20), add(calldataLength, 0x20))
      }
    }
  }

  function _executeRepayLoan(
    address module,
    address borrower,
    uint256 loanId,
    uint256 repaidAmount,
    bytes memory data
  ) internal RestoreFiveWordsBefore(data) returns (uint256 collateralToUnlock) {
    _prepareModuleCalldata(
      RepayLoan_selector,
      borrower,
      loanId,
      repaidAmount,
      data
    );
    assembly {
      let startPtr := sub(data, ModuleCall_data_length_offset)
      // Size of data + (selector, borrower, borrowAmount, loanId, data_offset, data_length)
      let calldataLength := add(mload(data), ModuleCall_calldata_baseLength)
      // Delegatecall module
      let status := delegatecall(
        gas(),
        module,
        startPtr,
        calldataLength,
        0,
        0x20
      )

      // Handle failures
      if iszero(status) {
        // If return data was provided, bubble up
        if returndatasize() {
          returndatacopy(0, 0, returndatasize())
          revert(0, returndatasize())
        }
        // If no return data was provided, throw generic error
        // Write RepayLoanError.selector
        mstore(sub(startPtr, 0x20), RepayLoanError_selector)
        // Write module to memory
        mstore(sub(startPtr, 0x1c), module)
        // Update data offset
        mstore(add(startPtr, 0x64), 0xa0)
        // Revert with RepayLoanError
        revert(sub(startPtr, 0x20), add(calldataLength, 0x20))
      }
      collateralToUnlock := mload(0)
    }
  }

  /*//////////////////////////////////////////////////////////////
                       Internal Loan Handling
  //////////////////////////////////////////////////////////////*/

  function _deriveLoanPHash(bytes memory data)
    internal
    view
    RestoreFreeMemoryPointer
    RestoreZeroSlot
    RestoreFirstTwoUnreservedSlots
    returns (bytes32 pHash)
  {
    assembly {
      // Write data hash first, since its buffer will be overwritten by the following section
      mstore(0xa0, keccak256(add(data, 0x20), mload(data)))
      // Write vault address
      mstore(0, address())
      // Copy module, borrower, borrowAmount, nonce to hash buffer
      calldatacopy(0x20, 0x04, 0x80)
      pHash := keccak256(0, 0xc0)
    }
  }

  function _deriveLoanId(address lender, bytes32 pHash)
    internal
    pure
    returns (uint256 loanId)
  {
    assembly {
      mstore(0, lender)
      mstore(0x20, pHash)
      loanId := keccak256(0, 0x40)
    }
  }

  function _getAndSetLoan(uint256 loanId, LoanRecord newRecord)
    internal
    returns (LoanRecord oldRecord)
  {
    assembly {
      mstore(0, loanId)
      mstore(0x20, _outstandingLoans.slot)
      let loanSlot := keccak256(0, 0x40)
      oldRecord := sload(loanSlot)
      sstore(loanSlot, newRecord)
    }
  }

  function _deleteLoan(uint256 loanId)
    internal
    returns (LoanRecord loanRecord)
  {
    loanRecord = _getAndSetLoan(loanId, DefaultLoanRecord);

    // Ensure the loan exists
    if (loanRecord.isNull()) {
      revert LoanDoesNotExist(loanId);
    }
  }

  /**
   * @notice Lock lender shares until they repay `borrowedAmount`.
   *
   * `lenderDebt` is higher than `borrowAmount`, the amount leaving
   * the contract, to account for gas fees paid to keepers in ETH
   * as well as protocol fees from Zero.
   *
   * The lender will have an amount of shares equivalent to `lenderDebt` locked,
   * and will have a fraction of those shares unlocked on repayment.
   *
   * @param loanId Identifier for the loan
   * @param lender Account lending assets
   * @param borrower Account borrowing assets
   * @param actualBorrowAmount Amount of `asset` sent to borrower
   * @param lenderDebt Amount of `asset` lender is responsible for repaying
   * @param vaultExpenseWithoutRepayFee Amount of `asset` vault is expecting back without
   * accounting for btc value of repay gas refund
   */
  function _borrowFrom(
    uint256 loanId,
    address lender,
    address borrower,
    uint256 actualBorrowAmount,
    uint256 lenderDebt,
    uint256 vaultExpenseWithoutRepayFee
  ) internal {
    // Calculate the amount of shares to lock
    uint256 shares = previewWithdraw(lenderDebt);

    unchecked {
      GlobalState state = _state;
      uint256 totalBitcoinBorrowed = state.getTotalBitcoinBorrowed();
      _state = state.setTotalBitcoinBorrowed(
        totalBitcoinBorrowed + actualBorrowAmount
      );
    }

    LoanRecord oldRecord = _getAndSetLoan(
      loanId,
      LoanRecordCoder.encode(
        shares,
        actualBorrowAmount,
        lenderDebt,
        vaultExpenseWithoutRepayFee,
        block.timestamp + _maxLoanDuration
      )
    );

    if (!oldRecord.isNull()) {
      revert LoanIdNotUnique(loanId);
    }

    // Reduce lender's balance to lock shares for their debt
    _balanceOf[lender] -= shares;

    // Emit transfer event so indexing services can correctly track the
    // lender's balance
    emit Transfer(lender, address(this), shares);

    // Emit event for loan creation
    emit LoanCreated(lender, borrower, loanId, actualBorrowAmount, shares);
  }

  /**
   * @notice Repay assets for a loan and unlock the shares of the lender
   * at the original price they were locked at. If less than the full
   * amount is repaid, the remainder of the shares are burned. This can
   * only be called once so full repayment will not eventually occur if
   * the loan is only partially repaid first.
   *
   * Note: amountRepaid MUST have already been received by the vault
   * before this function is called.
   *
   * @param state Global state
   * @param moduleState Module state
   * @param loanRecord Loan record
   * @param lender Account that gave the loan
   * @param loanId Identifier for the loan
   * @param repaidAmount Amount of underlying repaid
   */
  function _repayTo(
    GlobalState state,
    ModuleState moduleState,
    LoanRecord loanRecord,
    address lender,
    uint256 loanId,
    uint256 repaidAmount
  ) internal {
    // Unlock/burn shares for repaid amount
    (uint256 sharesUnlocked, uint256 sharesBurned) = _unlockSharesForLoan(
      loanRecord,
      lender,
      repaidAmount
    );

    // Handle fees for gas reserves and ZeroDAO
    _state = _collectLoanFees(state, moduleState, loanRecord, repaidAmount);

    // Emit event for loan repayment
    emit LoanClosed(loanId, repaidAmount, sharesUnlocked, sharesBurned);
  }

  function _unlockSharesForLoan(
    LoanRecord loanRecord,
    address lender,
    uint256 repaidAmount
  ) internal returns (uint256 sharesUnlocked, uint256 sharesBurned) {
    (uint256 sharesLocked, uint256 lenderDebt) = loanRecord.getSharesAndDebt();

    sharesUnlocked = sharesLocked;

    // If loan is less than fully repaid
    if (repaidAmount < lenderDebt) {
      // Unlock shares proportional to the fraction repaid
      sharesUnlocked = repaidAmount.mulDivDown(sharesLocked, lenderDebt);
      unchecked {
        // sharesUnlocked will always be less than sharesLocked
        sharesBurned = sharesLocked - sharesUnlocked;
        // The shares have already been subtracted from the lender's balance
        // so no balance update is needed.
        // totalSupply will always be greater than sharesBurned.
        _totalSupply -= sharesBurned;
      }
      // Emit transfer event so indexing services can correctly track the
      // totalSupply.
      emit Transfer(address(this), address(0), sharesBurned);
    }

    // If any shares should be unlocked, add them back to the lender's balance
    if (sharesUnlocked > 0) {
      // Cannot overflow because the sum of all user balances
      // can't exceed the max uint256 value.
      unchecked {
        _balanceOf[lender] += sharesUnlocked;
      }
      // Emit transfer event so indexing services can correctly track the
      // lender's balance
      emit Transfer(address(this), lender, sharesUnlocked);
    }
  }

  function _collectLoanFees(
    GlobalState state,
    ModuleState moduleState,
    LoanRecord loanRecord,
    uint256 repaidAmount
  ) internal returns (GlobalState) {
    (
      uint256 btcForGasReserve,
      uint256 ethForGasReserve
    ) = _getEffectiveGasCosts(state, moduleState, loanRecord);
    uint256 newBalance = address(this).balance + ethForGasReserve;
    uint256 actualBorrowAmount = loanRecord.getActualBorrowAmount();
    unchecked {
      // `actualBorrowAmount` has already been added to `totalBitcoinBorrowed`
      uint256 totalBitcoinBorrowed = state.getTotalBitcoinBorrowed();
      state = state.setTotalBitcoinBorrowed(
        totalBitcoinBorrowed - actualBorrowAmount
      );
    }

    uint256 profit = repaidAmount.subMinZero(
      actualBorrowAmount + btcForGasReserve
    );
    if (profit == 0) {
      return state;
    }

    // If vault's gas reserves are below the target, reduce the profit shared
    // with ZeroDAO and vault LPs by up to `(profit * maxGasProfitShareBips) / 10000`
    if (newBalance < _targetEthReserve) {
      // Calculate amount of ETH needed to reach target gas reserves
      uint256 btcNeededForTarget = _ethToBtc(
        _targetEthReserve - newBalance,
        state.getSatoshiPerEth()
      );
      // Calculate maximum amount of profit that can be used to meet reserves
      uint256 maxReservedBtcForGas = profit.uncheckedMulBipsUp(
        _maxGasProfitShareBips
      );
      // Take the minimum of the two values
      uint256 reservedProfit = Math.min(
        btcNeededForTarget,
        maxReservedBtcForGas
      );
      unchecked {
        // Reduce the profit that will be split between the vault's LPs and ZeroDAO
        profit -= reservedProfit;
        // Increase the BTC value that will be withheld for gas reserves
        btcForGasReserve += reservedProfit;
      }
    }
    return _mintFeeShares(state, profit, btcForGasReserve);
  }

  function _mintFeeShares(
    GlobalState state,
    uint256 profit,
    uint256 btcForGasReserve
  ) internal returns (GlobalState) {
    // Calculate share of profits owed to ZeroDAO
    uint256 btcForZeroDAO = profit.uncheckedMulBipsUp(
      state.getZeroFeeShareBips()
    );
    // Get the underlying assets held by the vault or in outstanding loans and subtract
    // the fees that will be charged in order to calculate the number of shares to mint
    // that will be worth the fees.
    uint256 _totalAssets = (ERC4626.totalAssets() +
      state.getTotalBitcoinBorrowed()) - (btcForGasReserve + btcForZeroDAO);
    // Cache the total supply to avoid extra SLOADs
    uint256 supply = _totalSupply;
    // Calculate shares to mint for the gas reserves and ZeroDAO fees
    uint256 gasReserveShares = btcForGasReserve.mulDivDown(
      supply,
      _totalAssets
    );
    uint256 zeroFeeShares = btcForZeroDAO.mulDivDown(supply, _totalAssets);
    // Emit event for fee shares
    emit FeeSharesMinted(
      btcForGasReserve,
      gasReserveShares,
      btcForZeroDAO,
      zeroFeeShares
    );
    // Add the new shares to the total supply. They are not added to any balance but we track
    // them in the global state.
    _totalSupply += (gasReserveShares + zeroFeeShares);
    // Get the current fee share totals
    (uint256 unburnedGasReserveShares, uint256 unburnedZeroFeeShares) = state
      .getUnburnedShares();
    // Write the new fee share totals to the global state on the stack
    return
      state.setUnburnedShares(
        unburnedGasReserveShares + gasReserveShares,
        unburnedZeroFeeShares + zeroFeeShares
      );
  }

  function _getEffectiveGasCosts(
    GlobalState state,
    ModuleState moduleState,
    LoanRecord loanRecord
  ) internal pure returns (uint256 btcSpentOnGas, uint256 ethSpentOnGas) {
    uint256 satoshiPerEth = state.getSatoshiPerEth();
    uint256 btcForLoanGas = loanRecord.getBtcFeeForLoanGas();
    btcSpentOnGas = btcForLoanGas + moduleState.getBtcFeeForRepayGas();
    ethSpentOnGas =
      _btcToEth(btcForLoanGas, satoshiPerEth) +
      moduleState.getEthRefundForRepayGas();
  }
}
