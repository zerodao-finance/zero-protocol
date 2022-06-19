// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import "./storage/GovernableBase.sol";

contract Governable is GovernableBase {
  constructor() {
    governance = msg.sender;
  }

  modifier onlyGovernance() {
    if (msg.sender != governance) {
      revert NotGovernance();
    }
    _;
  }

  function setGovernance(address _governance) public onlyGovernance {
    emit GovernanceTransferred(governance, _governance);
    governance = _governance;
  }
}
