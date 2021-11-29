const hre = require('hardhat');

var { contracts } = require('../deployments/deployments')[137].matic
var wallet = new hre.ethers.Wallet(process.env.UNDERWRITER_WALLET);
var { createGetGasPrice } = require('ethers-polygongastracker');

const getContract = (contract) => {
  return new hre.ethers.Contract(require('../deployments/matic/' + contract).address, require('../deployments/matic/' + contract).abi, wallet);
};
const main = async () => {
  const [ signer ] = await hre.ethers.getSigners();
  wallet = wallet.connect(signer.provider);
  const IMPLEMENTATION_SLOT = hre.ethers.utils.hexlify(hre.ethers.BigNumber.from(hre.ethers.utils.solidityKeccak256(['string'], [ 'eip1967.proxy.implementation' ])).sub(1));
  const implementation = '0x' + (await wallet.provider.getStorageAt(getContract('ZeroController').address, IMPLEMENTATION_SLOT)).substr(26);
  console.log(implementation);
};

main().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
