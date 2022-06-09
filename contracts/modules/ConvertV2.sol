// SPDX-License-Identifier: MIT
import { BaseModule } from "../eip4626/BaseModule.sol";
import { ModuleLib } from "../eip4626/ModuleLib.sol";

pragma solidity >=0.8.7 <0.9.0;

contract ConvertV2 is BaseModule {
  using ModuleLib for uint256;

  function _recieveLoan(
    address borrower,
    uint256 borrowAmount,
    uint256 nonce,
    bytes calldata data
  ) internal override returns (uint256) {}

  function _repayLoan(
    address borrower,
    uint256 repaidAmount,
    uint256 loanId,
    bytes calldata data
  ) internal override returns (uint256) {}
}
