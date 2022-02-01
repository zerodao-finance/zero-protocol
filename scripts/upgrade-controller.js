const hre = require("hardhat");
const { ethers, upgrades } = hre;
const deployParameters = require('../lib/fixtures');

const main = async () => {
    const signer = new ethers.providers.JsonRpcProvider('https://polygon-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2');
    const wallet = new ethers.Wallet(process.env.WALLET, signer);

    const zeroUnderwriterLockBytecodeLib = '0xEe70d42B5b34740C6F443e9d7B834123291a5341';
    const ZeroController = (await hre.ethers.getContractFactory("ZeroController", {
        libraries: {
            ZeroUnderwriterLockBytecodeLib: zeroUnderwriterLockBytecodeLib
        }
    })).connect(wallet);

    const controller = await upgrades.deployProxy(ZeroController, ["0x0F4ee9631f4be0a63756515141281A3E2B293Bbe", deployParameters['MATIC'].gatewayRegistry])
    await controller.deployed();
    console.log("deployed controller to", controller.address);
}

main();