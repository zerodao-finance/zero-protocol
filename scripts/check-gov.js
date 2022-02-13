'use strict'

const { createGetGasPrice } = require('ethers-polygongastracker')

const getGasProce = createGetGasPrice()


const hre = require('hardhat')
const { ethers } = hre


const main = async () => {
    
    // console.log(await ethers.getSigners())
    const controller = await ethers.getContract('ArbitrumConvert')
    // await controller.transferOwnership('0x4A423AB37d70c00e8faA375fEcC4577e3b376aCa')
    console.log(await controller.owner())
    // console.log(await controller.lockFor("0x01A240EE2D537FBC2D1A7db5540490b674be7D51"))
};



main().then(() => { console.log('done'); process.exit(0); }).catch((err) => { console.error(err); process.exit(1); });