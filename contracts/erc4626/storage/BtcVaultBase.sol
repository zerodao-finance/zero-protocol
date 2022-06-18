// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

import { LendableSharesVaultBase } from "./LendableSharesVaultBase.sol";
import { ModuleRegistryBase } from "./ModuleRegistryBase.sol";

contract BtcVaultBase is LendableSharesVaultBase, ModuleRegistryBase {
  /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

  error ModuleNotApproved();
  error InvalidSelector();
  error ReceiveLoanError(address module, address borrower, uint256 borrowAmount, uint256 loanId, bytes data);
  error RepayLoanError(address module, address borrower, uint256 repaidAmount, uint256 loanId, bytes data);
}
