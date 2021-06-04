pragma solidity >=0.6.0;

interface IStrategy {
  function permissionedSend(address _asset, uint256 _amount) external;
}
