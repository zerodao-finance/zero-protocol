// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

contract MockBtcEthPriceOracle {
  uint256 public latestAnswer = 2e19;

  function setLatestAnswer(uint256 answer) external {
    latestAnswer = answer;
  }
}
