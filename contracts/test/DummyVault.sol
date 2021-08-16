// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import {yVault} from '../vendor/yearn/vaults/yVault.sol';

contract DummyVault {
	address public want;

	constructor(address _want) {
		want = _want;
	}

	function pricePerShare() external view virtual returns (uint256) {
		return uint256(10**8);
	}

	function deposit(uint256 _amount) external virtual returns (uint256) {
		IERC20(want).transferFrom(address(msg.sender), address(this), _amount);
	}

	function withdraw(uint256 maxShares) external virtual returns (uint256) {
		IERC20(want).transfer(msg.sender, maxShares);
	}
}
