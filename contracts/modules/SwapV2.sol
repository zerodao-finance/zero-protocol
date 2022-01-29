// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract SwapV2 {
	using SafeERC20 for *;
	using SafeMath for *;
	mapping(uint256 => SwapLib.SwapRecord) public outstanding;
	address public immutable controller;
	address public immutable governance;
	uint256 public blockTimeout;
	address public immutable fiat; //USDC
	address public immutable wNative; //wETH
	address public immutable want; //wBTC
	address public immutable router; //Sushi V2
	address public immutable controllerWant; // Controller want (renBTC)

	modifier onlyController() {
		require(msg.sender == controller, '!controller');
		_;
	}
