// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

interface FeeDistribution {
    function claim_many(address[20] calldata) external returns (bool);

    function last_token_time() external view returns (uint256);

    function time_cursor() external view returns (uint256);

    function time_cursor_of(address) external view returns (uint256);
}
