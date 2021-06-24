// SPDX-License-Identifier: MIT
pragma solidity >= 0.6.0;

import "oz410/token/ERC20/IERC20.sol";
import "oz410/math/SafeMath.sol";
import "oz410/utils/Address.sol";
import "oz410/token/ERC20/SafeERC20.sol";
import "../interfaces/IStrategy.sol";
import "../interfaces/IyVault.sol";
import { StrategyAPI } from "../interfaces/IStrategy.sol";
import {
    IUniswapV2Router02
} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract StrategyRenVM is StrategyAPI {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;
    
    address public immutable yearnStrategyPool;
    uint256 public reserveRenBTC;
    uint256 public reserveETH;
    
    address[] public ethPath;
    address public immutable governance;
    address public constant renBTC = 0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D;
    address public constant wETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public constant ROUTER =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    address[] public renBTCPath;
    address[] public wETHPath;
    address[] public wETHtoRenBTCPath;
    
    
    modifier onlyGovernance() {
        require(msg.sender == governance, '!governance');
        _;
    }

    constructor(address _yearnStrategyPool, address _governance, address[] memory _renBTCPath, address[] memory _wETHPath, address[] memory _wETHtoRenBTCPath, uint256 _reserveRenBTC, uint256 _reserveETH) {
        yearnStrategyPool = _yearnStrategyPool;
        reserveRenBTC = _reserveRenBTC;
        renBTCPath = _renBTCPath;
        wETHPath = _wETHPath;
        wETHtoRenBTCPath = _wETHtoRenBTCPath;
        reserveETH = _reserveETH;
        governance = _governance;
    }

    function name() external virtual override view returns (string memory) {
        string memory name = "0confirmation RenVM Strategy";
        return name;
    }

    /*
    The address of the vault this strategy uses
    */
    function vault() external virtual override view returns (address) {
        return yearnStrategyPool;
    }

    /*
    Function returns the token address that the strategy wants
    */
    function want() external virtual override view returns (address) {
        return renBTC;
    }

    /*
    The current api version
    */
    function apiVersion() virtual override external pure returns (string memory) {
        string memory version = "1.0";
        return version;
    }

    function keeper() virtual override external view returns (address) {
        revert('Not Implemented');
    }

    function isActive() virtual override external view returns (bool) {
        return true;
    }

    function delegatedAssets() virtual override external view returns (uint256) {
        revert('Not Implemented');
    }

    function setMinimumRenBTC(uint256 want) virtual external onlyGovernance {
        reserveRenBTC = want;
    }

    function setMinimumETH(uint256 want) virtual external onlyGovernance {
        reserveETH = want;
    }

    function setRenBTCPath(address[] memory _renBTCPath) external onlyGovernance {
        renBTCPath = _renBTCPath;
    }

    function setWETHPath(address[] memory _wETHPath) external onlyGovernance {
        wETHPath = _wETHPath;
    }


    /*
    Estimate the total value of ren managed by the strategy
    */
    function estimatedTotalAssets() virtual override external view returns (uint256) {
        uint256 renBalance = IERC20(renBTC).balanceOf(address(this));
        uint256 renBTCValue = IUniswapV2Router02(ROUTER).getAmountsOut(renBalance, renBTCPath)[renBTCPath.length-1];

        uint256 ethBalance = address(this).balance;
        uint256 ethValue = IUniswapV2Router02(ROUTER).getAmountsOut(ethBalance, wETHPath)[wETHPath.length-1];

        return renBTCValue + ethValue;
    }

    /*
    If trigger should be called, will signal it to the keeper. Should not ever return same as harvestTrigger.
    */
    function tendTrigger(uint256 callCost) virtual override external view returns (bool) {
        bool criticalRenBTC = bool(IERC20(renBTC).balanceOf(address(this)) < reserveRenBTC);
        bool criticalETH = bool(address(this).balance < reserveETH);
        return !(criticalRenBTC || criticalETH);
    }

    function tend() virtual override external {
        uint256 renBTCBalance = IERC20(renBTC).balanceOf(address(this));
        uint256 ethBalance = address(this).balance;

        uint256 wantRenBTC = renBTCBalance < reserveRenBTC ? reserveRenBTC - renBTCBalance : 0;
        uint256 wantETHinRenBTC = ethBalance < reserveETH ? IUniswapV2Router02(ROUTER).getAmountsIn(reserveETH - ethBalance, wETHtoRenBTCPath)[0] : 0;
        IyVault(yearnStrategyPool).withdraw(wantRenBTC+wantETHinRenBTC);

        if (wantETHinRenBTC!=0) {
            require(IERC20(renBTC).approve(address(ROUTER), wantETHinRenBTC), 'approve failed.');
            uint256 expectedEthOut = reserveETH - ethBalance;
            IUniswapV2Router02(ROUTER).swapExactTokensForETH(wantETHinRenBTC, reserveETH - ethBalance, wETHtoRenBTCPath, address(this), block.timestamp+1);
        }
    }

    /*
    If harvest should be called, will signal it to keeper. Should not ever return same as tendTrigger.
    */
    function harvestTrigger(uint256 callCost) virtual override external view returns (bool) {
        return bool(IERC20(renBTC).balanceOf(address(this)) > reserveRenBTC);
    }

    function harvest() virtual override external {
        uint256 renBTCBalance = IERC20(renBTC).balanceOf(address(this));
        if (renBTCBalance > reserveRenBTC) {
            uint256 surplusRenBTC = renBTCBalance - reserveRenBTC;
            IyVault(yearnStrategyPool).deposit(surplusRenBTC);
        } else {
            revert('Nothing to harvest');
        }
    }

}
