const hre = require('hardhat');

var wallet = new hre.ethers.Wallet(process.env.WALLET);

const getContract = (contract) => {
  return new ethers.Contract(require('../deployments/arbitrum/' + contract).address, require('../deployments/arbitrum/' + contract).abi, wallet);
};
const main = async () => {
  const [ signer ] = await hre.ethers.getSigners();
  wallet = wallet.connect(signer.provider);
  const ADMIN_SLOT = ethers.utils.hexlify(hre.ethers.BigNumber.from(hre.ethers.utils.solidityKeccak256(['string'], [ 'eip1967.proxy.admin' ])).sub(1));
  const proxyAdmin = new ethers.Contract('0x' + (await wallet.provider.getStorageAt(getContract('ZeroController').address, ADMIN_SLOT)).substr(26), [ 'function upgrade(address, address)' ], wallet);
  const NewController = await ethers.getContractFactory('ZeroController', {
    libraries: {
      ZeroUnderwriterLockBytecodeLib: getContract('ZeroUnderwriterLockBytecodeLib').address
    }
  }); 
  const newController = await NewController.deploy();
	console.log(newController.address);
  await newController.deployTransaction.wait();
	console.log('new controller deployed');
  const tx = await proxyAdmin.upgrade(getContract('ZeroController').address, newController.address);
	console.log('upgraded');
  console.log(tx.hash);
  console.log(await tx.wait());
  console.log('upgrade mined');
};

main().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
