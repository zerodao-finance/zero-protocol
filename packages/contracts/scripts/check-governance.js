'use strict';

const { createGetGasPrice } = require('ethers-polygongastracker');

const getGasPrice = createGetGasPrice();

const hre = require('hardhat');
const { BaseProvider } = hre.ethers.providers;

BaseProvider.prototype.getGasPrice = async () => {
  const p = await getGasPrice();
  return p.mul(15);
};

const main = async () => {
  const controller = await hre.ethers.getContract('DelegateUnderwriter');
  console.log(await controller.owner());
};

main().then(() => { console.log('done'); process.exit(0); }).catch((err) => { console.error(err); process.exit(1); });
