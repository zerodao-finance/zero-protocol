import hre from "hardhat";
import { useMerkleGenerator } from "../merkle/generate";

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

    const { hexRoot, decimals } = useMerkleGenerator();

    const [testTreasury] = await ethers.getSigners();

    await deployFixedAddress("ZERO", {
        contractName: "ZERO",
        args: [],
        from: deployer
    });

    // TODO change to multisig signer instead of this hardhat one
    const zeroToken = await ethers.getContract('ZERO', testTreasury);

    const zeroDistributor = await deployFixedAddress("ZeroDistributor", {
        contractName: "ZeroDistributor",
        args: [
            testTreasury.address, // TODO change to multisig mainnet address
            zeroToken.address,
            hexRoot,
        ],
        from: deployer
    });

    await zeroToken.mint(testTreasury.address, ethers.utils.parseUnits('88000000', decimals));
    await zeroToken.approve(zeroDistributor.address, await zeroToken.balanceOf(testTreasury.address));

    console.log(`Begin Testing\n`)

    // RentBTC
    const RENBTC_HOLDER = "0x9804bbbc49cc2a309e5f2bf66d4ad97c3e0ebd2f";
    await hre.network.provider.request({ method: 'hardhat_impersonateAccount', params: [RENBTC_HOLDER] });
    const signer = await ethers.getSigner(RENBTC_HOLDER);


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
