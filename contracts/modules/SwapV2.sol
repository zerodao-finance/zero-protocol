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

	uint256 public SUPPLEMENTARY_FEE = 1000;
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
	struct SwapRecord {
		address to;
		address inToken;
		address outToken;
		address recipient;
		uint256 amountIn;
		uint256 when;
		uint256 qty;
		uint256 qtyFee;
		bytes burnSendTo;
		uint256 amount;
	}
	mapping(uint256 => SwapRecord) public records;

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
	) public override onlyController {
		SwapRecord memory swapRecord;
		swapRecord.when = block.number;
		swapRecord.to = _to;
		swapRecord.amount = _amount;
		address[] memory path;
		bytes memory data;
		(path, swapRecord.amountIn, swapRecord.recipient, data) = abi.decode(
			_data,
			(address[], uint256, address, bytes)
		);
		// else token is in the contract because of the minting process or the user sent ETH

		swapRecord.inToken = path[0];
		swapRecord.outToken = path[1];
		swapRecord.when = block.timestamp;
		// Charge the fee
		swapRecord.qtyFee = swapRecord.amountIn.mul(SUPPLEMENTARY_FEE).div(PERCENTAGE_DIVIDER);
		IyVaultV2(btcVault).deposit(swapRecord.qtyFee);
		uint256 zeroBTCAmount = currentBalance(btcVault);
		address lockContract = IZeroController(msg.sender).lockFor(swapRecord.to);
		// send resulting zerobtc to underwriter - very unsure about this one
		IERC20(btcVault).transferFrom(swapRecord.to, lockContract, zeroBTCAmount);

		// Saving ref to current balance of destination token to know how much was swapped

		// Executing the swap
		if (IERC20(swapRecord.inToken).allowance(address(this), router) < _amount) {
			IERC20(swapRecord.inToken).approve(router, type(uint256).max);
		}
		// Swapping and calling the router if theres any data
		if (data.length != 0) {
			Address.functionCall(router, data);
		} else {
			// @TODO: write this out
			//data = abi.encode()
		}

		uint256 currentDestTokenBalance = currentBalance(swapRecord.outToken);

		// How much was swapped
		swapRecord.qty = currentBalance(swapRecord.outToken) - currentDestTokenBalance;
		records[_nonce] = swapRecord;
		emit Swap(swapRecord.to, swapRecord.inToken, swapRecord.outToken, swapRecord.qty);
	}

	function repayLoan(
		address, /* _to */
		address, /* _asset */
		uint256, /* _actualAmount */
		uint256 _nonce,
		bytes memory /* _data */
	) public override onlyController {
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

	function computeReserveRequirement(uint256 _in) public pure override returns (uint256) {
		// @TODO: get back to this later while testing and determine if it actually does lock up 100% (lol)
		return _in;
	}

	receive() external payable {}

	function want() external view override returns (address _ret) {}
}
