// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

import {yVault} from '../vendor/yearn/vaults/yVault.sol';
import {IERC20} from 'oz410/token/ERC20/ERC20.sol';

contract DummyVault is yVault {
	constructor(
		address _token,
		address _controller,
		string memory _name,
		string memory _symbol
	) yVault(_token, _controller, _name, _symbol) {}
}

contract DummyVault {
	address immutable want;
	constructor(address _want) {
		want = _want;
	}

	function estimateShares(uint256 _amount) external view returns (uint256) {
		return _amount;
	}

	function deposit(uint256 _amount) {
		IERC20(want).transferFrom(msg.sender, address(this), _amount);
		_mint(msg.sender, _amount);
	}

	function withdraw(uint256 _amount) {
		IERC20(address(this)).transferFrom(msg.sender, address(this), _amount);
		IERC20(want).transfer(msg.sender, _amount);
	}
}
