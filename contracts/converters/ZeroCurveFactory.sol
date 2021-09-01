// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;
import {ICurvePool} from '../interfaces/ICurvePool.sol';
import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {ZeroCurveWrapper} from './ZeroCurveWrapper.sol';

import {console} from 'hardhat/console.sol';

contract ZeroCurveFactory {
	event CreateWrapper(address _wrapper);

	function createWrapper(
		bool _underlying,
		int128 _tokenInIndex,
		int128 _tokenOutIndex,
		address _pool
	) public {
		bytes32 exchangeSelector;
		bytes32 estimateSelector;

		bytes4[] memory selectors = [
			ICurvePoolUnsignedUint256
		] 


		if (_underlying) {
			if (
				ICurvePool(_pool).staticcall(
					abi.encodeWithSelector(keccak256('underlying_coins(int128)')[:4], int128(0))
				)
			) {
				exchangeSelector = keccak256('get_dy_underlying(int128,int128,uint256)');
				estimateSelector = keccak256('exchange_underlying(int128,int128,uint256,uint256)');
			} else if (
				ICurvePool(_pool).staticcall(
					abi.encodeWithSelector(keccak256('underlying_coins(int256)')[:4], int256(0))
				)
			) {
				estimateSelector = keccak256('exchange_underlying(int128,int256,uint256,uint256)');
				exchangeSelector = keccak256('get_dy_underlying(int256,int256,uint256)');
			} else if (
				ICurvePool(_pool).staticcall(
					abi.encodeWithSelector(keccak256('underlying_coins(uint128)')[:4], uint128(0))
				)
			) {
				estimateSelector = keccak256('exchange_underlying(uint128,uint128,uint256,uint256)');
				exchangeSelector = keccak256('get_dy_underlying(uint128,uint128,uint256)');
			} else if (
				ICurvePool(_pool).staticcall(
					abi.encodeWithSelector(keccak256('underlying_coins(uint256)')[:4], uint256(0))
				)
			) {
				estimateSelector = keccak256('exchange_underlying(uint256,uint256,uint256,uint256)');
				exchangeSelector = keccak256('get_dy_underlying(uint256,uint256,uint256)');
			}
		} else {
			if (ICurvePool(_pool).staticcall(abi.encodeWithSelector(keccak256('coins(int128)')[:4], int128(0)))) {
				estimateSelector = keccak256('exchange(int128,int128,uint256,uint256)');
				exchangeSelector = keccak256('get_dy(int128,int128,uint256)');
			} else if (
				ICurvePool(_pool).staticcall(abi.encodeWithSelector(keccak256('coins(int256)')[:4], int256(0)))
			) {
				estimateSelector = keccak256('exchange(int256,int256,uint256,uint256)');
				exchangeSelector = keccak256('get_dy(int256,int256,uint256)');
			} else if (
				ICurvePool(_pool).staticcall(abi.encodeWithSelector(keccak256('coins(uint128)')[:4], uint128(0)))
			) {
				estimateSelector = keccak256('exchange(uint128,uint128,uint256,uint256)');
				exchangeSelector = keccak256('get_dy(uint128,uint128,uint256)');
			} else if (
				ICurvePool(_pool).staticcall(abi.encodeWithSelector(keccak256('coins(uint256)')[:4], uint256(0)))
			) {
				estimateSelector = keccak256('exchange(uint256,uint256,uint256,uint256)');
				exchangeSelector = keccak256('get_dy(uint256,uint256,uint256)');
			}
			emit CreateWrapper(
				address(
					new ZeroCurveWrapper(
						_tokenInIndex,
						_tokenOutIndex,
						_pool,
						estimateSelector[:4],
						exchangeSelector[:4]
					)
				)
			);
		}
	}
}
