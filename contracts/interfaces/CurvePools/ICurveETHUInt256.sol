pragma solidity >=0.6.0<0.8.0;

interface ICurveETHUInt256 {
	/**
	
	*/
	function exchange(
		uint256 i, // Pool for swap
		uint256 j, // Address of the coin being sent
		uint256 dx, // Address of the coin being received
		uint256 min_dy, // Minimum quantity of _to to get the transaction to succeed
		bool use_eth // Address to transfer the received tokens to
	) external payable returns (uint256);
}
