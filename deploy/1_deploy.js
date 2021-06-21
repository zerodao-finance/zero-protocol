const hre = require("hardhat");
const { options } = require("libp2p/src/keychain");
const validate = require('@openzeppelin/upgrades-core/dist/validate/index');
Object.defineProperty(validate, 'assertUpgradeSafe', {
  value: () => {}
})

const SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";
const RENBTC_MAINNET_ADDRESS = '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d';


module.exports = async ({
    deployments,
    getChainId,
    getUnnamedAccounts,
    getNamedAccounts,
    ethers,
    upgrades
}) => {
    const { deployer } = await getNamedAccounts();
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [ SIGNER_ADDRESS ]
    });

    const signer = await ethers.getSigner(SIGNER_ADDRESS);
    const [ deployerSigner ] = await ethers.getSigners();

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
    console.log('deployed ZeroController');
    await deployments.deploy('BTCVault', {
      contractName: 'BTCVault',
      args: [ RENBTC_MAINNET_ADDRESS, zeroController.address, "zeroBTC", "zBTC" ],
      from: deployer
    });
    console.log('deployed BTCVault');

    const trivialUnderwriterFactory = await deployments.deploy("TrivialUnderwriter", {
      contractName: 'TrivialUnderwriter',
      args: [ zeroController.address ],
      from: deployer
    });
    console.log('deployed TrivialUnderwriter');
    const swapModuleFactory = await deployments.deploy('Swap', {
      args: [ zeroController.address],
      contractName: 'Swap',
      from: deployer
    });
    console.log('deployed SwapModule');
};

