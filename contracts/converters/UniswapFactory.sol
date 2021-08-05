// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;
import {IUniswapV2Router02} from '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import {IERC20} from 'oz410/token/ERC20/IERC20.sol';
import {SafeMath} from 'oz410/math/SafeMath.sol';

contract ZeroUniswapFactory {
	ZeroUniswapWrapper[] wrappers;
	address public immutable router;

	constructor(address _router) {
		router = _router;
	}

	function createWrapper(address[] memory _path) public {
		ZeroUniswapWrapper wrapper = new ZeroUniswapWrapper(router, _path);
		wrappers.push(wrapper);
	}
}

contract ZeroUniswapWrapper {
	address[] public immutable path;
	address public immutable router;

    using SafeMath for uint256;

	constructor(address _router, address[] memory _path) {
		router = _router;
		path = _path;
	}

	function estimate(uint256 _amount) public returns (uint256) {
        if (path[0] == address(0x0)) {
            return IUniswapV2Router02(router).getAmountsOut(_amount, path[1:])[path.length-2];
        } else if(path[path.length-1] == address(0x0)){
            return IUniswapV2Router02(router).getAmountsOut(_amount, path[:path.length-1])[path.length-2];
        } else {
            return IUniswapV2Router02(router).getAmountsOut(_amount, path)[path.length - 1];
        }
	}

	function convert(address _module) external payable returns (uint256) {
        if (path[0] == address(0x0)) {
            // Then the input token is Ether, not ERC20
            uint256 _balance = address(this).balance;
            uint256 _minOut = estimate(_balance).sub(1); //Subtract one for minimum in case of rounding errors
            IUniswapV2Router02(router).swapExactETHForTokensSupportingFeeOnTransferTokens(_minOut, path[1:], msg.sender, block.timestamp);
            uint256 _actualOut = IERC20(path[path.length-1]).balanceOf(address(this));
            IERC20(path[path.length-1]).transfer(msg.sender, _actualOut);
            return _actualOut;
        } else if (path[path.length-1] == address(0x0)) {
            // Then the output token is Ether, not ERC20
            uint256 _balance = IERC20(path[0]).balanceOf(address(this));
            require(IERC20(path[0]).approve(address(router), _balance), 'approve failed');
            uint256 _minOut = estimate(_balance).sub(1); //Subtract one for minimum in case of rounding errors
            IUniswapV2Router02(router).swapExactTokensForETH(_balance, _minOut, path, msg.sender, block.timestamp);
            uint256 _actualOut = address(this).balance;
            msg.sender.send(_actualOut);
            return _actualOut;
        } else {
            // Then the input and output tokens are both ERC20
		    uint256 _balance = IERC20(path[0]).balanceOf(address(this));
		    require(IERC20(path[0]).approve(address(router), _balance), 'approve failed.');
		    uint256 _minOut = estimate(_balance).sub(1); //Subtract one for minimum in case of rounding errors
		    uint256 _actualOut = IUniswapV2Router02(router).swapExactTokensForTokens(_balance, _minOut, path, msg.sender, block.timestamp);
            IERC20(path[path.length-1]).transfer(msg.sender, _actualOut);
            return _actualOut;
	    }
    }
}
