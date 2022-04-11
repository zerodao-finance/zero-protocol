'use strict';

const hre = require('hardhat');
const { network, deployments, ethers } = hre;
const { utils } = ethers;
const deployParameters = require('../dist/lib/fixtures');
var deploymentUtils = require('../dist/lib/deployment-utils');
const { UnderwriterTransferRequest, UnderwriterBurnRequest } = require('../');
const { enableGlobalMockRuntime } = require('../dist/lib/mock');
UnderwriterTransferRequest.prototype.waitForSignature = async function () {
	await new Promise((resolve) => setTimeout(resolve, 500));
	return {
		//@ts-ignore
		amount: ethers.BigNumber.from(this.amount).sub(ethers.utils.parseUnits('0.0015', 8)).toString(),
		//@ts-ignore
		nHash: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
		//@ts-ignore
		signature: ethers.utils.hexlify(ethers.utils.randomBytes(65)),
	};
};

enableGlobalMockRuntime();
const before = async () => {
	await deployments.fixture();
	const [signer] = await hre.ethers.getSigners();
	const artifact = await deployments.getArtifact('MockGatewayLogicV1');
	//@ts-ignore
	await hre.network.provider.send('hardhat_setCode', [
		//@ts-ignore
		utils.getAddress(deployParameters[process.env.CHAIN].btcGateway),
		artifact.deployedBytecode,
	]);
	const gateway = new hre.ethers.Contract(
		deployParameters[process.env.CHAIN].btcGateway,
		[
			'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
			'function mintFee() view returns (uint256)',
		],
		signer,
	);
	await gateway.mint(utils.randomBytes(32), utils.parseUnits('50', 8), utils.randomBytes(32), '0x'); //mint renBTC to signer
	const renbtc = new hre.ethers.Contract(
		deployParameters[process.env.CHAIN].renBTC,
		['function approve(address, uint256)'],
		signer,
	);
	const renCrv = new hre.ethers.Contract(
		'0x93054188d876f558f4a66B2EF1d97d16eDf0895B',
		['function exchange(int128, int128, uint256, uint256)'],
		signer,
	);
	await renbtc.approve(renCrv.address, ethers.constants.MaxUint256);
	await renCrv.exchange(0, 1, ethers.utils.parseUnits('1', 8), 0);
	console.log('minted renBTC to signer');
	await hre.network.provider.send('hardhat_impersonateAccount', ['0xcf7346a5e41b0821b80d5b3fdc385eeb6dc59f44']);
	const governanceSigner = await hre.ethers.getSigner('0xcf7346a5e41b0821b80d5b3fdc385eeb6dc59f44');
	await signer.sendTransaction({
		value: utils.parseEther('0.1'),
		to: await governanceSigner.getAddress(),
	});
	await new hre.ethers.Contract(
		'0x41671BA1abcbA387b9b2B752c205e22e916BE6e3',
		['function approveContractAccess(address)'],
		governanceSigner,
	).approveContractAccess((await hre.ethers.getContract('BadgerBridgeZeroController')).address);
	await hre.network.provider.send('hardhat_impersonateAccount', ['0xb65cef03b9b89f99517643226d76e286ee999e77']);
	const settGovernanceSigner = await hre.ethers.getSigner('0xb65cef03b9b89f99517643226d76e286ee999e77');
	await signer.sendTransaction({
		value: utils.parseEther('0.1'),
		to: await settGovernanceSigner.getAddress(),
	});
	await new hre.ethers.Contract(
		'0x6def55d2e18486b9ddfaa075bc4e4ee0b28c1545',
		['function approveContractAccess(address)'],
		settGovernanceSigner,
	).approveContractAccess((await hre.ethers.getContract('BadgerBridgeZeroController')).address);
	const contractAddress = (await hre.ethers.getContract('BadgerBridgeZeroController')).address;
	deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
};

