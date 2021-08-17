// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;
import {ICurvePool} from '../interfaces/ICurvePool.sol';
import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {SafeERC20} from 'oz410/token/ERC20/SafeERC20.sol';
import {SafeMath} from 'oz410/math/SafeMath.sol';
import { ZeroCurveUnderlyingSignedWrapper } from "./ZeroCurveUnderlyingSignedWrapper.sol";
import { ZeroCurveUnderlyingUnsignedWrapper } from "./ZeroCurveUnderlyingUnsignedWrapper.sol";
import 'hardhat/console.sol';

contract ZeroCurveUnderlyingFactory {
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
