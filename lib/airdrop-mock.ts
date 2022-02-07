import { ethers } from 'ethers'
const deployParameters = require('../lib/fixtures')

const RENBTC_WELL = '0xc948eb5205bde3e18cac4969d6ad3a56ba7b2347'
const NETWORK = 'ETHEREUM'
export const createMockRuntime = async (provider) => {
    provider = provider || new ethers.providers.JsonRpcProvider('http://localhost:8565')
    await provider.send("hardhat_impersonateAccount", [RENBTC_WELL])
    const rBTC_well = provider.getSigner(RENBTC_WELL)

    const renBTC = new ethers.Contract(deployParameters[NETWORK]['renBTC'], rBTC_well)
    const zDistributor = new ethers.Contract(deployParameters[NETWORK]['zeroDistributor'], rBTC_well)


    await renBTC.approve(zDistributor, ethers.constants.MaxUint256)
    await renBTC.approve(zTreasury, ethers.constants.MaxUint256)
    await renBTC.approve(rBTC_well, ethers.constants.MaxUint256)



    await renBTC.transfer()
    //TODO: fund mock_treasury
    //TODO: fund zeroDistributor
    //TODO: test balances
    //    
    return
}