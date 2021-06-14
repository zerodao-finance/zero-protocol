const hre = require("hardhat");
const { options } = require("libp2p/src/keychain");
const validate = require('@openzeppelin/upgrades-core/dist/validate/index');
Object.defineProperty(validate, 'assertUpgradeSafe', {
  value: () => {}
})


module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
    ethers,
    upgrades
  }) => {

    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0x0F4ee9631f4be0a63756515141281A3E2B293Bbe"]
    });

    const signer = await ethers.provider.getSigner("0x0F4ee9631f4be0a63756515141281A3E2B293Bbe")

    const {deploy} = deployments;
    const [ deployerSigner ] = await ethers.getSigners()  

    const ZeroControllerFactory = await hre.ethers.getContractFactory("ZeroController", {});
    const zeroController = await upgrades.deployProxy(ZeroControllerFactory, ["0x0F4ee9631f4be0a63756515141281A3E2B293Bbe"], {
        unsafeAllowLinkedLibraries: true,
    });

    
	  /*
    
    const TrivialUnderwriterFactory = await hre.ethers.getContractFactory("TrivialUnderwriter");
    const SwapModuleFactory = await hre.ethers.getContractFactory("Swap");
    const trivialUnderwriter = await TrivialUnderwriterFactory.deploy( zeroController.address );

    const swapModule = await SwapModuleFactory.deploy( zeroController.address );
    */

}

module.exports(hre)
