// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import "../ERC4626.sol";
import { EIP2612 } from "../EIP2612.sol";
import { SafeCastLib } from "../utils/SafeCastLib.sol";
import { FixedPointMathLib } from "../utils/FixedPointMathLib.sol";
import "../storage/LendableSharesVaultBase.sol";
import "../utils/CoderConstants.sol";

uint256 constant LoanIdNotUnique_selector = 0x4e435beb00000000000000000000000000000000000000000000000000000000;
uint256 constant LoanIdNotUnique_loanId_ptr = 0x04;
uint256 constant LoanIdNotUnique_length = 0x24;

uint256 constant LoanDoesNotExist_selector = 0x1fa8ef9a00000000000000000000000000000000000000000000000000000000;
uint256 constant LoanDoesNotExist_loanId_ptr = 0x04;
uint256 constant LoanDoesNotExist_length = 0x24;

uint256 constant LoanAlreadyRepaid_selector = 0xdae2c27300000000000000000000000000000000000000000000000000000000;
uint256 constant LoanAlreadyRepaid_loanId_ptr = 0x04;
uint256 constant LoanAlreadyRepaid_length = 0x24;

abstract contract LendableSharesVault is LendableSharesVaultBase, ERC4626, EIP2612 {
  using SafeCastLib for uint256;
  using FixedPointMathLib for uint256;

  function totalAssets() public view virtual override returns (uint256) {
    return ERC20(asset).balanceOf(address(this)) + uint256(totalBorrowedAssets);
  }

  /// @notice Lock user shares until they repay the underlying amount
  /// The amount of shares that the underlying assets are equivalent to
  /// will be locked until the underlying assets are returned to the vault.
  /// @param loanId Identifier for the loan
  /// @param lender Account lending assets
  /// @param borrower Account borrowing assets
  /// @param borrowAmount Amount of underlying asset to lend
  function _borrowFrom(
    uint256 loanId,
    address lender,
    address borrower,
    uint256 borrowAmount
  ) internal {
    // Calculate the amount of shares to lock
    uint256 shares = previewWithdraw(borrowAmount);
    {
      // Get the storage slot for the record
      LoanRecord storage record = outstandingLoans[lender][loanId];

      assembly {
        let totalBorrowedAssetsSlot := totalBorrowedAssets.slot
        // Add borrowAmount to cached totalBorrowedAssets on the stack
        let _totalBorrowedAssets := add(sload(totalBorrowedAssetsSlot), borrowAmount)
        // Cache the storage slot for the loan record
        let recordSlot := record.slot
        // Set boolean indicating whether `loanId` is unique
        // We use >0 instead of asserting iszero because repay
        // sets the value to 1 instead of 0
        let valueExists := gt(sload(recordSlot), 0)
        // Set boolean indicating whether `amount`, `totalBorrowedAssets` or `shares` overflows uint128
        // _totalBorrowedAssets can not overflow uint256 if borrowAmount is below the max uint128,
        // since we already know the stored totalBorrowedAssets fits into a uint128.
        let overflow := or(
          or(gt(borrowAmount, MaxUint128), gt(_totalBorrowedAssets, MaxUint128)),
          gt(shares, MaxUint128)
        )
        // Check if either error flag is set
        if or(valueExists, overflow) {
          // Revert if the value already exists
          if valueExists {
            mstore(0, LoanIdNotUnique_selector)
            mstore(LoanIdNotUnique_loanId_ptr, loanId)
            revert(0, LoanIdNotUnique_length)
          }
          // Revert if overflow was detected
          mstore(0, Panic_error_signature)
          mstore(Panic_error_offset, Panic_arithmetic)
          revert(0, Panic_error_length)
        }
        // Write the loan data to storage
        sstore(recordSlot, or(shl(128, shares), borrowAmount))
        sstore(totalBorrowedAssetsSlot, _totalBorrowedAssets)
      }
    }
    // Transfer shares from the lender to the contract
    _transfer(lender, address(this), shares);
    // Emit event for loan creation
    emit LoanCreated(lender, borrower, loanId, borrowAmount, shares);
  }

  /// @notice Lock user shares until they repay the underlying amount
  /// The amount of shares that the underlying assets are equivalent to
  /// will be locked until the underlying assets are returned to the vault.
  /// @param loanId Identifier for the loan
  /// @param lender Account lending assets
  /// @param borrower Account borrowing assets
  /// @param borrowAmount Amount of underlying asset to lend from account
  /// @param checkpointSupply Amount of shares that existed when the loan began
  /// @param checkpointTotalAssets Amount of underlying asset held by vault when the loan began
  // function _borrowFromAfterTransfer(
  //   uint256 loanId,
  //   address lender,
  //   address borrower,
  //   uint256 borrowAmount,
  //   uint256 checkpointSupply,
  //   uint256 checkpointTotalAssets
  // ) internal {
  //   uint128 amountAs128 = borrowAmount.safeCastTo128();
  //   totalBorrowedAssets += amountAs128;
  //   // Calculate the amount of shares to lock
  //   uint256 shares = previewWithdrawForCheckpoint(borrowAmount, checkpointSupply, checkpointTotalAssets);
  //   // Write the loan data to storage
  //   outstandingLoans[lender][loanId] = LoanRecord(amountAs128, shares.safeCastTo128());
  //   // Transfer shares from the lender to the contract
  //   _transfer(lender, address(this), shares);
  //   // Emit event for loan creation
  //   emit LoanCreated(lender, borrower, loanId, borrowAmount, shares);
  // }

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
   * @param lender Account that loaned the assets
   * @param loanId Identifier for the loan
   * @param assetsRepaid Amount of underlying repaid
   */
  function _repayTo(
    address lender,
    uint256 loanId,
    uint256 assetsRepaid
  ) internal {
    uint256 sharesLocked;
    uint256 assetsBorrowed;
    {
      // Get the storage slot for the record
      LoanRecord storage record = outstandingLoans[lender][loanId];
      assembly {
        let recordSlot := record.slot
        let recordValue := sload(recordSlot)
        // Mark record as repaid
        sstore(recordSlot, 0)
        // Ensure the loan exists
        if iszero(recordValue) {
          mstore(0, LoanDoesNotExist_selector)
          mstore(LoanDoesNotExist_loanId_ptr, loanId)
          revert(0, LoanDoesNotExist_length)
        }
        // Decode sharesLocked and assetsBorrowed
        sharesLocked := shr(128, recordValue)
        assetsBorrowed := and(recordValue, MaxUint128)

        let totalBorrowedAssetsSlot := totalBorrowedAssets.slot
        // `totalBorrowedAssets` is only set through the borrow and repay
        // functions, and we know `assetsBorrowed` has already been added
        // to it, so it can not underflow
        sstore(totalBorrowedAssetsSlot, sub(sload(totalBorrowedAssetsSlot), assetsBorrowed))
      }
    }
    uint256 sharesBurned;
    uint256 sharesUnlocked = sharesLocked;

    // If loan is less than fully repaid
    if (assetsRepaid < assetsBorrowed) {
      // Unlock shares proportional to the fraction repaid
      sharesUnlocked = assetsRepaid.mulDivDown(sharesLocked, assetsBorrowed);
      // Burn the shares that were not unlocked
      sharesBurned = sharesLocked - sharesUnlocked;
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
