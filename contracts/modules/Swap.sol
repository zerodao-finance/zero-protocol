pragma solidity >=0.6.0;

import {SwapLib} from './SwapLib.sol';
import {SafeMath} from 'oz410/math/SafeMath.sol';
import {IUniswapV2Router02} from '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {SafeERC20} from 'oz410/token/ERC20/SafeERC20.sol';
import {IController} from '../interfaces/IController.sol';
import {console} from 'hardhat/console.sol';

contract Swap {
	using SafeERC20 for *;
	using SafeMath for *;
	mapping(uint256 => SwapLib.SwapRecord) public outstanding;
	address public immutable controller;
	address public immutable governance;
	uint256 public blockTimeout;
	address public constant fiat = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; //USDC
	address public constant wNative = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; //wETH
	address public constant want = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599; //wBTC
	address public constant router = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F; //Sushi V2
	address public constant controllerWant = 0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D; //renBTC

	constructor(address _controller) {
		controller = _controller;
		governance = IController(_controller).governance();
		IERC20(want).safeApprove(router, ~uint256(0));
		IERC20(fiat).safeApprove(router, ~uint256(0));
	}

	function setBlockTimeout(uint256 _ct) public {
		require(msg.sender == governance, '!governance');
		blockTimeout = _ct;
	}

	function defaultLoan(uint256 _nonce) public {
		require(blockTimeout >= _nonce, '!blockTimeout');
		require(outstanding[_nonce].qty != 0, '!outstanding');
		uint256 _amountSwapped = swapTokens(fiat, controllerWant, outstanding[_nonce].qty);
		IERC20(controllerWant).safeTransfer(controller, _amountSwapped);
		delete outstanding[_nonce];
	}

	function receiveLoan(
		address _to,
		address _asset,
		uint256 _actual,
		uint256 _nonce,
		bytes memory _data
	) public {
		uint256 amountSwapped = swapTokens(want, fiat, _actual);
		outstanding[_nonce] = SwapLib.SwapRecord({qty: amountSwapped, when: uint64(block.timestamp), token: _asset});
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
	) public {
		require(outstanding[_nonce].qty != 0, '!outstanding');
		IERC20(fiat).safeTransfer(_to, outstanding[_nonce].qty);
		delete outstanding[_nonce];
	}

	function computeReserveRequirement(uint256 _in) external view returns (uint256) {
		return _in.mul(uint256(1e17)).div(uint256(1 ether));
	}
}
