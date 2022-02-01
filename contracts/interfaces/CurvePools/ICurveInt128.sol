// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0<0.8.0;

interface ICurveInt128 {
	function get_dy(
		int128,
		int128,
		uint256
	) external view returns (uint256);

	function exchange(
		int128,
		int128,
		uint256,
		uint256
	) external returns (uint256);

	function coins(int128) external view returns (address);
}
