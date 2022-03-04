const hre = require('hardhat');
const { ethers, deployments } = hre;
const deployParameters = require('../lib/fixtures');
const { TEST_KEEPER_ADDRESS } = require('../lib/mock');

const { fundWithGas, deployFixedAddress, getSigner, getContract } = require('./common');
const network = process.env.CHAIN || 'MATIC';
const SIGNER_ADDRESS = '0x0F4ee9631f4be0a63756515141281A3E2B293Bbe';
// const abi = [
//     'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
//     'function mintFee() view returns (uint256)',
//     'function approve(address _spender, uint256 _value) returns (bool)',
//     'function transferFrom(address _from, address _to, uint256 _value) returns (bool)',
//     'function allowance(address _owner, address _spender) view returns (uint256)'
// ];
//
//

module.exports = async ({ getChainId, getUnnamedAccounts, getNamedAccounts }) => {
	if (!process.env.FORKING || process.env.CHAIN === 'ETHEREUM') return;

	// set an arbitrary amount of tokens to send
	// get abi
	let arbitraryTokens = ethers.utils.parseUnits('8', 8).toString();
	const [hardhatSigner] = await hre.ethers.getSigners();
	console.log('sending eth');
	await hre.network.provider.send('hardhat_setBalance', [
		deployParameters[network]['Curve_Ren'],
		ethers.utils.hexStripZeros(ethers.utils.parseEther('10.0').toHexString()),
	]);
	console.log('sent eth');

	//get zeroController contract
	const zeroController = await getContract('ZeroController');

	/*
console.log('zero controller address', zcntrl_address);

const vault = await getContract('BTCVault');
const renBTC = new ethers.Contract(deployParameters[network]['renBTC'], vault.interface, signer);
const connectedRenBTC = await renBTC.connect(signer); // attach curve_ren provider

const balance = await renBTC.balanceOf(deployParameters[network]['Curve_Ren']);
console.log(ethers.utils.formatUnits(balance, 8));
console.log(ethers.utils.formatUnits(arbitraryTokens, 8));
console.log(await renBTC.balanceOf(zcntrl_address));

await connectedRenBTC.transfer(zcntrl_address, arbitraryTokens, { from: signer.address, value: '0' });
console.log('DONE');
*/
	// commented above out because it doesn't do anything. ZeroController.lockFor(signerAddress) will return a meaningless address. ZeroController.lockFor(delegateUnderwriter.address) will return the address for the lock contract for the Underwriter, this is the contract you have to fund with zeroBTC for the underwriter to be able to write loans

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

	const [deployerSigner] = await hre.ethers.getSigners();
	const deployer = await deployerSigner.getAddress();
	if (process.env.CHAIN === 'ARBITRUM') {
		const controller = await getContract('ZeroController');
		const quick = await deployFixedAddress('ArbitrumConvertQuick', {
			args: [controller.address, ethers.utils.parseUnits('15', 8), '100000'],
			contractName: 'ArbitrumConvertQuick',
			libraries: {},
			from: deployer,
		});
		const meta = await deployFixedAddress('MetaRequest', {
			args: [controller.address, ethers.utils.parseUnits('15', 8), '100000'],
			contractName: 'MetaRequest',
			libraries: {},
			from: deployer,
		});
		/*
		const governanceSigner = await getSigner(await controller.governance());
		await fundWithGas(await governanceSigner.getAddress());
		await controller.connect(governanceSigner).approveModule(quick.address, true);
		*/
	}

	const keeperSigner = await getSigner(TEST_KEEPER_ADDRESS);
};
