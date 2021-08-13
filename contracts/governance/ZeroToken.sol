// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import {Comp} from '../vendor/compound/Comp.sol';

contract ZeroToken is Comp {
	constructor(address account) public Comp(account) {
		name = 'ZeroDAO';
		symbol = 'ZERO';
	}
}
