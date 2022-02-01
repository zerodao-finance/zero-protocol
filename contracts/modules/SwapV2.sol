// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '../interfaces/IGatewayRegistry.sol';
import {IUniswapV2Router02} from '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import {SafeMath} from 'oz410/math/SafeMath.sol';

contract VarenRouter is ReentrancyGuard {
	using SafeERC20 for IERC20;
	using SafeMath for *;

	uint256 public SUPPLEMENTARY_FEE = 0.01;
	uint256 public constant PERCENTAGE_DIVIDER = 100_000;

	IGatewayRegistry public immutable registry;
	address public immutable router;
	uint256 public immutable blockTimeout;
	address public constant weth = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
	address public constant sushiRouter = 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506;
	address public constant BTCVault = 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506; // Idk what to actually use for this
	// Events
	event Swap(address indexed sender, address indexed from, address indexed to, uint256 amount);
	address public immutable controller;

	constructor(
		address _controller,
		address _router,
		address _registry,
		uint256 _blockTimeout
	) {
		controller = _controller;
		router = _router;
		registry = IGatewayRegistry(_registry);
		blockTimeout = _blockTimeout;
	}

	modifier onlyController() {
		require(msg.sender == controller, '!controller');
		_;
	}

	function receiveLoan(
		address _to,
		address _inToken,
		uint256 _amount,
		uint256 _nonce,
		bytes memory _data
	) public onlyController {
		address[] memory path;
		uint256 amountIn;
		address recipient;
		bytes memory callData;
		bytes memory data;
		(path, amountIn, recipient, callData, data) = abi.decode(_data, (address, uint256, address, bytes));
		// else token is in the contract because of the minting process or the user sent ETH

		// Charge the fee
		uint256 onePercent = amountIn.mul(0.01);
		BTCVault.deposit(onePercent);
		uint256 zeroBTCAmount = currentBalance(BTCVault);

		// Saving ref to current balance of destination token to know how much was swapped
		uint256 currentDestTokenBalance = currentBalance(swapRecord.outToken);

		// Executing the swap
		if (IERC20(_inToken).allowance(address(this), router) < _amount) {
			IERC20(_inToken).approve(router, type(uint256).max);
		}
		// Swapping
		Address.functionCall(router, data);

		// How much was swapped
		qtySwapped = currentBalance(swapRecord.outToken) - currentDestTokenBalance;
		emit Swap(swapRecord.to, _inToken, swapRecord.outToken, _qtySwapped);
	}

	function repayLoan(
		address, /* _to */
		address, /* _asset */
		uint256, /* _actualAmount */
		uint256 _nonce,
		bytes memory /* _data */
	) public onlyController {
		this;
	}

	function swapTokens(
		address src,
		address to,
		uint256 qty
	) internal returns (uint256 amountSwappedBack) {
		address[] memory path = new address[](3);
		path[0] = src;
		path[1] = weth;
		path[2] = to;
		uint256[] memory amounts = IUniswapV2Router02(sushiRouter).swapExactTokensForTokens(
			qty,
			1,
			path,
			address(this),
			block.timestamp + 1
		);
		amountSwappedBack = amounts[amounts.length - 1];
	}

	function currentBalance(address _token) public view returns (uint256 balance) {
		balance = IERC20(_token).balanceOf(address(this));
	}

	function computeReserveRequirement(uint256 _in) public pure returns (uint256) {
		return _in.mul(1e17).div(uint256(1 ether));
	}

	receive() external payable {}
}
