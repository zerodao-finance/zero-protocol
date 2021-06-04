// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("yearn.finance test token", "TEST") {
        _setupDecimals(18);
        _mint(msg.sender, 30000 * 10**18);
    }
}
