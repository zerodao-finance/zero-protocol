// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;
import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {SafeERC20} from 'oz410/token/ERC20/SafeERC20.sol';
import {SafeMath} from 'oz410/math/SafeMath.sol';
import { ZeroCurveUnderlyingSignedWrapper } from "./ZeroCurveUnderlyingSignedWrapper.sol";
import { ZeroCurveUnderlyingUnsignedWrapper } from "./ZeroCurveUnderlyingUnsignedWrapper.sol";
import 'hardhat/console.sol';

interface ICurvePool {
  function exchange_underlying(int128 i, int128 j, uint256 dx, uint256 min_dy) external view returns (uint256);
}


contract ZeroCurveUnderlyingFactory {
	event CreateWrapper(address _wrapper);

	function createWrapper(
		int128 _tokenInIndex,
		int128 _tokenOutIndex,
		address _pool
	) public returns (address) {
                (bool success, bytes memory result) = _pool.call(abi.encodeWithSelector(ICurvePool.exchange_underlying.selector, int128(0), int128(1), uint256(0), uint256(int256(-1))));
		if (success && result.length == 0x20) {
  		// Determine if signed112 or unsigned256
                		ZeroCurveUnderlyingSignedWrapper wrapper = new ZeroCurveUnderlyingSignedWrapper(_tokenInIndex, _tokenOutIndex, _pool);
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
