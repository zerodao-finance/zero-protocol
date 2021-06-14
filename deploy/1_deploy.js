const hre = require("hardhat");
const { options } = require("libp2p/src/keychain");
const validate = require('@openzeppelin/upgrades-core/dist/validate/index');
Object.defineProperty(validate, 'assertUpgradeSafe', {
  value: () => {}
})

const SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";

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
    })).connect(signer);
    const zeroController = await upgrades.deployProxy(zeroControllerFactory, ["0x0F4ee9631f4be0a63756515141281A3E2B293Bbe"], {
        unsafeAllowLinkedLibraries: true
    });
    const trivialUnderwriterFactory = await deployments.deploy("TrivialUnderwriter", {
      contractName: 'TrivialUnderwriter',
      args: [],
      from: deployer
    });
    const swapModuleFactory = await deployments.deploy('Swap', {
      args: [],
      contractName: 'Swap',
      from: deployer
    });
};

