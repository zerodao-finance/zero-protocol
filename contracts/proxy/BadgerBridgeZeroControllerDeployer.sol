// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import { BadgerBridgeZeroControllerArb } from "../controllers/BadgerBridgeZeroControllerArb.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/TransparentUpgradeableProxy.sol";
import { ProxyAdmin } from "@openzeppelin/contracts/proxy/ProxyAdmin.sol";

contract BadgerBridgeZeroControllerDeployer {
  address constant governance = 0x3A627ab4F61985f9F353a3F4c2C91dd8c18a9B04;
  event Deployment(address indexed proxy);

  constructor() {
    address logic = address(new BadgerBridgeZeroControllerArb());
    ProxyAdmin proxy = new ProxyAdmin();
    ProxyAdmin(proxy).transferOwnership(governance);
    emit Deployment(
      address(
        new TransparentUpgradeableProxy(
          logic,
          address(proxy),
          abi.encodeWithSelector(BadgerBridgeZeroControllerArb.initialize.selector, governance, governance)
        )
      )
    );
    selfdestruct(msg.sender);
  }
}
