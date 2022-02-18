// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0;

contract SelfdestructSend {
  constructor(address payable target) payable {
    selfdestruct(target);
  }
}
