// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.5.0;

interface IQuoter {
  function quote(
    address from,
    address to,
    uint256 amount
  ) external view returns (uint256);
}
