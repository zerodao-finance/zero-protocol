// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;
import {IUniswapV2Router02} from '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {SafeMath} from 'oz410/math/SafeMath.sol';

contract ZeroUniswapFactory {
	ZeroUniswapWrapper[] wrappers;
	address public immutable router;

	constructor(address _router) {
		router = _router;
	}

	function createWrapper(address[] _path) {
		ZeroUniswapWrapper wrapper = new ZeroUniswapWrapper(router, _path);
		wrappers.push(wrapper);
	}
}

contract ZeroUniswapWrapper {
	address[] public immutable path;
	address public immutable router;

	constructor(address _router, address[] _path) {
		router = _router;
		path = _path;
	}

	function estimate(uint256 _amount) public returns (uint256) {
		return IUniswapV2Router02(router).getAmountsOut(_amount, path)[path.length - 1];
	}

	function convert(address _module) external returns (uint256) {
		uint256 _balance = IERC20(path[0]).balanceOf(address(this));
		require(IERC20(path[0]).safeApprove(address(router), _balance), 'approve failed.');
		uint256 _minOut = estimate(_balance).sub(1); //Subtract one for minimum in case of rounding errors
		return
			IUniswapV2Router02(router).swapExactTokensForTokens(_balance, _minOut, path, msg.sender, block.timestamp);
	}
}
