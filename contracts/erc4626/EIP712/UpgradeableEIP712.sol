// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import "./AbstractEIP712.sol";

/**
 * @dev ProxyImmutable is used to set `proxyContract` in UpgradeableEIP712
 * before the constructor of AbstractEIP712 runs, giving it access to the
 * `verifyingContract` function.
 */
contract ProxyImmutable {
  address internal immutable proxyContract;

  constructor(address _proxyContract) {
    proxyContract = _proxyContract;
  }
}

contract UpgradeableEIP712 is ProxyImmutable, AbstractEIP712 {
  constructor(
    address _proxyContract,
    string memory _name,
    string memory _version
  ) ProxyImmutable(_proxyContract) AbstractEIP712(_name, _version) {}

  function verifyingContract() internal view virtual override returns (address) {
    return proxyContract;
  }
}
