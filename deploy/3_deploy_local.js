const hre = require("hardhat");
const { ethers } = hre
const deployParameters = require('../lib/fixtures');

const network = process.env.CHAIN || 'MATIC';
const SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";
const abi = [
    'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
    'function mintFee() view returns (uint256)',
];

module.exports = async ({
    getChainId,
    getUnnamedAccounts,
    getNamedAccounts
}) => {


    if (!process.env.FORKING) return

    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [SIGNER_ADDRESS]
    })
    const signer = (await ethers.getSigner(SIGNER_ADDRESS))

    console.log("Testing Keeper with", await signer.getBalance())

    const btcGateway = new ethers.Contract(deployParameters[network]['btcGateway'], abi, signer);
    await btcGateway.mint(
        ethers.utils.hexlify(ethers.utils.randomBytes(32)), 
        80000000000,
        ethers.utils.hexlify(ethers.utils.randomBytes(32)), 
        '0x'
    )



}