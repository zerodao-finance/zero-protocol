// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;
pragma experimental ABIEncoderV2;

import { GovernorAlpha } from "../vendor/compound/GovernorAlpha.sol";

contract ZeroGovernor is GovernorAlpha {
  constructor(
    address _timelock,
    address _zero,
    address _guardian
  ) public GovernorAlpha(_timelock, _zero, _guardian) {}
}