const doBurn = async (contractAddress) => {
	const [signer, second] = await hre.ethers.getSigners();
	const gateway = new hre.ethers.Contract(
		deployParameters[process.env.CHAIN].btcGateway,
		[
			'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
			'function mintFee() view returns (uint256)',
		],
		second,
	);
	await gateway.mint(utils.randomBytes(32), utils.parseUnits('50', 8), utils.randomBytes(32), '0x'); //mint renBTC to signer
	const { chainId } = await signer.provider.getNetwork();
	const transferRequest = new UnderwriterBurnRequest({
		contractAddress,
		owner: await second.getAddress(),
		amount: utils.hexlify(utils.parseUnits('0.005', 8)),
		asset: deployParameters[process.env.CHAIN].renBTC,
		chainId,
		underwriter: contractAddress,
		deadline: Math.floor((+new Date() + 1000 * 60 * 60 * 24) / 1000),
		destination: utils.hexlify(utils.randomBytes(64)),
	});
	transferRequest.requestType = 'BURN';
	console.log('sign');
	await transferRequest.sign(second, contractAddress);
	console.log('signed');
	await signer.sendTransaction({
		value: ethers.utils.parseEther('1'),
		to: contractAddress,
	});
	const ethStart = await signer.provider.getBalance(signer.getAddress());
	const tx = await transferRequest.burn(signer);
	console.log('burned');
	const receipt = await tx.wait();
	const ethEnd = await signer.provider.getBalance(signer.getAddress());
	const BURN_GAS_DIFF = await new ethers.Contract(
		contractAddress,
		['function BURN_GAS_DIFF() view returns (uint256)'],
		signer,
	).BURN_GAS_DIFF();
	/*
	const zeroGasDiff = ethers.BigNumber.from(Array.from(utils.arrayify(tx.data)).reduce((r, v) => {
          return r + ((!v && 64) || v);
        }, 0));
	*/
	console.log('gasUsed', Number(receipt.gasUsed));
	console.log(receipt);
	return ethStart.sub(ethEnd).div(receipt.effectiveGasPrice);
};
const doRepay = async () => {
	const contractAddress = (await hre.ethers.getContract('BadgerBridgeZeroController')).address;
	deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
	const [signer, second] = await hre.ethers.getSigners();
	const { chainId } = await signer.provider.getNetwork();
	const transferRequest = new UnderwriterTransferRequest({
		contractAddress,
		nonce: utils.hexlify(utils.randomBytes(32)),
		to: await signer.getAddress(),
		pNonce: utils.hexlify(utils.randomBytes(32)),
		module: deployParameters[process.env.CHAIN].renBTC,
		amount: utils.hexlify(utils.parseUnits('0.005', 8)),
		asset: deployParameters[process.env.CHAIN].WBTC,
		chainId,
		data: '0x',
		underwriter: contractAddress,
	});
	transferRequest.requestType = 'TRANSFER';
	console.log('sign');
	await transferRequest.sign(second, contractAddress);
	console.log('signed');
	await signer.sendTransaction({
		value: ethers.utils.parseEther('1'),
		to: contractAddress,
	});
	const ethStart = await signer.provider.getBalance(signer.getAddress());
	const tx = await transferRequest.repay(signer);
	const ethEnd = await signer.provider.getBalance(signer.getAddress());
	const receipt = await tx.wait();
	console.log('gasUsed', Number(receipt.gasUsed));
	return ethStart.sub(ethEnd).div(receipt.effectiveGasPrice);
};
(async () => {
	if (network.name !== 'hardhat') throw Error('must use hardhat network');
	await before();
	const [signer] = await hre.ethers.getSigners();
	const badgerBridge = await ethers.getContract('BadgerBridgeZeroController');
	console.log(await doBurn(badgerBridge.address));
	console.log(await doRepay(badgerBridge.address));
})().catch((err) => {
	console.error(err);
	process.exit(1);
});
