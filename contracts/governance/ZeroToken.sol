// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import { Comp } from "../vendor/compound/Comp.sol";

contract ZeroToken is Comp {
  string public override name = "ZeroDAO";
  string public override symbol = "ZERO";
  constructor(address account) public Comp(account) {}
}
