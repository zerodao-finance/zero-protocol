// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library zVaultLib {
  struct Isolate {
    address controller;
    address governance;
    address burnModule;
    mapping(address => bool) whitelist;
  }

  function toIsolate(uint256 slot)
    internal
    pure
    returns (Isolate storage isolate)
  {
    assembly {
      isolate.slot := slot
    }
  }
}
