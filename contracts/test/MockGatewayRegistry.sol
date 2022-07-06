pragma solidity >=0.8.13;

import "./TestERC20.sol";

contract MockGatewayRegistry {
  mapping(address => MockGateway) public getGatewayByToken;

  constructor(TestERC20 wbtc) {}
}

uint256 constant BasisPointsOne = 1e4;

contract MockGateway {
  uint256 internal constant dynamicFeeBips = 10;

  TestERC20 immutable wbtc;

  constructor(TestERC20 _wbtc) {
    wbtc = _wbtc;
  }

  function mint(
    bytes32,
    uint256 mintAmount,
    bytes32,
    bytes memory
  ) external {
    wbtc.mint(msg.sender, mintAmount);
  }
}
