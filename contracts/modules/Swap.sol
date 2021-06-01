pragma solidity ^0.6.0;

import { SwapLib } from "./SwapLib.sol";

contract Swap {
  mapping (uint256 => SwapLib.SwapRecord) public outstanding;
  address public immutable controller;
  address public immutable governance;
  uint256 public blockTimeout;
  constructor(address _controller) {
    controller = _controller;
    governance = IController(_controller).governance();
  }
  function setBlockTimeout(uint256 ct) public {
    require(msg.sender == governance, "!governance");
    blockTimeout = ct;
  }
  function defaultLoan(uint256 nonce) public {
  }
  function receive(address to, address asset, uint256 actual, uint256 nonce, bytes memory data) public {
    require(asset != controller, "
  }
  
  }
