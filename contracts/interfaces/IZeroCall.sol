pragma solidity >=0.7.0;

interface IZeroCall {
	function zeroCall(
		uint256 nonce,
		address module,
		bytes calldata data
	) external;
}
