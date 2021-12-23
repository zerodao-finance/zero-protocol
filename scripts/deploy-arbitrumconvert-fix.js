const hre = require('hardhat');
const { deployments, ethers } = hre;

(async () => {
  const [ signer ] = await ethers.getSigners();
  const controller = await ethers.getContract('ZeroController');
  await deployments.deploy('ArbitrumConvert', {
    contractName: 'ArbitrumConvert',
    args: [ controller.address ],
    libraries: {},
    from: await signer.getAddress()
  });
})().catch((err) => console.error(err));
