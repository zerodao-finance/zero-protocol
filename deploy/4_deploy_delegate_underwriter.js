'use strict';

const hre = require('hardhat');
const common = require('./common');

module.exports = async () => {
  if (!common.isSelectedDeployment(__filename) || process.env.CHAIN === 'ETHEREUM') return;
  const multisig = await hre.ethers.getContract('GnosisSafe');
  const controller = await hre.ethers.getContract('ZeroController');
  const [ signer ] = await hre.ethers.getSigners();
  const underwriter = await hre.deployments.deploy('DelegateUnderwriter', {
    contractName: 'DelegateUnderwriter',
    args: [ multisig.address, controller.address, [ '0xec5d65739c722a46cd79951e069753c2fc879b27' ] ],
    libraries: {},
    from: await signer.getAddress()
  });
  console.log(underwriter.address);
};
  
