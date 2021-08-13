// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;
import {ICurvePool} from '../interfaces/ICurvePool.sol';
import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {SafeERC20} from 'oz410/token/ERC20/SafeERC20.sol';
import {SafeMath} from 'oz410/math/SafeMath.sol';
import 'hardhat/console.sol';

contract ZeroCurveFactory {
	event CreateWrapper(address _wrapper);

	function createWrapper(
		int128 _tokenInIndex,
		int128 _tokenOutIndex,
		address _pool
	) public returns (address) {
		// Determine if signed112 or unsigned256
		try new ZeroCurveUnderlyingSignedWrapper(_tokenInIndex, _tokenOutIndex, _pool) returns (
			ZeroCurveUnderlyingSignedWrapper wrapper
		) {
			emit CreateWrapper(address(wrapper));
			return address(wrapper);
		} catch {
			ZeroCurveUnderlyingUnsignedWrapper wrapper = new ZeroCurveUnderlyingUnsignedWrapper(
				uint256(_tokenInIndex),
				uint256(_tokenOutIndex),
				_pool
			);
			emit CreateWrapper(address(wrapper));
			return address(wrapper);
		}
	}
}

contract ZeroCurveUnderlyingSignedWrapper {
	int128 public immutable tokenInIndex;
	int128 public immutable tokenOutIndex;
	address public immutable tokenInAddress;
	address public immutable tokenOutAddress;
	address public immutable pool;

	using SafeMath for uint256;
	using SafeERC20 for IERC20;

	constructor(
		int128 _tokenInIndex,
		int128 _tokenOutIndex,
		address _pool
	) {
		tokenInIndex = _tokenInIndex;
		tokenOutIndex = _tokenOutIndex;
		address _tokenInAddress = ICurvePool(_pool).underlying_coins(_tokenInIndex);
		tokenInAddress = _tokenInAddress;
		tokenOutAddress = ICurvePool(_pool).underlying_coins(_tokenOutIndex);
		pool = _pool;
		IERC20(_tokenInAddress).safeApprove(_pool, type(uint256).max);
	}

	function estimate(uint256 _amount) public returns (uint256 result) {
		result = ICurvePool(pool).get_dy_underlying(tokenInIndex, tokenOutIndex, _amount);
	}

	function convert(address _module) external returns (uint256) {
		uint256 _balance = IERC20(tokenInAddress).balanceOf(address(this));
		uint256 _startOut = IERC20(tokenOutAddress).balanceOf(address(this));
		ICurvePool(pool).exchange_underlying(tokenInIndex, tokenOutIndex, _balance, 1);
		uint256 _actualOut = IERC20(tokenOutAddress).balanceOf(address(this)) - _startOut;
		IERC20(tokenOutAddress).safeTransfer(msg.sender, _actualOut);
		return _actualOut;
	}
}

contract ZeroCurveUnderlyingUnsignedWrapper {
	uint256 public immutable tokenInIndex;
	uint256 public immutable tokenOutIndex;
	address public immutable tokenInAddress;
	address public immutable tokenOutAddress;
	address public immutable pool;

	using SafeMath for uint256;
	using SafeERC20 for IERC20;

	constructor(
		uint256 _tokenInIndex,
		uint256 _tokenOutIndex,
		address _pool
	) {
		tokenInIndex = _tokenInIndex;
		tokenOutIndex = _tokenOutIndex;
		address _tokenInAddress = tokenInAddress = ICurvePool(_pool).underlying_coins(_tokenInIndex);
		tokenOutAddress = ICurvePool(_pool).underlying_coins(_tokenOutIndex);
		pool = _pool;
		IERC20(_tokenInAddress).safeApprove(_pool, type(uint256).max);
	}

	function estimate(uint256 _amount) public returns (uint256 result) {
		result = ICurvePool(pool).get_dy_underlying(tokenInIndex, tokenOutIndex, _amount);
	}

	function convert(address _module) external returns (uint256) {
		uint256 _balance = IERC20(tokenInAddress).balanceOf(address(this));
		uint256 _startOut = IERC20(tokenOutAddress).balanceOf(address(this));
		ICurvePool(pool).exchange_underlying(tokenInIndex, tokenOutIndex, _balance, 1);
		uint256 _actualOut = IERC20(tokenOutAddress).balanceOf(address(this)) - _startOut;
		IERC20(tokenOutAddress).safeTransfer(msg.sender, _actualOut);
		return _actualOut;
	}
}
