'use strict';

const hre = require('hardhat');
const fixtures = require('../lib/fixtures');
const BadgerBridgeZeroController = require('../deployments/mainnet/BadgerBridgeZeroController');
const controller = new hre.ethers.Contract(BadgerBridgeZeroController.address, ['function earn()'], new hre.ethers.providers.InfuraProvider('mainnet'));
const renbtc = new hre.ethers.Contract(fixtures.ETHEREUM.renBTC, ['function balanceOf(address) view returns (uint256)'], new hre.ethers.providers.InfuraProvider('mainnet'));

const harvest = async (vault) => {
  console.log('earn() exec');
  try {
    const tx = await vault.earn({ gasLimit: 8e5 });
    const receipt = await tx.wait();
    console.log('gasUsed', receipt.gasUsed);
  } catch (e) {
    console.error('earn() fail')
  }
};

  
(async () => {
  const vault = await hre.ethers.getContract('BadgerBridgeZeroController');
  let last;
  await harvest(vault);
  while (true) {
    const current = await renbtc.connect(vault.provider).balanceOf(vault.address);
    if (Number(ethers.utils.formatUnits(current, 8)) > 0.002) {
      await harvest(vault);
      
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
})().catch((err) => console.error(err));
    
    
    
