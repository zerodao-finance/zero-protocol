pragma solidity >=0.6.0;

import {SwapLib} from "./SwapLib.sol";
import {SafeMath} from "oz410/math/SafeMath.sol";
import {
    IUniswapV2Router02
} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import { IERC20 } from "oz410/token/ERC20/IERC20.sol";
import { SafeERC20 } from "oz410/token/ERC20/SafeERC20.sol";
import { IController } from "../interfaces/IController.sol";

contract Swap {
    using SafeERC20 for *;
    using SafeMath for *;
    mapping(uint256 => SwapLib.SwapRecord) public outstanding;
    address public immutable controller;
    address public immutable governance;
    uint256 public blockTimeout;
    address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant RENBTC =
        0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D;
    address public constant ROUTER =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    constructor(address _controller) {
        controller = _controller;
        governance = IController(_controller).governance();
        IERC20(RENBTC).safeApprove(ROUTER, ~uint256(0));
        IERC20(USDC).safeApprove(ROUTER, ~uint256(0));
    }

    function setBlockTimeout(uint256 ct) public {
        require(msg.sender == governance, "!governance");
        blockTimeout = ct;
    }

    function defaultLoan(uint256 nonce) public {
        require(blockTimeout >= nonce, "!blockTimeout");
        require(outstanding[nonce].qty != 0, "!outstanding");
        //swap USDC back to RENBTC
        uint256 amountSwapped = swapTokens(USDC, RENBTC, outstanding[nonce].qty);
        delete outstanding[nonce];
    }

    function receiveLoan(
        address to,
        address asset,
        uint256 actual,
        uint256 nonce,
        bytes memory data
    ) public {
        require(asset == RENBTC, "!renbtc");
        uint256 amountSwapped = swapTokens(RENBTC, USDC, actual);
        outstanding[nonce] = SwapLib.SwapRecord({
            qty: amountSwapped,
            when: uint64(block.timestamp),
	          token: RENBTC
	      });
    }

    function swapTokens(address tokenIn, address tokenOut, uint256 amountIn) internal returns (uint256 amountOut) {
      address[] memory path = new address[](3);
      path[0] = tokenIn;
      path[1] = WETH;
      path[2] = tokenOut;
      amountOut = IUniswapV2Router02(ROUTER).swapExactTokensForTokens(amountIn, 1, path, address(this), block.timestamp)[path.length-1];
    }

    function repayLoan(
        address to,
        address asset,
        uint256 actualAmount,
        uint256 nonce,
        bytes memory data
    ) public {
        require(outstanding[nonce].qty != 0, "!outstanding");
        uint256 amountOwed = outstanding[nonce].qty;
        IERC20(asset).safeTransfer(to, amountOwed);
        delete outstanding[nonce];
    }

    function computeReserveRequirement(uint256 _in) external view returns (uint256) {
        return _in.mul(uint256(1e17)).div(uint256(1 ether));
    }


}
