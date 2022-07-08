// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

library Math {
  function avg(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = (a & b) + (a ^ b) / 2;
  }

  function min(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = ternary(a < b, a, b);
  }

  function max(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = ternary(a < b, b, a);
  }

  function ternary(
    bool condition,
    uint256 valueIfTrue,
    uint256 valueIfFalse
  ) internal pure returns (uint256 c) {
    assembly {
      c := add(valueIfFalse, mul(condition, sub(valueIfTrue, valueIfFalse)))
    }
  }
}
