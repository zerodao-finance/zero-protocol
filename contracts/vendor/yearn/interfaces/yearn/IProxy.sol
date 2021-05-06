// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0;

interface IProxy {
    function execute(
        address to,
        uint256 value,
        bytes calldata data
    ) external returns (bool, bytes memory);

    function increaseAmount(uint256) external;
}
