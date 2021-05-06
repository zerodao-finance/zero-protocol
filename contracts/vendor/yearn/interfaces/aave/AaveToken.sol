// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

interface AaveToken {
    function underlyingAssetAddress() external view returns (address);
}
