// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

contract MockGasPriceOracle {
  uint256 public latestAnswer = 10 gwei;

  function setLatestAnswer(uint256 answer) external {
    latestAnswer = answer;
  }
}
