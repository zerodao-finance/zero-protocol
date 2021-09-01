// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;

interface ICurveUnderlyingUInt256 {
	function get_dy_underlying(
		uint256,
		uint256,
		uint256
	) external view returns (uint256);

	function exchange_underlying(
		uint256,
		uint256,
		uint256,
		uint256
	) external returns (uint256);
}
