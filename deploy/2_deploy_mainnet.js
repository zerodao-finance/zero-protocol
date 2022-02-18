const hre = require("hardhat")
const { ethers, deployments, upgrades } = hre;

const deployFixedAddress = async (...args) => {
    console.log('Deploying ' + args[0]);
    console.log("Args Here: ", args);
    args[1].waitConfirmations = 1;
    const [signer] = await ethers.getSigners();
    const result = await deployments.deploy(...args);
    console.log('Deployed to ' + result.address);
    if (args[0] === 'ZERO') {
        return;
    } else {
        return await ethers.getContract(args[0]);
    }
};

const deployProxyFixedAddress = async (...args) => {
    console.log('Deploying proxy');
    const result = await upgrades.deployProxy(...args);
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

    const { abi: erc20abi } = await deployments.getArtifact('BTCVault');
    const [testTreasury] = await ethers.getSigners();

    const zeroUnderwriterLockBytecodeLib = await deployFixedAddress('ZeroUnderwriterLockBytecodeLib', {
        contractName: 'ZeroUnderwriterLockBytecodeLib',
        args: [],
        from: deployer
    });

    const zeroControllerFactory = (await hre.ethers.getContractFactory("ZeroController", {
        libraries: {
            ZeroUnderwriterLockBytecodeLib: zeroUnderwriterLockBytecodeLib.address
        }
    }));

    const zeroController = await deployProxyFixedAddress(zeroControllerFactory, ["0x0F4ee9631f4be0a63756515141281A3E2B293Bbe", deployParameters["ETHEREUM"].gatewayRegistry], {
        unsafeAllowLinkedLibraries: true
    });

    const zeroControllerArtifact = await deployments.getArtifact('ZeroController');

    await deployments.save('ZeroController', {
        contractName: 'ZeroController',
        address: zeroController.address,
        bytecode: zeroControllerArtifact.bytecode,
        abi: zeroControllerArtifact.abi
    });

    const BTCVault = await deployFixedAddress('BTCVault', {
        contractName: 'BTCVault',
        args: [deployParameters['ETHEREUM']['renBTC'], zeroController.address, "zeroBTC", "zBTC"],
        from: deployer
    });

    const zeroToken = await deployFixedAddress("ZERO", {
        contractName: "ZERO",
        args: [],
        from: deployer
    });

    // TODO change to multisig signer instead of this hardhat one
    const zero = await ethers.getContract('ZERO', testTreasury);

    const zeroDistributor = await deployFixedAddress("ZeroDistributor", {
        contractName: "ZeroDistributor",
        args: [
            testTreasury.address, // TODO change to multisig mainnet address
            zero.address,
            merkleRoot,
        ],
        from: deployer
    });

    console.log(`Begin Testing\n`)

    // RentBTC
    const RENBTC_HOLDER = "0x9804bbbc49cc2a309e5f2bf66d4ad97c3e0ebd2f";
    await hre.network.provider.request({ method: 'hardhat_impersonateAccount', params: [RENBTC_HOLDER] });
    const signer = await ethers.getSigner(RENBTC_HOLDER);
    const renBTC = new ethers.Contract(deployParameters['ETHEREUM']['renBTC'], erc20abi, signer);

    zero.approve(testTreasury.address, ethers.constants.MaxInt256)

    await zero.mint(testTreasury.address, ethers.utils.parseUnits('88000000', 18))


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
