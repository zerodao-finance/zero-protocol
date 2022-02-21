'use strict';

const hre = require('hardhat');

const harvest = async (vault) => {
  console.log('earn() exec');
  try {
    const tx = await vault.earn();
    const receipt = await tx.wait();
    console.log('gasUsed', receipt.gasUsed);
  } catch (e) {
    console.error('earn() fail')
  }
};

const getBalance = async (vault) => hre.ethers.utils.hexlify(await (vault.attach(await vault.token())).balanceOf(vault.address));
  
(async () => {
  const vault = await hre.ethers.getContract('BTCVault');
  let last;
  await harvest(vault);
  while (true) {
    let current = last;
    try {
      current = await getBalance(vault);
    } catch (e) {
      console.error(e);
    }
    if (last !== current) {
      await harvest(vault);
      last = await getBalance(vault);
      
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
})().catch((err) => console.error(err));
    
    
    
