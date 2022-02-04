const hre = require("hardhat")
const { ethers, deployments } = hre;
import { Contract } from 'ethers';

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

    const merkleRoot = "0xe52564f93ddc09e2d60c8150e4a11c5be656f147bf1f8c64a492b6a34c11dc6a";

    // For testing airdrop - Start
    const { abi: erc20abi } = await deployments.getArtifact('BTCVault');
    const [testTreasury] = await ethers.getSigners();
    const renBTC = new Contract(deployParameters['ETHEREUM']['renBTC'], erc20abi, testTreasury);
    // For testing airdrop - End

    const zeroToken = await deployFixedAddress("ZERO", {
        contractName: "ZERO",
        args: [],
        from: deployer
    });

    const zeroDistributor = await deployFixedAddress("ZeroDistributor", {
        contractName: "ZeroDistributor",
        args: [
            testTreasury.address, // change to actual treasury address
            zeroToken.address,
            merkleRoot,
        ],
        from: deployer
    });

    // For testing airdrop - Start
    const testTransfer = await renBTC.approve(zeroDistributor.address, ethers.constants.MaxUint256);
    // For testing airdrop - End

    /* For staking after airdrop complete
    const masterChef = await deployFixedAddress("MasterChef", {
        contractName: "MasterChef",
        args: [
            // ZERO _zero,
            // address _devaddr,
            // uint256 _zeroPerBlock,
            // uint256 _startBlock,
            // uint256 _bonusEndBlock
        ],
        from: deployer
    }) 
    */
}