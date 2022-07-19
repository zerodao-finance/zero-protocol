pragma solidity >=0.8.13;

import "./TestERC20.sol";

contract MockGatewayRegistry {
  mapping(TestERC20 => MockGateway) public getGatewayByToken;

  constructor(TestERC20 wbtc) {
    getGatewayByToken[wbtc] = new MockGateway(wbtc);
  }
}

uint256 constant BasisPointsOne = 1e4;

contract MockGateway {
  uint256 internal constant dynamicFeeBips = 10;

  TestERC20 immutable wbtc;

  constructor(TestERC20 _wbtc) {
    wbtc = _wbtc;
  }

  function mint(
    bytes32 _pHash,
    uint256 _amount,
    bytes32 _nHash,
    bytes memory _sig
  ) external {
    require(keccak256(_sig) == keccak256(abi.encodePacked(_pHash, _amount, _nHash)));
    wbtc.mint(msg.sender, _amount);
  }
}
