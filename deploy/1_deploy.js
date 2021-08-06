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
  const [{ provider }] = await ethers.getSigners();
  const { chainId } = await provider.getNetwork();
  if (chainId === 31337) {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [SIGNER_ADDRESS]
    })
  }
  const signer = await ethers.getSigner(SIGNER_ADDRESS);
  const [deployerSigner] = await ethers.getSigners();

  const zeroUnderwriterLockBytecodeLib = await deployments.deploy('ZeroUnderwriterLockBytecodeLib', {
    contractName: 'ZeroUnderwriterLockBytecodeLib',
    args: [],
    from: deployer
  });

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
  const btcVault = await deployments.deploy('BTCVault', {
    contractName: 'BTCVault',
    args: [RENBTC_MAINNET_ADDRESS, zeroController.address, "zeroBTC", "zBTC"],
    from: deployer
  });
  const v = await ethers.getContract('BTCVault');
  await v.attach(RENBTC_MAINNET_ADDRESS).balanceOf(ethers.constants.AddressZero);

  const trivialUnderwriterFactory = await deployments.deploy("TrivialUnderwriter", {
    contractName: 'TrivialUnderwriter',
    args: [zeroController.address],
    from: deployer
  });
  const swapModuleFactory = await deployments.deploy('Swap', {
    args: [zeroController.address],
    contractName: 'Swap',
    from: deployer
  });
  const strategyRenVM = await deployments.deploy('StrategyRenVM', {
    args: [zeroController.address],
    contractName: 'StrategyRenVM',
    from: deployer
  });
  const controller = await ethers.getContract('ZeroController');

  await controller.approveStrategy(RENBTC_MAINNET_ADDRESS, strategyRenVM.address);
  await controller.setStrategy(RENBTC_MAINNET_ADDRESS, strategyRenVM.address);

};

