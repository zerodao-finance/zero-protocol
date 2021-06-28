// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "oz410/token/ERC20/IERC20.sol";
import "oz410/math/SafeMath.sol";
import "oz410/utils/Address.sol";
import "oz410/token/ERC20/SafeERC20.sol";
import "../interfaces/IStrategy.sol";
import "../interfaces/IyVault.sol";
import {StrategyAPI} from "../interfaces/IStrategy.sol";
import {IController} from "../interfaces/IController.sol";
import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract StrategyRenVM {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    address public constant want =
        address(0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D);
    address public constant vault =
        address(0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E);
    string public constant name = "0confirmation RenVM Strategy";
    bool public constant isActive = true;

    address public constant router =
        address(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    address public constant weth =
        address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    address public constant usdc =
        address(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);

    uint256 public reserveRenBTC;
    uint256 public reserveETH;

    address public immutable controller;

    address[] public renBTCPath;
    address[] public wETHPath;
    address[] public wETHtoRenBTCPath;

    address public governance;
    address public strategist;

    modifier onlyController() {
        require(msg.sender == controller, "!controller");
        _;
    }

    constructor(address _controller) {
        governance = msg.sender;
        strategist = msg.sender;
        controller = _controller;

        renBTCPath[0] = want;
        renBTCPath[1] = weth;
        renBTCPath[2] = usdc;

        wETHPath[0] = weth;
        wETHPath[1] = usdc;

        wETHtoRenBTCPath[0] = weth;
        wETHtoRenBTCPath[1] = want;
    }

    function deposit() external virtual {
        uint256 _want = IERC20(want).balanceOf(address(this)); //amount of tokens we want
        if (_want > 0) {
            //TODO should be min threshold, shouldn't need to be 0
            IERC20(want).safeApprove(address(vault), 0);
            IERC20(want).safeApprove(address(vault), _want);
            IyVault(vault).deposit(_want);
        }
    }

    function withdraw(uint256 _amount) external virtual onlyController {
        IyVault(vault).withdraw(_amount);
        IERC20(want).transfer(address(controller), _amount);
    }

    function withdrawAll() external virtual onlyController {
        //TODO Not sure if this is correct methodology, test later
        uint256 _amount = IERC20(vault).balanceOf(address(this));
        IyVault(vault).withdraw(_amount);
        uint256 _eth = address(this).balance;
        //TODO do you approve for ETH?
        IUniswapV2Router02(router).swapExactETHForTokens(
            _eth,
            wETHtoRenBTCPath,
            address(controller),
            block.timestamp
        );
        IERC20(want).transfer(
            address(controller),
            IERC20(want).balanceOf(address(this))
        );
    }

    /*TODO remove this block below if not needed
    function tend() virtual override external {
        uint256 renBTCBalance = IERC20(renBTC).balanceOf(address(this));
        uint256 ethBalance = address(this).balance;

        uint256 wantRenBTC = renBTCBalance < reserveRenBTC ? reserveRenBTC - renBTCBalance : 0;
        uint256 wantETHinRenBTC = ethBalance < reserveETH ? IUniswapV2Router02(ROUTER).getAmountsIn(reserveETH - ethBalance, wETHtoRenBTCPath)[0] : 0;
        IyVault(vault).withdraw(wantRenBTC+wantETHinRenBTC);

        if (wantETHinRenBTC!=0) {
            require(IERC20(renBTC).approve(address(ROUTER), wantETHinRenBTC), 'approve failed.');
            uint256 expectedEthOut = reserveETH - ethBalance;
            IUniswapV2Router02(ROUTER).swapExactTokensForETH(wantETHinRenBTC, reserveETH - ethBalance, wETHtoRenBTCPath, address(this), block.timestamp+1);
        }
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
    */
}
