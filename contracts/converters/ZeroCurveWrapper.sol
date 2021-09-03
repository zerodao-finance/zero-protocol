// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;

import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {SafeERC20} from 'oz410/token/ERC20/SafeERC20.sol';
import {ICurvePool} from '../interfaces/ICurvePool.sol';
import {SafeMath} from 'oz410/math/SafeMath.sol';
import {console} from 'hardhat/console.sol';

contract ZeroCurveWrapper {
	uint256 public immutable tokenInIndex;
	uint256 public immutable tokenOutIndex;
	address public immutable tokenInAddress;
	address public immutable tokenOutAddress;
	address public immutable pool;
	bytes4 public immutable estimateSelector;
	bytes4 public immutable convertSelector;

	using SafeMath for uint256;
	using SafeERC20 for IERC20;

	constructor(
		uint256 _tokenInIndex,
		uint256 _tokenOutIndex,
		address _pool,
		bytes4 _coinsSelector,
		bytes4 _estimateSelector,
		bytes4 _convertSelector
	) {
		tokenInIndex = _tokenInIndex;
		tokenOutIndex = _tokenOutIndex;
		estimateSelector = _estimateSelector;
		convertSelector = _convertSelector;
		console.log('assigned inputs');
		(bool success1, bytes memory data1) = address(_pool).call(
			abi.encodeWithSelector(_coinsSelector, _tokenInIndex)
		);
		console.log('first call worked');
		require(success1, '!coins');
		(address _tokenInAddress) = abi.decode(data1, (address));
		tokenInAddress = _tokenInAddress;
		console.log('got token in address');
		(bool success2, bytes memory data2) = address(_pool).call(
			abi.encodeWithSelector(_coinsSelector, _tokenOutIndex)
		);
		require(success2, '!coins');
		tokenOutAddress = abi.decode(data2, (address));
		pool = _pool;
		IERC20(_tokenInAddress).safeApprove(_pool, type(uint256).max);
	}

	function estimate(uint256 _amount) public returns (uint256 result) {
		(bool success, bytes memory data) = pool.call(
			abi.encodeWithSelector(estimateSelector, tokenInIndex, tokenOutIndex, _amount)
		);
		require(success, '!success');
		result = abi.decode(data, (uint256));
	}

	function convert(address _module) external returns (uint256 _actualOut) {
		uint256 _balance = IERC20(tokenInAddress).balanceOf(address(this));
		uint256 _startOut = IERC20(tokenOutAddress).balanceOf(address(this));
		(bool success, bytes memory data) = pool.call(
			abi.encodeWithSelector(convertSelector, tokenInIndex, tokenOutIndex, _balance, 1)
		);
		require(success, '!success');
		uint256 _actualOut = IERC20(tokenOutAddress).balanceOf(address(this)) - _startOut;
		IERC20(tokenOutAddress).safeTransfer(msg.sender, _actualOut);
	}
}
