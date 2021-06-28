const hre = require("hardhat");
const { options } = require("libp2p/src/keychain");
const validate = require('@openzeppelin/upgrades-core/dist/validate/index');
Object.defineProperty(validate, 'assertUpgradeSafe', {
  value: () => { }
})

const SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";
const RENBTC_MAINNET_ADDRESS = '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d';
const WETH_MAINNET_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const USDC_MAINNET_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

module.exports = async ({
  deployments,
  getChainId,
  getUnnamedAccounts,
  getNamedAccounts,
  ethers,
  upgrades
}) => {
  const { deployer } = await getNamedAccounts(); //used as governance address
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [SIGNER_ADDRESS]
  });

  const signer = await ethers.getSigner(SIGNER_ADDRESS);
  const [deployerSigner] = await ethers.getSigners();

  const zeroUnderwriterLockBytecodeLib = await deployments.deploy('ZeroUnderwriterLockBytecodeLib', {
    contractName: 'ZeroUnderwriterLockBytecodeLib',
    args: [],
    from: deployer
  });
  console.log('deployed ZeroUnderwriterLockBytecodeLib');

  const zeroControllerFactory = (await hre.ethers.getContractFactory("ZeroController", {
    libraries: {
      ZeroUnderwriterLockBytecodeLib: zeroUnderwriterLockBytecodeLib.address
    }
  }));
  const zeroController = await upgrades.deployProxy(zeroControllerFactory, ["0x0F4ee9631f4be0a63756515141281A3E2B293Bbe"], {
    unsafeAllowLinkedLibraries: true
  });
  const zeroControllerArtifact = await deployments.getArtifact('ZeroController');
  await deployments.save('ZeroController', {
    contractName: 'ZeroController',
    address: zeroController.address,
    bytecode: zeroControllerArtifact.bytecode,
    abi: zeroControllerArtifact.abi
  });
  console.log('deployed ZeroController at', zeroController.address);
  const btcVault = await deployments.deploy('BTCVault', {
    contractName: 'BTCVault',
    args: [RENBTC_MAINNET_ADDRESS, zeroController.address, "zeroBTC", "zBTC"],
    from: deployer
  });
  const v = await ethers.getContract('BTCVault');
  await v.attach(RENBTC_MAINNET_ADDRESS).balanceOf(ethers.constants.AddressZero);
  console.log(await v.token());
  console.log('deployed BTCVault at', btcVault.address);

  const trivialUnderwriterFactory = await deployments.deploy("TrivialUnderwriter", {
    contractName: 'TrivialUnderwriter',
    args: [zeroController.address],
    from: deployer
  });
  console.log('deployed TrivialUnderwriter at', trivialUnderwriterFactory.address);
  const swapModuleFactory = await deployments.deploy('Swap', {
    args: [zeroController.address],
    contractName: 'Swap',
    from: deployer
  });
  console.log('deployed SwapModule at', swapModuleFactory.address);

  const strategyRenVM = await deployments.deploy('StrategyRenVM', {
    args: [zeroController.address],
    contractName: 'StrategyRenVM',
    from: deployer
  });
  console.log('deployed StrategyRenVM at', strategyRenVM.address)
  const controller = await ethers.getContract('ZeroController');

};

