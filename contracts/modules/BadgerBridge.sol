// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import {SafeMath} from 'oz410/math/SafeMath.sol';
import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {SafeERC20} from 'oz410/token/ERC20/SafeERC20.sol';
import {IController} from '../interfaces/IController.sol';
import {ICurveETHUInt256} from '../interfaces/CurvePools/ICurveETHUInt256.sol';
import {IRenCrvArbitrum} from '../interfaces/CurvePools/IRenCrvArbitrum.sol';
import {IZeroModule} from '../interfaces/IZeroModule.sol';

contract BadgerBridge is IZeroModule {
	using SafeERC20 for IERC20;
	using SafeMath for *;
	address public immutable controller;
	address public immutable governance;
	uint256 public blockTimeout;
	address public constant renCrvArbitrum = 0x3E01dD8a5E1fb3481F0F589056b428Fc308AF0Fb;
	uint256 public feePercentage;

	modifier onlyController() {
		require(msg.sender == controller, '!controller');
		_;
	}

	constructor(address _controller) {
		controller = _controller;
		governance = IController(_controller).governance();
	}

	function setFeePercentage(uint256 _ct) public {
		require(msg.sender == governance, '!governance');
		feePercentage = _ct;
	}

	// to: address that the renbtc loan goes to
	// inToken: renbtc address
	// amount: renbtc amount
	// nonce: nonce
	// _data:
	//  address[] memory path: [inToken, outToken]
	//  amountIn: amount of inToken given
	//  recipient: recipient of the swap (?)
	//  data: callData
	function receiveLoan(
		address _to,
		address _inToken,
		uint256 _amount,
		uint256 _nonce,
		bytes memory _data
	) public override onlyController {
		IERC20(_inToken).safeApprove(renCrvArbitrum, ~uint256(0) >> 2);
		IERC20(_inToken).safeTransfer(_to, _amount);
	}

	function repayLoan(
		address, /* _to */
		address, /* _asset */
		uint256, /* _actualAmount */
		uint256 _nonce,
		bytes memory /* _data */
	) public override onlyController {
		// no-op
	}

	function computeReserveRequirement(uint256 _in) public pure override returns (uint256) {
		return _in.mul(uint256(12 ether)).div(uint256(10 ether));
	}
}
