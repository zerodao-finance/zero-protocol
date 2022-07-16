// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import "./ZeroBTCCache.sol";
import "../utils/MemoryRestoration.sol";

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

abstract contract ZeroBTCLoans is ZeroBTCCache, MemoryRestoration {
  using ModuleStateCoder for ModuleState;
  using GlobalStateCoder for GlobalState;
  using LoanRecordCoder for LoanRecord;

  /*//////////////////////////////////////////////////////////////
                             Constructor
  //////////////////////////////////////////////////////////////*/

  constructor() {
    if (
      uint256(bytes32(IZeroModule.receiveLoan.selector)) != ReceiveLoan_selector ||
      uint256(bytes32(IZeroModule.repayLoan.selector)) != RepayLoan_selector ||
      uint256(bytes32(ReceiveLoanError.selector)) != ReceiveLoanError_selector ||
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
  ) external override nonReentrant {
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
  ) external override nonReentrant {
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
                          External Getters
  //////////////////////////////////////////////////////////////*/

  function getOutstandingLoan(address lender, uint256 loanId)
    external
    view
    override
    returns (
      uint256 sharesLocked,
      uint256 actualBorrowAmount,
      uint256 lenderDebt,
      uint256 vaultExpenseWithoutRepayFee,
      uint256 expiry
    )
  {
    return _outstandingLoans[lender][loanId].decode();
  }

  function totalAssets() public view virtual override returns (uint256) {
    return ERC4626.totalAssets() + _state.getTotalBitcoinBorrowed();
  }

  /*//////////////////////////////////////////////////////////////
                          Module Interactions
  //////////////////////////////////////////////////////////////*/

  function _prepareModuleCalldata(
    uint256 selector,
    address borrower,
    bytes32 loanId,
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
    bytes32 loanId,
    uint256 borrowAmount,
    bytes memory data
  ) internal RestoreFiveWordsBefore(data) {
    _prepareModuleCalldata(ReceiveLoan_selector, borrower, loanId, borrowAmount, data);
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
    bytes32 loanId,
    uint256 repaidAmount,
    bytes memory data
  ) internal RestoreFiveWordsBefore(data) returns (uint256 collateralToUnlock) {
    _prepareModuleCalldata(RepayLoan_selector, borrower, loanId, repaidAmount, data);
    assembly {
      let startPtr := sub(data, ModuleCall_data_length_offset)
      // Size of data + (selector, borrower, borrowAmount, loanId, data_offset, data_length)
      let calldataLength := add(mload(data), ModuleCall_calldata_baseLength)
      // Delegatecall module
      let status := delegatecall(gas(), module, startPtr, calldataLength, 0, 0x20)

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

  function _getAndSetLoan(
    address lender,
    uint256 loanId,
    LoanRecord newRecord
  ) internal returns (LoanRecord oldRecord) {
    assembly {
      mstore(0, lender)
      mstore(0x20, _outstandingLoans.slot)
      mstore(0x20, keccak256(0, 0x40))
      mstore(0, loanId)
      let loanSlot := keccak256(0, 0x40)
      oldRecord := sload(loanSlot)
      sstore(loanSlot, newRecord)
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
      _state = state.setTotalBitcoinBorrowed(totalBitcoinBorrowed + actualBorrowAmount);
    }

    LoanRecord oldRecord = _getAndSetLoan(
      lender,
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

    // Transfer shares from the lender to the contract
    _transfer(lender, address(this), shares);

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
   * @param lender Account that gave the loan
   * @param loanId Identifier for the loan
   * @param assetsRepaid Amount of underlying repaid
   */
  function _repayTo(
    address lender,
    uint256 loanId,
    uint256 assetsRepaid,
    uint256 btcFeeForRepayGas
  ) internal returns (uint256 feesCollected) {
    LoanRecord oldRecord = _getAndSetLoan(lender, loanId, DefaultLoanRecord);

    // Ensure the loan exists
    if (oldRecord.isNull()) {
      revert LoanDoesNotExist(loanId);
    }

    (
      uint256 sharesLocked,
      uint256 actualBorrowAmount,
      uint256 lenderDebt,
      uint256 vaultExpenseWithoutRepayFee,

    ) = oldRecord.decode();

    {
      uint256 vaultExpense = vaultExpenseWithoutRepayFee + btcFeeForRepayGas;
      feesCollected = Math.subMinZero(assetsRepaid, vaultExpense);
    }

    unchecked {
      // `totalBitcoinBorrowed` is only set through the borrow and repay
      // functions, and we know `actualBorrowAmount` has already been added
      // to it, so it can not underflow
      GlobalState state = _state;
      uint256 totalBitcoinBorrowed = state.getTotalBitcoinBorrowed();
      _state = state.setTotalBitcoinBorrowed(totalBitcoinBorrowed - actualBorrowAmount);
    }

    uint256 sharesBurned;
    uint256 sharesUnlocked = sharesLocked;

    // If loan is less than fully repaid
    if (assetsRepaid < lenderDebt) {
      // Unchecked because assetsRepaid * sharesLocked can never
      // overflow a uint256 and sharesUnlocked will always be less
      // than sharesLocked.
      unchecked {
        // Unlock shares proportional to the fraction repaid
        sharesUnlocked = assetsRepaid.mulDivDown(sharesLocked, lenderDebt);

        // Will never be 0 since we take the floor
        sharesBurned = sharesLocked - sharesUnlocked;
      }

      // Burn the shares that were not unlocked
      _burn(address(this), sharesBurned);
    }

    // If any shares should be unlocked
    if (sharesUnlocked > 0) {
      // Return shares to the lender
      _transfer(address(this), lender, sharesUnlocked);
    }

    // Emit event for loan repayment
    emit LoanClosed(loanId, assetsRepaid, sharesUnlocked, sharesBurned);
  }
}
