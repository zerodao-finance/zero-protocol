pragma solidity >= 0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../vendor/yearn/interfaces/yearn/IStrategy.sol";
import { StrategyAPI } from "../interfaces/StrategyAPI.sol";
import {
    IUniswapV2Router02
} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract StrategyRenVM is StrategyAPI {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;
    
    address public immutable yearnStrategyPool;
    uint256 public reserveRenBTC;
    uint256 public reserveWETH;
    address public immutable governance;
    address public constant renBTC = 0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D;
    address public constant wETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public constant ROUTER =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    modifier onlyGovernance() {
        require(msg.sender == governance, '!governance');
        _;
    }

    constructor(address _yearnStrategyPool, address _governance, uint256 _reserveRenBTC, uint256 _reserveWETH) {
        yearnStrategyPool = _yearnStrategyPool;
        reserveRenBTC = _reserveRenBTC;
        reserveWETH = _reserveWETH;
        governance = _governance;
    }

    function name() external view returns (string memory) {
        revert('Not Implemented');
    }

    function vault() external view returns (address) {
        revert('Not Implemented');
    }

    function want() external view returns (address) {
        revert('Not Implemented');
    }

    function apiVersion() external pure returns (string memory) {
        revert('Not Implemented');
    }

    function keeper() external view returns (address) {
        revert('Not Implemented');
    }

    function isActive() external view returns (bool) {
        return true;
    }

    function delegatedAssets() external view returns (uint256) {
        revert('Not Implemented');
    }

    function setMinimumRenBTC(uint256 want) external onlyGovernance {
        reserveRenBTC = want;
    }

    function setMinimumWETH(uint256 want) external onlyGovernance {
        reserveWETH = want;
    }

    /*
    Estimate the total assets managed by this strategy.
    */
    function estimatedTotalAssets() external view returns (uint256) {
        uint256 renBalance = IERC20(renBTC).balanceOf(address(this));
        uint256 wETHBalance = IERC20(wETH).balanceOf(address(this));
        address[] memory renBTCPath = new address[](3);
        renBTCPath[0] = renBTC;
        renBTCPath[1] = wETH;
        renBTCPath[2] = USDC;
        address[] memory wETHPath = new address[](2);
        wETHPath[0] = wETH;
        wETHPath[1] = USDC;
        uint256 renBTCValue = IUniswapV2Router02(ROUTER).getAmountsOut(renBalance, renBTCPath)[renBTCPath.length-1];
        uint256 wETHValue = IUniswapV2Router02(ROUTER).getAmountsOut(wETHBalance, wETHPath)[wETHPath.length-1];
        //TODO add calculation for vault assets
        return renBTCValue + wETHValue;
    }

    /*
    If trigger should be called, will signal it to the keeper. Should not ever return same as harvestTrigger.
    */
    function tendTrigger(uint256 callCost) external view returns (bool) {
        return bool(IERC20(renBTC).balanceOf(address(this)) < reserveRenBTC || IERC20(wETH).balanceOf(address(this)) < reserveWETH);
    }

    function tend() external {
        uint256 renBalance = IERC20(renBTC).balanceOf(address(this));
        uint256 wETHBalance = IERC20(wETH).balanceOf(address(this));
        revert('Not Implemented');
    }

    /*
    If harvest should be called, will signal it to keeper. Should not ever return same as tendTrigger.
    */
    function harvestTrigger(uint256 callCost) external view returns (bool) {
        return bool(IERC20(renBTC).balanceOf(address(this)) > reserveRenBTC || IERC20(wETH).balanceOf(address(this)) > reserveWETH);
    }

    function harvest() external {
        uint256 renBalance = IERC20(renBTC).balanceOf(address(this));
        uint256 wETHBalance = IERC20(wETH).balanceOf(address(this));
        revert('Not Implemented');
    }

}