// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0;

interface dERC20 {
    function mint(address, uint256) external;

    function redeem(address, uint256) external;

    function getTokenBalance(address) external view returns (uint256);

    function getExchangeRate() external view returns (uint256);
}
