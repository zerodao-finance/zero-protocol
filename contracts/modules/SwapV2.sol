// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts-new/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts-new/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts-new/token/ERC20/utils/SafeERC20.sol';
import {IGatewayRegistryV2 as IGatewayRegistry} from '../interfaces/IGatewayRegistryV2.sol';
import {IUniswapV2Router02} from '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import {IZeroModule} from '../interfaces/IZeroModule.sol';
import {IZeroController} from '../interfaces/IZeroController.sol';
import {SafeMath} from '@openzeppelin/contracts-new/utils/math/SafeMath.sol';
import {IyVaultV2} from '../interfaces/IyVaultV2.sol';

contract SwapV2 is IZeroModule, ReentrancyGuard {
	using SafeERC20 for IERC20;
	using SafeMath for *;

	uint256 public SUPPLEMENTARY_FEE = 100;
	uint256 public constant PERCENTAGE_DIVIDER = 100_000;

	IGatewayRegistry public immutable registry;
	address public immutable router;
	uint256 public immutable blockTimeout;
	address public constant weth = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
	address public constant sushiRouter = 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506;
	address public constant btcVault = 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506; // Idk what to actually use for this
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
		address[] memory path;
		uint256 amountIn;
		address recipient;
		bytes memory data;
		//decode data
		(path, amountIn, recipient, data) = abi.decode(_data, (address[], uint256, address, bytes));

		//set swapRecord params
		uint256 qtyFee = swapRecord.amountIn.mul(SUPPLEMENTARY_FEE).div(PERCENTAGE_DIVIDER);
		//deposit 0.01% renBTC fee received into the btcVault
		IyVaultV2(btcVault).deposit(qtyFee);
		//fetch resulting zeroBTC
		uint256 zeroBTCAmount = currentBalance(btcVault);
		//fetch underwriter
		address lockContract = IZeroController(msg.sender).lockFor(path[1]);
		//send zeroBtc to underwriter
		IyVaultV2(btcVault).harvest(lockContract, zeroBTCAmount);

		// handle trade execution
		if (IERC20(path[0]).allowance(address(this), router) < _amount) {
			IERC20(path[0]).approve(router, type(uint256).max);
		}

		uint256 currentDestTokenBalance = currentBalance(path[1]);
		// perform the swap
		IUniswapV2Router02(router).swapExactTokensForTokens(amountIn, 1, path, _to, block.timestamp + 1);
		uint256 qty = currentBalance(path[1]) - currentDestTokenBalance;
		emit Swap(_to, path[0], path[1], qty);
		if (data.length > 0) {
			//callback
			Address.functionCall{gas: 2e6}(recipient, data);
		}
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

	function computeReserveRequirement(uint256 _in) public pure override returns (uint256) {
		// @TODO: get back to this later while testing and determine if it actually does lock up 100% (lol)
		return _in;
	}

	function want() external view override returns (address _ret) {}
}
