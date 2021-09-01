// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;

interface ICurveUInt128 {
	function get_dy(
		uint128,
		uint128,
		uint256
	) external view returns (uint256);

	function exchange(
		uint128,
		uint128,
		uint256,
		uint256
	) external returns (uint256);
}
