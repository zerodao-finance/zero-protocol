// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;
import {ICurvePool} from '../interfaces/ICurvePool.sol';
import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {ZeroCurveWrapper} from './ZeroCurveWrapper.sol';
import {ICurveInt128} from '../interfaces/CurvePools/ICurveInt128.sol';
import {ICurveInt256} from '../interfaces/CurvePools/ICurveInt256.sol';
import {ICurveUInt128} from '../interfaces/CurvePools/ICurveUInt128.sol';
import {ICurveUInt256} from '../interfaces/CurvePools/ICurveUInt256.sol';
import {ICurveUnderlyingInt128} from '../interfaces/CurvePools/ICurveUnderlyingInt128.sol';
import {ICurveUnderlyingInt256} from '../interfaces/CurvePools/ICurveUnderlyingInt256.sol';
import {ICurveUnderlyingUInt128} from '../interfaces/CurvePools/ICurveUnderlyingUInt128.sol';
import {ICurveUnderlyingUInt256} from '../interfaces/CurvePools/ICurveUnderlyingUInt256.sol';

import {console} from 'hardhat/console.sol';

contract ZeroCurveFactory {
	event CreateWrapper(address _wrapper);

	function createWrapper(
		bool _underlying,
		uint256 _tokenInIndex,
		uint256 _tokenOutIndex,
		address _pool
	) public {
		bytes4 exchangeSelector;
		bytes4 estimateSelector;
		bytes4 coinsSelector;
		if (_underlying) {
			(bool pool128, ) = address(_pool).staticcall(
				abi.encodeWithSelector(ICurveUnderlyingInt128.underlying_coins.selector, int128(0))
			);
			(bool pool256, ) = address(_pool).staticcall(
				abi.encodeWithSelector(ICurveUnderlyingInt256.underlying_coins.selector, int256(0))
			);
			(bool poolu128, ) = address(_pool).staticcall(
				abi.encodeWithSelector(ICurveUnderlyingUInt128.underlying_coins.selector, uint128(0))
			);
			(bool poolu256, ) = address(_pool).staticcall(
				abi.encodeWithSelector(ICurveUnderlyingUInt256.underlying_coins.selector, uint256(0))
			);
			console.log('Calculated');
			if (pool128) {
				console.log('int128');
				exchangeSelector = ICurveUnderlyingInt128.exchange_underlying.selector;
				estimateSelector = ICurveUnderlyingInt128.get_dy_underlying.selector;
				coinsSelector = ICurveUnderlyingInt128.underlying_coins.selector;
			} else if (pool256) {
				console.log('int256');
				exchangeSelector = ICurveUnderlyingInt256.exchange_underlying.selector;
				estimateSelector = ICurveUnderlyingInt256.get_dy_underlying.selector;
				coinsSelector = ICurveUnderlyingInt256.underlying_coins.selector;
			} else if (poolu128) {
				console.log('uint128');
				exchangeSelector = ICurveUnderlyingUInt128.exchange_underlying.selector;
				estimateSelector = ICurveUnderlyingUInt128.get_dy_underlying.selector;
				ICurveUnderlyingUInt128.underlying_coins.selector;
			} else if (poolu256) {
				console.log('uint256');
				exchangeSelector = ICurveUnderlyingUInt256.exchange_underlying.selector;
				estimateSelector = ICurveUnderlyingUInt256.get_dy_underlying.selector;
				coinsSelector = ICurveUnderlyingUInt256.underlying_coins.selector;
			}
		} else {
			(bool pool128, ) = address(_pool).staticcall(
				abi.encodeWithSelector(ICurveInt128.coins.selector, int128(0))
			);
			(bool pool256, ) = address(_pool).staticcall(
				abi.encodeWithSelector(ICurveInt256.coins.selector, int256(0))
			);
			(bool poolu128, ) = address(_pool).staticcall(
				abi.encodeWithSelector(ICurveUInt128.coins.selector, uint128(0))
			);
			(bool poolu256, ) = address(_pool).staticcall(
				abi.encodeWithSelector(ICurveUInt256.coins.selector, uint256(0))
			);
			if (pool128) {
				console.log('int128');
				exchangeSelector = ICurveInt128.exchange.selector;
				estimateSelector = ICurveInt128.get_dy.selector;
				coinsSelector = ICurveInt128.coins.selector;
			} else if (pool256) {
				console.log('int256');
				exchangeSelector = ICurveInt256.exchange.selector;
				estimateSelector = ICurveInt256.get_dy.selector;
				coinsSelector = ICurveInt256.coins.selector;
			} else if (poolu128) {
				console.log('uint128');
				exchangeSelector = ICurveUInt128.exchange.selector;
				estimateSelector = ICurveUInt128.get_dy.selector;
				coinsSelector = ICurveUInt128.coins.selector;
			} else if (poolu256) {
				console.log('uint256');
				exchangeSelector = ICurveUInt256.exchange.selector;
				estimateSelector = ICurveUInt256.get_dy.selector;
				coinsSelector = ICurveUInt256.coins.selector;
			}
			emit CreateWrapper(
				address(
					new ZeroCurveWrapper(
						_tokenInIndex,
						_tokenOutIndex,
						_pool,
						coinsSelector,
						estimateSelector,
						exchangeSelector
					)
				)
			);
		}
	}
}
