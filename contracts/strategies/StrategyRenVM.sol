// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import 'oz410/token/ERC20/IERC20.sol';
import 'oz410/math/SafeMath.sol';
import 'oz410/utils/Address.sol';
import 'oz410/token/ERC20/SafeERC20.sol';
import '../interfaces/IStrategy.sol';
import '../interfaces/IyVault.sol';
import {StrategyAPI} from '../interfaces/IStrategy.sol';
import {IController} from '../interfaces/IController.sol';
import {IUniswapV2Router02} from '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import {ICurvePool} from '../interfaces/ICurvePool.sol';
import {console} from 'hardhat/console.sol';

contract StrategyRenVM {
	using SafeERC20 for IERC20;
	using Address for address;
	using SafeMath for uint256;

	address public constant sBTCPool = 0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714;
	int128 public constant renbtcIndex = 0;
	int128 public constant wbtcIndex = 1;

	address public constant want = address(0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D);
	address public constant vault = address(0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E);
	string public constant name = '0confirmation RenVM Strategy';
	bool public constant isActive = true;

	address public constant vaultWant = address(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599);

	uint256 public reserveRenBTC;
	uint256 public reserveETH;

	uint256 public constant reserve = 200000000;

	address public immutable controller;

	address public governance;
	address public strategist;

	modifier onlyController() {
		require(msg.sender == controller, '!controller');
		_;
	}

	constructor(address _controller) {
		governance = msg.sender;
		strategist = msg.sender;
		controller = _controller;
	}

	function deposit() external virtual {
		uint256 _want = IERC20(want).balanceOf(address(this)); //amount of tokens we want
		console.log('Currently have', _want);
		if (_want > reserve) {
			uint256 _overflow = _want.sub(reserve);
			//TODO should be min threshold, not hard coded

			uint256 _amountOut = ICurvePool(sBTCPool).get_dy(renbtcIndex, wbtcIndex, _overflow).sub(1);
			IERC20(want).safeApprove(address(sBTCPool), _overflow);
			ICurvePool(sBTCPool).exchange(renbtcIndex, wbtcIndex, _overflow, _amountOut);
			uint256 _actualOut = _amountOut;

			IERC20(vaultWant).safeApprove(address(vault), _actualOut);
			IyVault(vault).deposit(_actualOut);
			uint256 estimatedShares = IyVault(vault).pricePerShare().mul(_actualOut).div(10**8);
		}
	}

	function _withdraw(uint256 _amount) private returns (uint256) {
		// _amount is the number of renBTC we would like.
		uint256 _vaultWant = ICurvePool(sBTCPool).get_dy(wbtcIndex, renbtcIndex, _amount);
		// _vaultWant is the number of wBTC we would need.

		uint256 _shares = estimateShares(_vaultWant);
		IyVault(vault).withdraw(_shares);
		IERC20(vaultWant).safeApprove(sBTCPool, _vaultWant);
		uint256 _amountOut = ICurvePool(sBTCPool).get_dy(wbtcIndex, renbtcIndex, _vaultWant).sub(1);
		ICurvePool(sBTCPool).exchange(wbtcIndex, renbtcIndex, _vaultWant, _amountOut);
		return _amountOut;
	}

	function withdraw(uint256 _amount) external virtual onlyController {
		uint256 _amountOut = _withdraw(_amount);
		IERC20(want).transfer(address(controller), _amountOut);
	}

	function withdrawAll() external virtual onlyController {
		uint256 _amount = IERC20(vault).balanceOf(address(this));
		_withdraw(_amount);
	}

	function balanceOf() external view virtual returns (uint256) {
		return IyVault(vault).balanceOf(address(this));
		//return IyVault(vault).balanceOf(address(this)).add(IERC20(want).balanceOf(address(this))); TODO uncomment
	}

	function estimateShares(uint256 _amount) internal virtual returns (uint256) {
		return _amount.mul(10**8).div(IyVault(vault).pricePerShare());
	}

	function permissionedSend(address _module, uint256 _amount) external virtual onlyController returns (uint256) {
		//Sends _amount of renBTC to _module.
		uint256 _reserve = IERC20(want).balanceOf(address(this));
		if (_amount > _reserve) {
			uint256 _deficit = _amount.sub(_reserve);
			uint256 _actualAmount = _withdraw(_deficit);
			IERC20(want).safeTransfer(_module, _reserve.add(_actualAmount));
			return _reserve.add(_actualAmount);
		} else {
			IERC20(want).safeTransfer(_module, _amount);
			return _amount;
		}
	}
}
