// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import {SwapLib} from './SwapLib.sol';
import {SafeMath} from 'oz410/math/SafeMath.sol';
import {IUniswapV2Router02} from '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {SafeERC20} from 'oz410/token/ERC20/SafeERC20.sol';
import {IController} from '../interfaces/IController.sol';

contract Swap {
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
		IERC20(_want).safeApprove(_router, ~uint256(0)); // The router is now allowed to transfer max wBTC
		IERC20(_fiat).safeApprove(_router, ~uint256(0)); // The router is now allowed to transfer max USDC
	}

	function setBlockTimeout(uint256 _ct) public {
		require(msg.sender == governance, '!governance');
		blockTimeout = _ct;
	}

	// This function serves the purpose of letting the controller get the funds from a loan if does not get repaid within 10k blocks
	function defaultLoan(uint256 _nonce) public {
		require(block.number >= outstanding[_nonce].when + blockTimeout); // require that the block holding the SwapRecord is not the most recent in the chain
		require(outstanding[_nonce].qty != 0, '!outstanding'); // require the passed SwapRecord to still have some tokens be outstanding
		uint256 _amountSwapped = swapTokens(fiat, controllerWant, outstanding[_nonce].qty); // Actually swap however many tokens remain outstanding into renBTC
		IERC20(controllerWant).safeTransfer(controller, _amountSwapped); // Moves resulting renBTC from the contract to the controller's account
		delete outstanding[_nonce]; // delete the outstanding amount
	}

	function receiveLoan(
		address _to,
		address _asset,
		uint256 _actual,
		uint256 _nonce,
		bytes memory _data
	) public onlyController {
		uint256 amountSwapped = swapTokens(want, fiat, _actual); // swap `actual` amount of USDC into wBTC
		// After this the contract then has the wBTC received from the transfer
		outstanding[_nonce] = SwapLib.SwapRecord({qty: amountSwapped, when: uint64(block.timestamp), token: _asset});
		// created a SwapRecord with quantity equal to the amount of wBTC received, time of the current block, and a token of the passed in asset
	}

	function swapTokens(
		address _tokenIn,
		address _tokenOut,
		uint256 _amountIn
	) internal returns (uint256) {
		address[] memory _path = new address[](3);
		_path[0] = _tokenIn;
		_path[1] = wNative;
		_path[2] = _tokenOut;
		IERC20(_tokenIn).approve(router, _amountIn);
		uint256 _amountOut = IUniswapV2Router02(router).swapExactTokensForTokens(
			_amountIn,
			1,
			_path,
			address(this),
			block.timestamp
		)[_path.length - 1];
		return _amountOut;
	}

	function repayLoan(
		address _to,
		address _asset,
		uint256 _actualAmount,
		uint256 _nonce,
		bytes memory _data
	) public onlyController {
		require(outstanding[_nonce].qty != 0, '!outstanding'); // Require that there is an amount left on the loan
		IERC20(fiat).safeTransfer(_to, outstanding[_nonce].qty); // The contract's account transfers the oustanding amount to `_to`
		delete outstanding[_nonce]; // Delete the outstanding SwapRecord
	}

	function computeReserveRequirement(uint256 _in) external view returns (uint256) {
		return _in.mul(uint256(1e17)).div(uint256(1 ether));
	}
}
