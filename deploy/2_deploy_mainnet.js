const hre = require("hardhat")
const { ethers, deployments, upgrades } = hre;
const { Contract, utils } = ethers;

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

const deployProxyFixedAddress = async (...args) => {
    console.log('Deploying proxy');
    //const [signer] = await ethers.getSigners();
    //hijackSigner(signer);
    const result = await upgrades.deployProxy(...args);
    //restoreSigner(signer);
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
    // const zeroUnderwriterLockBytecodeLib = await deployFixedAddress('ZeroUnderwriterLockBytecodeLib', {
    //     contractName: 'ZeroUnderwriterLockBytecodeLib',
    //     args: [],
    //     from: deployer
    // });
    // const zeroControllerFactory = (await hre.ethers.getContractFactory("ZeroController", {
    //     libraries: {
    //         ZeroUnderwriterLockBytecodeLib: zeroUnderwriterLockBytecodeLib.address
    //     }
    // }));
    // const zeroController = await deployProxyFixedAddress(zeroControllerFactory, ["0x0F4ee9631f4be0a63756515141281A3E2B293Bbe", deployParameters["ETHEREUM"].gatewayRegistry], {
    //     unsafeAllowLinkedLibraries: true
    // });
    // const zeroControllerArtifact = await deployments.getArtifact('ZeroController');
    // await deployments.save('ZeroController', {
    //     contractName: 'ZeroController',
    //     address: zeroController.address,
    //     bytecode: zeroControllerArtifact.bytecode,
    //     abi: zeroControllerArtifact.abi
    // });
    // const BTCVault = await deployFixedAddress('BTCVault', {
    //     contractName: 'BTCVault',
    //     args: [deployParameters['ETHEREUM']['renBTC'], zeroController.address, "zeroBTC", "zBTC"],
    //     from: deployer
    // });
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
    const RENBTC_HOLDER = "0x9804bbbc49cc2a309e5f2bf66d4ad97c3e0ebd2f";
    await hre.network.provider.request({ method: 'hardhat_impersonateAccount', params: [RENBTC_HOLDER] });
    const signer = await ethers.getSigner(RENBTC_HOLDER);
    const renBTC = new Contract(deployParameters['ETHEREUM']['renBTC'], erc20abi, signer);

    // const [zSigner] = await ethers.getSigners();
    // const _zeroToken = new Contract(zeroToken.address, erc20abi, zSigner);

    console.log(`Begin Testing\n`)

    renBTC.approve(RENBTC_HOLDER, ethers.constants.MaxUint256)
    renBTC.approve(zeroDistributor.address, ethers.constants.MaxUint256)
    renBTC.approve(testTreasury.address, ethers.constants.MaxUint256)

    console.log(zeroToken.abi);

    await renBTC.transfer(testTreasury.address, ethers.utils.parseUnits('5', 8))

    renBTC.attach(testTreasury.address)



    // const signer = await ethers.getSigner(RENBTC_HOLDER);
    // console.log("signer Balance: ", await renBTC.balanceOf(signer.address));
    // const [hardhatSigner] = await ethers.getSigners();
    // await renBTC.approve(signer.address, ethers.constants.MaxUint256);
    // await renBTC.transfer(testTreasury.address, await renBTC.balanceOf(signer.address));
    // console.log("hardhatSigner Balance: ", await renBTC.balanceOf(hardhatSigner.address));
    // const [curveSigner] = await ethers.getSigners(RENBTC_HOLDER);
    // const contract = renBTC.connect(curveSigner);
    // console.log("curveSigner Balance: ", await renBTC.balanceOf(curveSigner.address));
    // const approveRenBtc = await renBTC.approve(testTreasury.address, ethers.constants.MaxUint256);
    // console.log("testTreasury Balance: ", await renBTC.balanceOf(testTreasury.address));
    // const tx = await contract.transfer(testTreasury.address, await renBTC.balanceOf(curveSigner.address));
    // console.log("testTreasury Balance: ", await renBTC.balanceOf(testTreasury.address));
    // const testApprove = await renBTC.approve(zeroDistributor.address, ethers.constants.MaxUint256);
    // const testingBalance = await renBTC.balanceOf(testTreasury.address);
    // const testTransfer = await renBTC.transfer(zeroDistributor.address, await renBTC.balanceOf(testTreasury.address));
    /**
     * Unformatted code
     * 
     * 
     * 
     */
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