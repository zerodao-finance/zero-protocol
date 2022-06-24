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

const SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";

module.exports = async ({
    getNamedAccounts
}) => {
    if (process.env.CHAIN !== "ETHEREUM" || process.env.DEPLOYARBITRUMQUICKCONVERT) return;
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

    // RentBTC - is this necessary? Probably not
	/*
    const RENBTC_HOLDER = "0x9804bbbc49cc2a309e5f2bf66d4ad97c3e0ebd2f";
    await hre.network.provider.request({ method: 'hardhat_impersonateAccount', params: [RENBTC_HOLDER] });
    const signer = await ethers.getSigner(RENBTC_HOLDER);
    */


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
