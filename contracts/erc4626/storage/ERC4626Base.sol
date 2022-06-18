// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import "./ERC20Base.sol";
import "./ReentrancyGuardBase.sol";

contract ERC4626Base is ERC20Base, ReentrancyGuardBase {
  /*//////////////////////////////////////////////////////////////
                                ERRORS
  //////////////////////////////////////////////////////////////*/

  error ZeroShares();

  /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

  event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);

  event Withdraw(
    address indexed caller,
    address indexed receiver,
    address indexed owner,
    uint256 assets,
    uint256 shares
  );
}
