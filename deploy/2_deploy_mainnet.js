import hre from "hardhat";
import { useMerkleGenerator } from "../lib/merkle/use-merkle";
import fs from 'fs';
import path from 'path';
const { ethers, deployments } = hre;

const deployFixedAddress = async (...args) => {
    console.log('Deploying ' + args[0]);
    console.log("Args Here: ", args);
    args[1].waitConfirmations = 1;
    const result = await deployments.deploy(...args);
    console.log('Deployed to ' + result.address);
    if (args[0] === 'ZERO') {
        return;
    } else {
        return await ethers.getContract(args[0]);
    }
};

module.exports = async ({
    getNamedAccounts
}) => {
    if (process.env.CHAIN !== "ETHEREUM") return;
    const { deployer } = await getNamedAccounts();
    const [ethersSigner] = await ethers.getSigners();
    const { provider } = ethersSigner;
    const { chainId } = await provider.getNetwork();
    if (process.env.FORKING) {
	    /*
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [SIGNER_ADDRESS]
        })
	*/
    }

    const merkleDir = path.join(__dirname, '..', 'merkle', process.env.FORKING ? 'forknet' : 'mainnet');
    const merkleInput = require(path.join(merkleDir, 'input'));
    const merkleTree = useMerkleGenerator(merkleInput);
	console.log(merkleTree);
    await fs.writeFileSync(path.join(merkleDir, 'airdrop.json'), JSON.stringify(merkleTree, null, 2));
    console.log('wrote merkle tree');

    // Replace all "testTreasury" with mainnet multisigner 
    const [testTreasury] = await ethers.getSigners();

    await deployFixedAddress("ZERO", {
        contractName: "ZERO",
        args: [],
        from: deployer
    });

    // TODO change to multisig signer instead of this hardhat one
    const zeroToken = await ethers.getContract('ZERO', testTreasury);

    //TODO: if it still doesnt work uncomment this
    const zeroDistributor = await deployFixedAddress("ZeroDistributor", {
        contractName: "ZeroDistributor",
        args: [
            zeroToken.address,
            testTreasury.address, // TODO change to multisig mainnet address
            merkleTree.merkleRoot,
        ],
        from: deployer
    });

    const decimals = 18;
    await zeroToken.mint(testTreasury.address, ethers.utils.parseUnits('88000000', decimals));
    await zeroToken.connect(testTreasury).approve(zeroDistributor.address, await zeroToken.balanceOf(testTreasury.address));

    console.log(`\nTreasury Balance:\n`);
    console.log(ethers.utils.formatUnits(await zeroToken.balanceOf(testTreasury.address), decimals));
    console.log("\nAllowance:\n");
    console.log(ethers.utils.formatUnits(await zeroToken.allowance(testTreasury.address, zeroDistributor.address), decimals));


    // Staking
    const masterChef = await deployFixedAddress("MasterChef", {
        contractName: "MasterChef",
        args: [
            zeroToken.address,
            testTreasury.address,
            ethers.utils.parseEther("1000"), // Should be set by governance
            ethers.utils.parseEther("1000"), // Should be set by governance
            ethers.utils.parseEther("1000") // Should be set by governance
        ],
        from: deployer
    }) 
}
