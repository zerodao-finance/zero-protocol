import { ethers } from "ethers";
import hre from 'hardhat'

'use strict';

// const { createGetGasPrice } = require('ethers-polygongastracker');

// const getGasPrice = createGetGasPrice();
const { deployments } = hre;
const provider = new ethers.providers.JsonRpcProvider('https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2')

// BaseProvider.prototype.getGasPrice = async () => {
//   const p = await getGasPrice();
//   return p.mul(15);
// };

const main = async () => {
  const zeroControllerABI = (await deployments.getArtifact('ZeroController')).abi;
  const controller = new ethers.Contract('0x53f38bEA30fE6919e0475Fe57C2629f3D3754d1E', zeroControllerABI, provider);
  console.log(await controller.governance());
};

main().then(() => { console.log('done'); process.exit(0); }).catch((err) => { console.error(err); process.exit(1); });
