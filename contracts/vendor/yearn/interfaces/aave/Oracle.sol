// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

interface Oracle {
    function getAssetPrice(address reserve) external view returns (uint256);

    function latestAnswer() external view returns (uint256);
}
