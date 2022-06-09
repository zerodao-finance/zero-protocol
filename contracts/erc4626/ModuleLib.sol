// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

library ModuleLib {
  struct Loans {
    uint256 qty;
    uint64 time;
    uint256 qtyETH;
  }
  struct Isolate {
    mapping(uint256 => Loans) loans;
  }

  function getIsolate(uint256 slot) internal returns (Isolate storage isolate) {
    assembly {
      isolate.slot := slot
    }
  }
}
