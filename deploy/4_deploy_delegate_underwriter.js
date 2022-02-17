'use strict';

const hre = require('hardhat');
const common = require('./common');

module.exports = async () => {
  if (!common.isSelectedDeployment(__filename)) return;
  const multisig = await hre.ethers.getContract('GnosisSafe');
  const controller = await hre.ethers.getContract('ZeroController');
  const [ signer ] = await hre.ethers.getSigners();
  await hre.deployments.deploy('DelegateUnderwriter', {
    contractName: 'DelegateUnderwriter',
    args: [ controller.address ],
    libraries: {},
    from: await signer.getAddress()
  });
  const delegate = await hre.ethers.getContract('DelegateUnderwriter');
  console.log((await delegate.addAuthority('0xFFEDC765778db2859820eE4869393e7939a847b7')).hash);
  console.log((await delegate.transferOwnership(multisig.address)).hash);
};
  
