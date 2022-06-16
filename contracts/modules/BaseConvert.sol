// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import { BaseModule } from "../erc4626/BaseModule.sol";

abstract contract BaseConvert is BaseModule {
  constructor(address asset) BaseModule(asset) {}

  struct ConvertLocals {
    address borrower;
    uint256 minOut;
    uint256 amount;
    uint256 nonce;
  }

  function _receiveLoan(
    address borrower,
    uint256 amount,
    uint256 nonce,
    bytes calldata data
  ) internal override returns (uint256 collateralIssued) {
    ConvertLocals memory locals;
    locals.borrower = borrower;
    locals.amount = amount;
    (locals.minOut) = abi.decode(data, (uint256));
    bytes32 ptr;
    assembly {
      ptr := locals
    }
    collateralIssued = swap(ptr);
    transfer(borrower, amount);
  }

  function _repayLoan(
    address,
    uint256,
    uint256,
    bytes calldata
  ) internal override returns (uint256) {
    //no-op
    return 0;
  }
}
