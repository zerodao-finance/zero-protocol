// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;
import {ICurvePool} from '../../interfaces/ICurvePool.sol';
import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {SafeERC20} from 'oz410/token/ERC20/SafeERC20.sol';
import {SafeMath} from 'oz410/math/SafeMath.sol';
import {ZeroCurveSignedWrapper} from './ZeroCurveSignedWrapper.sol';
import {ZeroCurveUnsignedWrapper} from './ZeroCurveUnsignedWrapper.sol';

interface ICurvePoolSigned {
	function coins(int128) external view returns (address);
}

contract ZeroCurveFactory {
	event CreateWrapper(address _wrapper);

	function createWrapper(
		int128 _tokenInIndex,
		int128 _tokenOutIndex,
		address _pool
	) public returns (address) {
		// Determine if signed112 or unsigned256
		(bool success, ) = _pool.staticcall(abi.encodeWithSelector(ICurvePoolSigned.coins.selector, int128(0)));
		if (success) {
			ZeroCurveSignedWrapper wrapper = new ZeroCurveSignedWrapper(_tokenInIndex, _tokenOutIndex, _pool);
			emit CreateWrapper(address(wrapper));
			return address(wrapper);
		} else {
			ZeroCurveUnsignedWrapper wrapper = new ZeroCurveUnsignedWrapper(
				uint256(_tokenInIndex),
				uint256(_tokenOutIndex),
				_pool
			);
			emit CreateWrapper(address(wrapper));
			return address(wrapper);
		}
	}
}
