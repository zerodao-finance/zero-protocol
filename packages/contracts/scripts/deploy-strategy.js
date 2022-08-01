const hre = require('hardhat');

const network = process.env.CHAIN || 'ARBITRUM';
const deployParameters = require('../lib/fixtures')[network];

(async () => {
  const [signer] = await hre.ethers.getSigners();
  const zeroController = await hre.ethers.getContract('ZeroController');
  const dummyVault = await hre.ethers.getContract('DummyVault');
/*
  const strategyRenVM = await hre.deployments.deploy('StrategyRenVMArbitrum', {
    contractName: 'StrategyRenVMArbitrum',
    args: [
      zeroController.address,
      deployParameters.renBTC,
      deployParameters.wNative,
      dummyVault.address,
      deployParameters.wBTC
    ],
    libraries: {},
    from: await signer.getAddress()
  });
*/
  const strategyRenVM = await hre.ethers.getContract('StrategyRenVMArbitrum');
  console.log('deployments.deploy(StrategyRenVMArbitrum)');
/*
  const approveTx = await zeroController.approveStrategy(deployParameters.renBTC, strategyRenVM.address);
  console.log('ZeroController#approveStrategy(renBTC, strategyRenVMArbitrum) ', approveTx.hash);
  console.log(await approveTx.wait());
*/
  const tx = await zeroController.setStrategy(deployParameters.renBTC, strategyRenVM.address, false);
  console.log('ZeroController#setStrategy(renBTC, strategyRenVMArbitrum) ', tx.hash);
  console.log(await tx.wait());
})().catch(console.error);
