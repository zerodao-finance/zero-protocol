const hre = require("hardhat");
const { ethers, upgrades } = hre;

const main = async () => {
    const signer = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/ca0da016dedf4c5a9ee90bfdbafee233');
    const wallet = new ethers.Wallet(process.env.WALLET, signer);

    const ZeroController = (await hre.ethers.getContractFactory("ZeroController", {
        libraries: {
            ZeroUnderwriterLockBytecodeLib: zeroUnderwriterLockBytecodeLib.address
        }
    }));

    const controller = await upgrades.deployProxy(ZeroController, ["0x0F4ee9631f4be0a63756515141281A3E2B293Bbe", deployParameters[network].gatewayRegistry], { unsafeAllowLinkedLibraries: true })
    await controller.deployed();
    console.log("deployed controller to", controller.address);
}