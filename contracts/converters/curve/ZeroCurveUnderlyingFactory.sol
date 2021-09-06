// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;
import {ICurvePool} from '../../interfaces/ICurvePool.sol';
import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {SafeERC20} from 'oz410/token/ERC20/SafeERC20.sol';
import {SafeMath} from 'oz410/math/SafeMath.sol';
import {ZeroCurveUnderlyingSignedWrapper} from './ZeroCurveUnderlyingSignedWrapper.sol';
import {ZeroCurveUnderlyingUnsignedWrapper} from './ZeroCurveUnderlyingUnsignedWrapper.sol';
import 'hardhat/console.sol';

interface IUnderlyingCoins {
	function underlying_coins(int128) external view returns (address);
}

contract ZeroCurveUnderlyingFactory {
	event CreateWrapper(address _wrapper);

	function createWrapper(
		int128 _tokenInIndex,
		int128 _tokenOutIndex,
		address _pool
	) public returns (address) {
		(bool success, ) = _pool.staticcall(
			abi.encodeWithSelector(IUnderlyingCoins.underlying_coins.selector, int128(-1))
		);
		console.log(_pool, success);
		if (success) {
			// Determine if signed112 or unsigned256
			ZeroCurveUnderlyingSignedWrapper wrapper = new ZeroCurveUnderlyingSignedWrapper(
				_tokenInIndex,
				_tokenOutIndex,
				_pool
			);
			emit CreateWrapper(address(wrapper));
			return address(wrapper);
		} else {
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
