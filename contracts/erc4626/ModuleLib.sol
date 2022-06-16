// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

library ModuleLib {
  // min is unused here
  struct Loan {
    uint256 min;
    uint256 qty;
    uint256 qtyNative;
    uint64 time;
    address borrower;
  }
  struct Isolate {
    mapping(uint256 => Loan) loans;
  }

  function getIsolate(uint256 slot) internal returns (Isolate storage isolate) {
    assembly {
      isolate.slot := slot
    }
  }
}
