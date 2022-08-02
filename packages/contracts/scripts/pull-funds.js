const hre = require('hardhat');

var { contracts } = require('../deployments/deployments')[137].matic
var wallet = new hre.ethers.Wallet(process.env.WALLET);
var { createGetGasPrice } = require('ethers-polygongastracker');

const main = async () => {
  const [ signer ] = await hre.ethers.getSigners();
  wallet = wallet.connect(signer.provider);
  wallet.provider.getGasPrice = createGetGasPrice();
  const ADMIN_SLOT = ethers.utils.hexlify(hre.ethers.BigNumber.from(hre.ethers.utils.solidityKeccak256(['string'], [ 'eip1967.proxy.admin' ])).sub(1));
//  const controller = new ethers.Contract(contracts.ZeroController.address, [ 'function proxy(address, bytes, uint256)', 'function withdraw(uint256)' ], wallet);
//  console.log(tx);
  const proxyAdmin = new ethers.Contract('0x' + (await wallet.provider.getStorageAt(contracts.ZeroController.address, ADMIN_SLOT)).substr(26), [ 'function upgrade(address, address)' ], wallet);
  /*
  const fundsPull = await ethers.getContractFactory('ZeroController', {
    libraries: {
      ZeroUnderwriterLockBytecodeLib: '0x771adAcd37B672210E31E0e938537afA051d5367'
    }
  });
  */
//  const contract = /* '0xe2F0ED01a9fB09f6956Ac682F0E4B7bD4Ab1B41D' */ (await fundsPull.deploy()).address;
  const contract = '0x55b55c4625c57ab0cf481f197de692b0717fdea8';
 // console.log('impl', contract);
  const tx = await proxyAdmin.upgrade(contracts.ZeroController.address, contract);
  console.log(tx.hash);
  console.log(await tx.wait());
  console.log('upgraded');
  /*
  const txCall = await controller.proxy('0xc8E5aEd8eF691FcA4BFEFD6b57Faf91dD13E1761', controller.interface.encodeFunctionData('withdraw', [ '3115200' ]), '0', { gasLimit: 5e6 });
  const wbtc = new ethers.Contract('0xDBf31dF14B66535aF65AaC99C32e9eA844e14501', [ 'function transfer(address, uint256) returns (bool)', 'function balanceOf(address) view returns (uint256)' ], wallet);
  console.log('balanceOf');
  const balance = await wbtc.balanceOf(controller.address);
  console.log('balanceOf', balance);
  console.log('proxy');
  const txCall = await controller.proxy(wbtc.address, wbtc.interface.encodeFunctionData('transfer', [ '0x12fbc372dc2f433392cc6cab29cfbcd5082ef494', balance ]), '0');
  console.log(txCall.hash);
  console.log(await txCall.wait());
  console.log(tx.hash);
  console.log(await tx.wait());
  */
};

main().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
