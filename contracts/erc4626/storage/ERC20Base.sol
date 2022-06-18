// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

contract ERC20Base {
  /*//////////////////////////////////////////////////////////////
                            Storage
    //////////////////////////////////////////////////////////////*/

  uint256 public totalSupply;

  mapping(address => uint256) public balanceOf;

  mapping(address => mapping(address => uint256)) public allowance;

  /*//////////////////////////////////////////////////////////////
                            Errors
    //////////////////////////////////////////////////////////////*/

  error InvalidCompactString();

  /*//////////////////////////////////////////////////////////////
                            Events
    //////////////////////////////////////////////////////////////*/

  event Transfer(address indexed from, address indexed to, uint256 amount);

  event Approval(address indexed owner, address indexed spender, uint256 amount);
}
