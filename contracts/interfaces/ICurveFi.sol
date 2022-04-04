// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

interface ICurveFi {
  function add_liquidity(uint256[2] calldata amounts, uint256 idx) external;
}
