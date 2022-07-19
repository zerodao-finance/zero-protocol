// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;
import "./AbstractEIP712.sol";

contract EIP712 is AbstractEIP712 {
  constructor(string memory _name, string memory _version)
    AbstractEIP712(_name, _version)
  {}

  function _verifyingContract()
    internal
    view
    virtual
    override
    returns (address)
  {
    return address(this);
  }
}
