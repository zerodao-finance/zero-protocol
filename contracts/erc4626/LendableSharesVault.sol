// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

import { ERC4626, ERC20 } from "./ERC4626.sol";
import { LoanRecord } from "./VaultStructs.sol";
import { SafeCastLib } from "@rari-capital/solmate/src/utils/SafeCastLib.sol";
import { FixedPointMathLib } from "@rari-capital/solmate/src/utils/FixedPointMathLib.sol";

abstract contract LendableSharesVault is ERC4626 {
  using SafeCastLib for uint256;
  using FixedPointMathLib for uint256;

  error LoanDoesNotExist(uint128 loanId);

  event LoanUnderpaid(address lender, uint256 loanId, uint256 owed, uint256 repaid);

  uint128 public totalBorrowedAssets;

  uint128 public loansCount;

  // Maps lender => loanId => LoanRecord
  // Even though loan ids increment globally, we map them to lenders
  // instead of storing the lender to reduce gas consumption from storage.
  // @todo Replace this with a bytes32 and manual encoding/decoding
  mapping(address => mapping(uint256 => LoanRecord)) public outstandingLoans;

  function totalAssets() public view virtual override returns (uint256) {
    return ERC20(asset).balanceOf(address(this)) + totalBorrowedAssets;
  }

  /// @notice Lock user shares until they repay the underlying amount
  /// The amount of shares that the underlying assets are equivalent to
  /// will be locked until the underlying assets are returned to the vault.
  /// @param lender Account to lend shares from
  /// @param amount Amount of underlying asset to lend from account
  /// @return loanId Identifier for new loan
  function _borrowFrom(address lender, uint256 amount) internal returns (uint128 loanId) {
    uint128 amountAs128 = amount.safeCastTo128();
    totalBorrowedAssets += amountAs128;
    loanId = ++loansCount;
    uint256 shares = previewWithdraw(amount);
    outstandingLoans[lender][loanId] = LoanRecord(amountAs128, shares.safeCastTo128());
    // Transfer shares from the lender to the contract
    _transfer(lender, address(this), shares);
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
   * @param assetsRepaid Amount of underlying to repay as a uint256
   */
  function _repayTo(
    address lender,
    uint128 loanId,
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

    // If loan is fully repaid
    if (assetsRepaid >= assetsBorrowed) {
      // Return shares to the lender
      _transfer(address(this), lender, sharesLocked);
    }
    // If loan is less than fully repaid
    else {
      // If loan is partially repaid
      if (assetsRepaid > 0) {
        // Unlock shares proportional to the fraction repaid
        uint256 sharesToUnlock = assetsRepaid.mulDivDown(sharesLocked, assetsBorrowed);
        // Return shares to lender
        _transfer(address(this), lender, sharesToUnlock);
        sharesLocked -= sharesToUnlock;
      }
      // Burn the shares that were not unlocked
      _burn(address(this), sharesLocked);
      emit LoanUnderpaid(lender, loanId, assetsBorrowed, assetsRepaid);
    }
    // Delete the loan object
    delete outstandingLoans[lender][loanId];
    // Reduce total amount vault is expecting to receive back
    totalBorrowedAssets -= record.assetsBorrowed;
  }
}
// /**
// * @param borrower Account to receive loan
// * @param amount Amount of vault's underlying asset to loan
// * @param module Module to use for conversion
// */
// function loan(address borrower, uint256 amount, IModule module) internal {
//   // Check module is approved by governance.
//   require(approvedModule[module]);

//   // Increment total loans and get ID for this loan.
//   uint256 loanId = ++loansCount;

//   // Get estimated gas cost and collateralization ratio for a loan
//   // from module.
//   (
//     uint256 estimatedGas,
//     uint256 collateralizationRatio
//   ) = module.getLoanParams();

//   // Store loan information (underlying and shares locked for lender)
//   // and transfer their shares to the vault.
//   _borrowFrom(
//     msg.sender,
//     loanId,
//     amount.mulDivDown(collateralizationRatio, 1e18)
//   );

//   // Get max allowable gas fee for the loan and convert to vault's
//   // underlying asset.
//   uint256 gasCostInAsset = getLoanGasFeeInUnderlying(estimatedGas);

//   // Execute module interaction
//   IModule(module).loan(borrower, asset, amount - gasCostInAsset);
// }
