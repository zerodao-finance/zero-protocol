// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

import "./ERC4626Base.sol";
import "./EIP2612Base.sol";
import { LoanRecord } from "../VaultStructs.sol";

contract LendableSharesVaultBase is ERC4626Base, EIP2612Base {
  /*//////////////////////////////////////////////////////////////
                            Storage
    //////////////////////////////////////////////////////////////*/
  uint128 public totalBorrowedAssets;

  // Maps lender => loanId => LoanRecord
  // Even though loan ids increment globally, we map them to lenders
  // instead of storing the lender to reduce gas consumption from storage.
  // @todo Replace this with a bytes32 and manual encoding/decoding
  mapping(address => mapping(uint256 => LoanRecord)) public outstandingLoans;

  /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

  error LoanDoesNotExist(uint256 loanId);

  /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

  event LoanCreated(address lender, address borrower, uint256 loanId, uint256 assetsBorrowed, uint256 sharesLocked);

  event LoanClosed(uint256 loanId, uint256 assetsRepaid, uint256 sharesUnlocked, uint256 sharesBurned);
}
