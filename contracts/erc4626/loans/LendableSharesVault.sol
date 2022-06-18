// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

import "../ERC4626.sol";
import { EIP2612 } from "../EIP2612.sol";
import { SafeCastLib } from "../utils/SafeCastLib.sol";
import { FixedPointMathLib } from "../utils/FixedPointMathLib.sol";
import "../storage/LendableSharesVaultBase.sol";

abstract contract LendableSharesVault is LendableSharesVaultBase, ERC4626, EIP2612 {
  using SafeCastLib for uint256;
  using FixedPointMathLib for uint256;

  function totalAssets() public view virtual override returns (uint256) {
    return ERC20(asset).balanceOf(address(this)) + totalBorrowedAssets;
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
  function _borrowFrom(
    uint256 loanId,
    address lender,
    address borrower,
    uint256 borrowAmount,
    uint256 checkpointSupply,
    uint256 checkpointTotalAssets
  ) internal {
    uint128 amountAs128 = borrowAmount.safeCastTo128();
    totalBorrowedAssets += amountAs128;
    // Calculate the amount of shares to lock
    uint256 shares = previewWithdrawForCheckpoint(borrowAmount, checkpointSupply, checkpointTotalAssets);
    // Write the loan data to storage
    outstandingLoans[lender][loanId] = LoanRecord(amountAs128, shares.safeCastTo128());
    // Transfer shares from the lender to the contract
    _transfer(lender, address(this), shares);
    // Emit event for loan creation
    emit LoanCreated(lender, borrower, loanId, borrowAmount, shares);
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
   * @param lender Account that loaned the assets
   * @param loanId Identifier for the loan
   * @param assetsRepaid Amount of underlying repaid
   */
  function _repayTo(
    address lender,
    uint256 loanId,
    uint256 assetsRepaid
  ) internal {
    // Put the record values on the stack to reduce memory access
    LoanRecord memory record = outstandingLoans[lender][loanId];
    uint256 sharesLocked = uint256(record.sharesLocked);
    uint256 assetsBorrowed = uint256(record.assetsBorrowed);

    // Ensure the loan exists
    if (assetsBorrowed == 0) {
      revert LoanDoesNotExist(loanId);
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

    // Delete the loan object
    delete outstandingLoans[lender][loanId];

    // Reduce total amount vault is expecting to receive back
    totalBorrowedAssets -= record.assetsBorrowed;
  }
}
