// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract Governable {
  address public governance;

  error NotGovernance();

  // Does not check if already initialized,
  // should be handled by inheriting contract.
  function _init(address _governance) internal {
    governance = _governance;
  }

  modifier onlyGovernance() {
    if (msg.sender != governance) {
      revert NotGovernance();
    }
    _;
  }

  function setGovernance(address _governance) public onlyGovernance {
    governance = _governance;
  }
}
