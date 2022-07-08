// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import { LendableSharesVaultBase } from "./LendableSharesVaultBase.sol";
import "./GovernableBase.sol";
import { ModuleFeesCoder, ModuleType, ModuleFees } from "../utils/ModuleFeesCoder.sol";
import { GlobalFeesCoder, GlobalFees } from "../utils/GlobalFeesCoder.sol";

contract BtcVaultBase is LendableSharesVaultBase, GovernableBase {
  /*//////////////////////////////////////////////////////////////
                                Storage
  //////////////////////////////////////////////////////////////*/

  GlobalFees internal _globalFees;

  mapping(address => ModuleFees) internal _moduleFees;

  /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

  error ModuleNotApproved();
  error InvalidSelector();
  error ReceiveLoanError(address module, address borrower, uint256 borrowAmount, uint256 loanId, bytes data);
  error RepayLoanError(address module, address borrower, uint256 repaidAmount, uint256 loanId, bytes data);
  error ModuleAssetDoesNotMatch(address moduleAsset);
  error InvalidModuleType();
  error DynamicBorrowFeeTooHigh(uint256 dynamicBorrowFeeBips);

  /*//////////////////////////////////////////////////////////////
                                EVENTS
  //////////////////////////////////////////////////////////////*/
  event ModuleFeesUpdated(address module, ModuleType moduleType, uint256 loanGasE5, uint256 repayGasE5);

  event GlobalFeesConfigUpdated(uint256 dynamicBorrowFee, uint256 staticBorrowFee);

  event GlobalFeesCacheUpdated(uint256 satoshiPerEth, uint256 getGweiPerGas);
}
