// SPDX-License-Identifier: MIT
// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0;

interface VoteEscrow {
    function create_lock(uint256, uint256) external;

    function increase_amount(uint256) external;

    function withdraw() external;
}
