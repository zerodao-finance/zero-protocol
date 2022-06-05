// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import {BadgerBridgeZeroControllerAvax} from '../controllers/BadgerBridgeZeroControllerAvax.sol';
import {TransparentUpgradeableProxy} from '@openzeppelin/contracts/proxy/TransparentUpgradeableProxy.sol';
import {ProxyAdmin} from '@openzeppelin/contracts/proxy/ProxyAdmin.sol';

contract BadgerBridgeZeroControllerDeployer {
  address constant governance = 0xC10e4c59F1CC2Bc854A27E645318190F173440cB;
  event Deployment(address indexed proxy);

  constructor() {
    address logic = address(new BadgerBridgeZeroControllerAvax());
    ProxyAdmin proxy = new ProxyAdmin();
    ProxyAdmin(proxy).transferOwnership(governance);
    emit Deployment(
      address(
        new TransparentUpgradeableProxy(
          logic,
          address(proxy),
          abi.encodeWithSelector(
            BadgerBridgeZeroControllerAvax.initialize.selector,
            governance,
            governance
          )
        )
      )
    );
    selfdestruct(msg.sender);
  }
}
