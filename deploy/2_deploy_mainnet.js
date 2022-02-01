const hre = require("hardhat")
const { ethers, deployments, upgrades } = hre;

const deployFixedAddress = async (...args) => {
    console.log('Deploying ' + args[0]);
    console.log("Args Here: ", args);
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

    const merkleRoot = "0x78c312383d30ce1ebc266e6c3503518b142481bfb4ab59fe5bfb1c0d0339ac09";

    const zeroToken = await deployFixedAddress("ZERO", {
        contractName: "ZERO",
        args: [],
        from: deployer
    });

    const zeroDistributor = await deployFixedAddress("ZeroDistributor", {
        contractName: "ZeroDistributor",
        args: [
            zeroToken.address,
            merkleRoot
        ],
        from: deployer
    })

    // const masterChef = await deployFixedAddress("MasterChef", {
    //     contractName: "MasterChef",
    //     args: [
    //         // ZERO _zero,
    //         // address _devaddr,
    //         // uint256 _zeroPerBlock,
    //         // uint256 _startBlock,
    //         // uint256 _bonusEndBlock
    //     ],
    //     from: deployer
    // })
}