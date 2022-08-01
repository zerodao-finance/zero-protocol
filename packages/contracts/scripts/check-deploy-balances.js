const hre = require('hardhat');
const deployParameters = require('../lib/fixtures')

const network = process.env.CHAIN || 'MATIC';



(async () => {
    const [signer] = await hre.ethers.getSigners();
    const artifact = await hre.deployments.getArtifact('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20')
    const abi = artifact.abi
    const btcVault = await hre.ethers.getContract("DelegateUnderwriter")
    console.log(await btcVault.owner())

    const zBTC = new hre.ethers.Contract('0x55C7A6b140A31271ACFC8f715e08B497a774784E', abi, signer)
    console.log(hre.ethers.utils.formatUnits(await zBTC.balanceOf(btcVault.address), 8))
    return
})()