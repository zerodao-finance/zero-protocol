// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

interface OracleSecurityModule {
    function peek() external view returns (bytes32, bool);

    function peep() external view returns (bytes32, bool);

    function bud(address) external view returns (uint256);
}
