const { createGetGasPrice } = require('ethers-polygongastracker')
const deployParameters = require('../lib/fixtures')



const hre = require('hardhat')
const { ethers, deployments } = hre
const wallet = new hre.ethers.Wallet(process.env.WALLET)

const main = async () => {

    const [signer] = await ethers.getSigners()
    wallet = wallet.connect(signer.provider)
    wallet.provider.getGasPrice = createGetGasPrice()

    let { abi } = await deployments.getArtifact('BTCVault')
    const network = "MATIC"

    console.log(wallet.address)
    

    const RenBTC = await new ethers.Contract(deployParameters[network]['renBTC'], abi, wallet)
    // await RenBTC.approve("0x3A9145b3A840D70650FFA483461468415C4B7bed", ethers.constants.MaxUint256)  
    // await RenBTC.approve("0x55C7A6b140A31271ACFC8f715e08B497a774784E", ethers.constants.MaxUint256)  
    
    let { abi } = await deployments.getArtifact('yVault')

    const yVault = await new ethers.Contract("0x55C7A6b140A31271ACFC8f715e08B497a774784E", abi, wallet)
    // await yVault.approve("0x3A9145b3A840D70650FFA483461468415C4B7bed", ethers.constants.MaxUint256)
    // await yVault.transfer("0x3A9145b3A840D70650FFA483461468415C4B7bed",  await yVault.balanceOf(wallet.address))
    console.log(ethers.utils.formatUnits(await yVault.balanceOf("0x3A9145b3A840D70650FFA483461468415C4B7bed")))
    // await yVault.deposit(await RenBTC.balanceOf(wallet.address))


    // console.log(ethers.utils.formatUnits(await yVault.balanceOf(wallet.address)))
    // console.log(ethers.utils.formatUnits(await RenBTC.balanceOf("0x3A9145b3A840D70650FFA483461468415C4B7bed"), 8))
    

    


}


main().then(() => { console.log('done'); process.exit(0) }).catch((err) => { console.error(err); process.exit(1)})