const hre = require('hardhat');

// var wallet = new hre.ethers.Wallet(process.env.WALLET);
var { createGetGasPrice } = require('ethers-polygongastracker');

const main = async () => {
    const [ signer ] = await hre.ethers.getSigners();
    // signer.provider.estimateGas = createGetGasPrice("standard")
    // console.log(signer.address)
    // signer.provider.estimateGas = await createGetGasPrice("standard")
    
    // wallet = wallet.connect(signer.provider);
    // wallet.provider.getGasPrice = createGetGasPrice("rapid");

    const controller = await hre.ethers.getContract('DelegateUnderwriter');
    // console.log(await controller.setGovernance("0x4A423AB37d70c00e8faA375fEcC4577e3b376aCa"));
    // console.log(await ethers.getSigners())
    // const controller = await ethers.getContract('ArbitrumConvert')
    await controller.transferOwnership('0x46F71A5b3aCF70cc1Eab83234c158A27F350c66A')
    // console.log(await controller.owner())
    // await controller.addAuthority("0xFFEDC765778db2859820eE4869393e7939a847b7")
}

main().then(() => { console.log('done'); process.exit(0); }).catch((err) => { console.error(err); process.exit(1); });
