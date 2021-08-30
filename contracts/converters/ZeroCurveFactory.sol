// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;
import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {SafeERC20} from 'oz410/token/ERC20/SafeERC20.sol';
import {SafeMath} from 'oz410/math/SafeMath.sol';
import { ZeroCurveSignedWrapper } from "./ZeroCurveSignedWrapper.sol";
import { ZeroCurveUnsignedWrapper } from "./ZeroCurveUnsignedWrapper.sol";

interface ICurvePool {
  function exchange(int128 i, int128 j, uint256 dx, uint256 min_dy) external view returns (uint256);
}

contract ZeroCurveFactory {
	event CreateWrapper(address _wrapper);

	function createWrapper(
		int128 _tokenInIndex,
		int128 _tokenOutIndex,
		address _pool
	) public returns (address) {
		// Determine if signed112 or unsigned256
                (bool success, bytes memory result) = _pool.call(abi.encodeWithSelector(ICurvePool.exchange.selector, int128(0), int128(1), uint256(0), uint256(int256(-1))));
		if (result.length != 0) {
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

