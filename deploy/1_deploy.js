'use strict';

const hre = require('hardhat');
module.exports = async () => {
  const [ signer ] = await hre.ethers.getSigners();
  await hre.deployments.deploy('ZeroController', {
    contractName: 'ZeroController',
    args: [],
    libraries: {
      ZeroUnderwriterLockBytecodeLib: require('/home/cipher/deployments/arbitrum/ZeroUnderwriterLockBytecodeLib').address
    },
    from: await signer.getAddress()
  });
};
