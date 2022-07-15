// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import "../ERC4626.sol";
import { EIP2612 } from "../EIP2612.sol";
import "../utils/Math.sol";
import { FixedPointMathLib } from "../utils/FixedPointMathLib.sol";
import "../storage/VaultBase.sol";
import { Panic_error_signature, Panic_error_offset, Panic_arithmetic, Panic_error_length, MaxUint48 } from "../utils/CoderConstants.sol";

abstract contract LendableSharesVault is VaultBase, ERC4626, EIP2612 {
  using FixedPointMathLib for uint256;
  using GlobalStateCoder for GlobalState;
  using LoanRecordCoder for LoanRecord;

  /*//////////////////////////////////////////////////////////////
                          External Queries
  //////////////////////////////////////////////////////////////*/

  function getOutstandingLoan(address lender, uint256 loanId)
    external
    view
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
    return ERC20(asset).balanceOf(address(this)) + _state.getTotalBitcoinBorrowed();
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
        block.timestamp + maxLoanDuration
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
