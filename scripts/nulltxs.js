'use strict';

const { createGetGasPrice } = require('ethers-polygongastracker');

const getGasPrice = createGetGasPrice();

const hre = require('hardhat');
const { BaseProvider } = hre.ethers.providers;

BaseProvider.prototype.getGasPrice = async () => {
  const p = await getGasPrice();
  return p.mul(20);
};

const main = async () => {
  const [ signer ] = await ethers.getSigners();
  const tx = await signer.sendTransaction({
    value: '0x0',
    to: hre.ethers.constants.AddressZero,
    gasLimit: 2000000,
    nonce: 343
  });
  console.log(tx);
  console.log('sent tx, waiting');
  console.log(await tx.wait());
};

main().then(() => { console.log('done'); process.exit(0); }).catch((err) => { console.error(err); process.exit(1); });
