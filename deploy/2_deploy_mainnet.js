const hre = require("hardhat")
const { ethers, deployments, upgrades } = hre;

const deployFixedAddress = async (...args) => {
    console.log('Deploying ' + args[0]);
    args[1].waitConfirmations = 1;
    const [signer] = await ethers.getSigners();
  //  hijackSigner(signer);
    const result = await deployments.deploy(...args);
  //  restoreSigner(signer);
    console.log('Deployed to ' + result.address);
    return result;
};

const { JsonRpcProvider } = ethers.providers
const { getSigner: _getSigner } = JsonRpcProvider.prototype;

const deployParameters = require('../lib/fixtures');

const SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";


module.exports = async ({
    getChainId,
    getUnnamedAccounts,
    getNamedAccounts

}) => {
    if (process.env.CHAIN !== "ETHEREUM") return;
    const { deployer } = await getNamedAccounts();
    const [ethersSigner] = await ethers.getSigners();
    const { provider } = ethersSigner;
    const { chainId } = await provider.getNetwork();
    if (chainId === 1) {
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [SIGNER_ADDRESS]
        })
    }


    // deployments.deploy("ZERO")
    console.log(deployer)
    console.log(provider, chainId)


    deployFixedAddress("MasterChef", {
        contractName: "MasterChef",
        args: [],
        from: deployer
    })

    // deployFixedAddress("MasterChef", {
    //     contractName: "MasterChef",
    //     args: [],
    //     from: deployer
    // })

    // deployFixedAddress("ZeroDistributor", {
    //     contractName: "ZeroDistributor",
    //     args: [],
    //     from: deployer
    // })



}