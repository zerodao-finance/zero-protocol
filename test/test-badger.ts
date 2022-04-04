const hre = require('hardhat');
const { deployments } = hre;
const { BigNumber, utils } = hre.ethers;
const { UnderwriterTransferRequest } = require('../');
const { enableGlobalMockRuntime } = require('../dist/lib/mock');
var deployParameters = require('../lib/fixtures');
var deploymentUtils = require('../dist/lib/deployment-utils');

enableGlobalMockRuntime();
UnderwriterTransferRequest.prototype.waitForSignature = async function () {
	await new Promise((resolve) => setTimeout(resolve, 500));
	return {
		amount: ethers.BigNumber.from(this.amount).sub(ethers.utils.parseUnits('0.0015', 8)).toString(),
		nHash: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
		signature: ethers.utils.hexlify(ethers.utils.randomBytes(65)),
	};
};

describe('BadgerBridgeZeroController', () => {
	before(async () => {
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
		console.log('minted renBTC to signer');
	});
	it('should do a transfer', async () => {
		const contractAddress = (await hre.ethers.getContract('BadgerBridgeZeroController')).address;
		deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
		const [signer] = await hre.ethers.getSigners();
		const { chainId } = await signer.provider.getNetwork();
		const transferRequest = new UnderwriterTransferRequest({
			contractAddress,
			nonce: utils.hexlify(utils.randomBytes(32)),
			to: await signer.getAddress(),
			pNonce: utils.hexlify(utils.randomBytes(32)),
			module: hre.ethers.constants.AddressZero,
			amount: utils.hexlify(utils.parseUnits('0.005', 8)),
			asset: deployParameters[process.env.CHAIN].wBTC,
			chainId,
			data: '0x',
			underwriter: contractAddress,
		});
		transferRequest.requestType = 'TRANSFER';
		await transferRequest.sign(signer);
		console.log('signed', transferRequest.signature);
		const tx = (await transferRequest.repay(signer));
		console.log((await tx.wait()).gasUsed);
	});
});
