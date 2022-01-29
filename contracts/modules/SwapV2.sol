// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;

import {SwapLib} from './SwapLib.sol';
import {SafeMath} from 'oz410/math/SafeMath.sol';
import {IUniswapV2Router02} from '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {SafeERC20} from 'oz410/token/ERC20/SafeERC20.sol';
import {IController} from '../interfaces/IController.sol';

contract SwapV2 {
	using SafeERC20 for *;
	using SafeMath for *;
	mapping(uint256 => SwapLib.SwapRecord) public outstanding;
	address public immutable controller;
	address public immutable governance;
	uint256 public blockTimeout;
	address public immutable fiat; //USDC
	address public immutable wNative; //wETH
	address public immutable want; //wBTC
	address public immutable router; //Sushi V2
	address public immutable controllerWant; // Controller want (renBTC)

	modifier onlyController() {
		require(msg.sender == controller, '!controller');
		_;
	}

	constructor(
		address _controller,
		address _wNative,
		address _want,
		address _router,
		address _fiat,
		address _controllerWant
	) {
		controller = _controller;
		wNative = _wNative;
		want = _want;
		router = _router;
		fiat = _fiat;
		controllerWant = _controllerWant;
		governance = IController(_controller).governance();
		IERC20(_want).safeApprove(_router, ~uint256(0));
		IERC20(_fiat).safeApprove(_router, ~uint256(0));
	}

	function receiveLoan(
		address _to,
		address _asset,
		uint256 _actual,
		uint256 _nonce,
		bytes memory _data
	) public onlyController {
		uint256 amountSwapped = swapTokens(want, fiat, _actual);
		outstanding[_nonce] = SwapLib.SwapRecord({qty: amountSwapped, when: uint64(block.timestamp), token: _asset});
	}

	function repayLoan(
		address _to,
		address _asset,
		uint256 _actualAmount,
		uint256 _nonce,
		bytes memory _data
	) public onlyController {
		require(outstanding[_nonce].qty != 0, '!outstanding');
		IERC20(fiat).safeTransfer(_to, outstanding[_nonce].qty);
		delete outstanding[_nonce];
	}
}
