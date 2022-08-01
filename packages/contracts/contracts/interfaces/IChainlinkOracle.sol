// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IChainlinkOracle {
  function latestAnswer() external view returns (uint256);
}
