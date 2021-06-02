pragma solidity >=0.6.0;

import {SwapLib} from "./SwapLib.sol";
import {
    IUniswapV2Router02
} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract Swap {
    mapping(uint256 => SwapLib.SwapRecord) public outstanding;
    address public immutable controller;
    address public immutable governance;
    uint256 public blockTimeout;
    address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private constant RENBTC =
        0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D;
    address private constant ROUTER =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    constructor(address _controller) {
        controller = _controller;
        governance = IController(_controller).governance();
    }

    function setBlockTimeout(uint256 ct) public {
        require(msg.sender == governance, "!governance");
        blockTimeout = ct;
    }

    function defaultLoan(uint256 nonce) public {
        revert("Not Implemented");
    }

    function receiveLoan(
        address to,
        address asset,
        uint256 actual,
        uint256 nonce,
        bytes memory data
    ) public {
        //require(asset != controller, "
        require(asset == RENBTC, "!renbtc");
        address[] memory path = new address[](3);
        path[0] = RENBTC;
        path[1] = WETH;
        path[2] = USDC;

        IUniswapV2Router02 router = IUniswapV2Router02(ROUTER);
        require(RENBTC.approve(address(router), actual), "approve failed");
        uint256 minimumOut = router.getAmountsOut(actual, path)[2];
        uint256 actualAmountOut =
            router.swapExactTokensForTokens(
                actual,
                minimumOut,
                path,
                address(this),
                block.timestamp
            )[2]; // TODO add safety checks

        outstanding[nonce] = SwapLib.SwapRecord(
            actualAmountOut,
            block.timestamp,
            actual
        );
    }
}
