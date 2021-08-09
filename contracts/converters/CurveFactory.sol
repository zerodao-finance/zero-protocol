// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;
import {ICurvePool} from '../interfaces/ICurvePool.sol';
import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {SafeMath} from 'oz410/math/SafeMath.sol';

contract ZeroCurveFactory {
	ZeroCurveWrapper[] wrappers;

	function createWrapper(
		int128 _tokenInIndex,
		int128 _tokenOutIndex,
		address _pool
	) public {
		ZeroCurveWrapper wrapper = new ZeroCurveWrapper(_tokenInIndex, _tokenOutIndex, _pool);
		wrappers.push(wrapper);
	}
}

contract ZeroCurveWrapper {
	int128 public immutable tokenInIndex;
	int128 public immutable tokenOutIndex;
	address public immutable tokenInAddress;
	address public immutable tokenOutAddress;
	address public immutable pool;

	using SafeMath for uint256;

	constructor(
		int128 _tokenInIndex,
		int128 _tokenOutIndex,
		address _pool
	) {
		tokenInIndex = _tokenInIndex;
		tokenOutIndex = _tokenOutIndex;
		tokenInAddress = ICurvePool(_pool).coins(_tokenInIndex);
		tokenOutAddress = ICurvePool(_pool).coins(_tokenOutIndex);
		pool = _pool;
	}

	function estimate(uint256 _amount) public returns (uint256 result) {
          (bool success, bytes memory revertData) =  address(this).call(abi.encodeWithSelector(this._estimate.selector, _amount));
	  require(!success, "unexpected: internal call to _estimate must revert");
	  (result) = abi.decode(revertData, (uint256));
	}
	function _estimate(uint256 _amount) public {
          require(address(this) == msg.sender, "must be called by self");
	  uint256 actualOut = ICurvePool(pool).exchange(tokenInIndex, tokenOutIndex, _amount, 1);
	  bytes memory result = abi.encode(actualOut);
	  assembly {
            revert(add(0x20, result), mload(result))
	  }
	}
	function convert(address _module) external returns (uint256) {
		uint256 _balance = IERC20(tokenInAddress).balanceOf(address(this));
		uint256 _minOut = estimate(_balance).sub(1); //Subtract one for minimum in case of rounding errors
		uint256 _actualOut = ICurvePool(pool).exchange(tokenInIndex, tokenOutIndex, _balance, _minOut);
		IERC20(tokenOutAddress).transfer(msg.sender, _actualOut);
		return _actualOut;
	}
}
