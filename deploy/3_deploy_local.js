const hre = require("hardhat");
const { ethers, deployments } = hre
const deployParameters = require('../lib/fixtures');

const network = process.env.CHAIN || 'MATIC';
const SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";
// const abi = [
//     'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
//     'function mintFee() view returns (uint256)',
//     'function approve(address _spender, uint256 _value) returns (bool)',
//     'function transferFrom(address _from, address _to, uint256 _value) returns (bool)',
//     'function allowance(address _owner, address _spender) view returns (uint256)'
// ];

module.exports = async ({
    getChainId,
    getUnnamedAccounts,
    getNamedAccounts
}) => {
    if (!process.env.FORKING) return
    
    // set an arbitrary amount of tokens to send
    // get abi
    let arbitraryTokens = (ethers.utils.parseUnits("8", 8)).toString()
    const { abi } = await deployments.getArtifact("BTCVault")

    // impersonate Curve Ren for network
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [deployParameters[network]['Curve_Ren']]
    })
    const signer = await ethers.getSigner(deployParameters[network]['Curve_Ren'])
    console.log('signer is', signer.address)

    //get zeroController contract
    const zeroController = await ethers.getContract("ZeroController", SIGNER_ADDRESS)
    const zcntrl_address = await zeroController.lockFor(SIGNER_ADDRESS)
    console.log("zero controller address", zcntrl_address)


    const renBTC = new ethers.Contract(deployParameters[network]['renBTC'], abi, signer);
    const connectedRenBTC = await renBTC.connect(signer) // attach curve_ren provider

    const balance = await renBTC.balanceOf(deployParameters[network]["Curve_Ren"])
    console.log(ethers.utils.formatUnits(balance, 8))
    console.log(ethers.utils.formatUnits(arbitraryTokens, 8))
    console.log(await renBTC.balanceOf(zcntrl_address))

    await connectedRenBTC.transfer(zcntrl_address, arbitraryTokens, {from: signer.address, value: '0'})





    // // const signer = (await ethers.getSigner(deployParameters[network]["Curve_Ren"])) 
    // // approve approve transfering arbitrary funds
    // renBTC.approve(deployParameters[network]["Curve_Ren"], arbitraryTokens)
    // // renBTC.allowance(deployParameters[network]["Curve_Ren"], zcnrtl_address)
    // // const Curve = new ethers.Contract(deployParameters[network]['Curve_Ren'], abi, signer)


    // let approveRequest = await renBTC.approve(SIGNER_ADDRESS, arbitraryTokens)
    // let allowance = await renBTC.allowance(deployParameters[network]["Curve_Ren"], SIGNER_ADDRESS)
    // let transferRequest = await renBTC.transferFrom(deployParameters[network]["Curve_Ren"], SIGNER_ADDRESS, arbitraryTokens)
    // console.log(transferRequest, approveRequest)
    

    

    // console.log(await btcGateway.balanceOf())
    // console.log("Testing Keeper with", ethers.utils.formatUnits(await signer.getBalance(), 8))


}