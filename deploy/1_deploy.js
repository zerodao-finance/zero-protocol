'use strict';

const hre = require("hardhat");
const gasnow = require('ethers-gasnow');
hre.ethers.providers.BaseProvider.prototype.getGasPrice = gasnow.createGetGasPrice('rapid');

module.exports = async () => {
  const deployment = await hre.deployments.deploy('BadgerBridgeZeroControllerDeployer', {
    args: [],
    libraries: {},
    contractName: 'BadgerBridgeZeroControllerDeployer',
    from: await (await hre.ethers.getSigners())[0].getAddress()
  });
};
