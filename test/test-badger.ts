const hre = require('hardhat');
const { deployments } = hre;
//@ts-ignore
const { BigNumber, utils } = ethers;
const { UnderwriterTransferRequest, UnderwriterBurnRequest } = require('../');
const { enableGlobalMockRuntime } = require('../dist/lib/mock');
const badger = require('../lib/badger');
var deployParameters = require('../lib/fixtures');
var deploymentUtils = require('../dist/lib/deployment-utils');

enableGlobalMockRuntime();
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

const getRepl = async (o) => {
  const r = require('repl').start('> ');
  Object.assign(r.context, o || {})
  await new Promise(() => {});
};

const toEIP712USDC = function (contractAddress, chainId) {
		this.contractAddress = contractAddress || this.contractAddress;
		this.chainId = chainId || this.chainId;
		return {
			types: {
				Permit: [
					{
						name: 'owner',
						type: 'address',
					},
					{
						name: 'spender',
						type: 'address',
					},
					{
						name: 'value',
						type: 'uint256'
					},
					{
						name: 'nonce',
						type: 'uint256',
					},
					{
						name: 'deadline',
						type: 'uint256',
					},
				],
			},
			domain: {
				name: "USD Coin",
				version: "2",
				chainId: String(this.chainId) || '1',
				verifyingContract: this.asset || ethers.constants.AddressZero,
			},
			message: {
				owner: this.owner,
				spender: contractAddress,
				nonce: this.tokenNonce,
				deadline: this.getExpiry(),
				value: this.amount
			},
			primaryType: 'Permit',
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
			module: deployParameters[process.env.CHAIN].renBTC,
			amount: utils.hexlify(utils.parseUnits('0.005', 8)),
			asset: deployParameters[process.env.CHAIN].WBTC,
			chainId,
			data: '0x',
			underwriter: contractAddress,
		});
		transferRequest.requestType = 'TRANSFER';
		await transferRequest.sign(signer);
		console.log('signed', transferRequest.signature);
		const tx = await transferRequest.repay(signer);
		console.log((await tx.wait()).gasUsed);
	});
	it('should do a wbtc burn', async () => {
		const contractAddress = (await hre.ethers.getContract('BadgerBridgeZeroController')).address;
		deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
		const [signer] = await hre.ethers.getSigners();
		const { chainId } = await signer.provider.getNetwork();
		console.log(chainId);
		const transferRequest = new UnderwriterBurnRequest({
			contractAddress,
			owner: await signer.getAddress(),
			amount: utils.hexlify(utils.parseUnits('0.005', 8)),
			asset: deployParameters[process.env.CHAIN].WBTC,
			chainId,
			underwriter: contractAddress,
			deadline: Math.floor((+new Date() + 1000 * 60 * 60 * 24) / 1000),
			destination: utils.hexlify(utils.randomBytes(64)),
		});
		console.log(transferRequest);
		const { sign, toEIP712 } = transferRequest;
		transferRequest.sign = async function (signer, contractAddress) {
			const asset = this.asset;
			this.asset = deployParameters[process.env.CHAIN].renBTC;
			const tokenNonce = String(
				await new ethers.Contract(
					this.contractAddress,
					['function nonces(address) view returns (uint256) '],
					signer,
				).nonces(await signer.getAddress()),
			);
			this.contractAddress = contractAddress;
			transferRequest.toEIP712 = function (...args: any[]) {
				this.asset = asset;
				this.tokenNonce = tokenNonce;
				this.assetName = 'WBTC';
				return toEIP712.apply(this, args);
			};
			return await sign.call(this, signer, contractAddress);
		};
		transferRequest.requestType = 'BURN';
		await transferRequest.sign(signer, contractAddress);
		console.log('signed', transferRequest.signature);
		const wbtc = new ethers.Contract(
			deployParameters[process.env.CHAIN].WBTC,
			['function approve(address, uint256)'],
			signer,
		);
		await wbtc.approve(transferRequest.contractAddress, ethers.constants.MaxUint256);
		const tx = await transferRequest.burn(signer);
		console.log((await tx.wait()).gasUsed);
	});
	it('should do a renbtc burn', async () => {
		const contractAddress = (await hre.ethers.getContract('BadgerBridgeZeroController')).address;
		deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
		const [signer] = await hre.ethers.getSigners();
		const { chainId } = await signer.provider.getNetwork();
		console.log(chainId);
		const transferRequest = new UnderwriterBurnRequest({
			contractAddress,
			owner: await signer.getAddress(),
			amount: utils.hexlify(utils.parseUnits('0.005', 8)),
			asset: deployParameters[process.env.CHAIN].renBTC,
			chainId,
			underwriter: contractAddress,
			deadline: Math.floor((+new Date() + 1000*60*60*24) / 1000),
			destination: utils.hexlify(utils.randomBytes(64))
		});
		console.log(transferRequest);
		const { sign, toEIP712 } = transferRequest;
		transferRequest.requestType = 'BURN';
		await transferRequest.sign(signer, contractAddress);
		console.log('signed', transferRequest.signature);
		const tx = (await transferRequest.burn(signer));
		console.log((await tx.wait()).gasUsed);
	});
	it('should do a transfer of ibbtc', async () => {
		const contractAddress = (await hre.ethers.getContract('BadgerBridgeZeroController')).address;
		deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
		const [signer] = await hre.ethers.getSigners();
		const { chainId } = await signer.provider.getNetwork();
		const transferRequest = new UnderwriterTransferRequest({
			contractAddress,
			nonce: utils.hexlify(utils.randomBytes(32)),
			to: await signer.getAddress(),
			pNonce: utils.hexlify(utils.randomBytes(32)),
			module: '0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F',
			amount: utils.hexlify(utils.parseUnits('0.5', 8)),
			asset: deployParameters[process.env.CHAIN].WBTC,
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
	it('should do a transfer of usdc', async () => {
		const contractAddress = (await hre.ethers.getContract('BadgerBridgeZeroController')).address;
		deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
		const [signer] = await hre.ethers.getSigners();
		const { chainId } = await signer.provider.getNetwork();
		const transferRequest = new UnderwriterTransferRequest({
			contractAddress,
			nonce: utils.hexlify(utils.randomBytes(32)),
			to: await signer.getAddress(),
			pNonce: utils.hexlify(utils.randomBytes(32)),
			module: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
			amount: utils.hexlify(utils.parseUnits('0.5', 8)),
			asset: deployParameters[process.env.CHAIN].WBTC,
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
	it('should do a transfer of eth', async () => {
		const contractAddress = (await hre.ethers.getContract('BadgerBridgeZeroController')).address;
		deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
		const [signer] = await hre.ethers.getSigners();
		const { chainId } = await signer.provider.getNetwork();
		const transferRequest = new UnderwriterTransferRequest({
			contractAddress,
			nonce: utils.hexlify(utils.randomBytes(32)),
			to: await signer.getAddress(),
			pNonce: utils.hexlify(utils.randomBytes(32)),
			module: ethers.constants.AddressZero,
			amount: utils.hexlify(utils.parseUnits('0.5', 8)),
			asset: deployParameters[process.env.CHAIN].WBTC,
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
	it('should do a usdc burn', async () => {
		const contractAddress = (await hre.ethers.getContract('BadgerBridgeZeroController')).address;
		deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
		const [signer] = await hre.ethers.getSigners();
		const { chainId } = await signer.provider.getNetwork();
		console.log(chainId);
		const transferRequest = new UnderwriterBurnRequest({
			contractAddress,
			owner: await signer.getAddress(),
			amount: utils.hexlify(utils.parseUnits('1000', 6)),
			asset: deployParameters[process.env.CHAIN].USDC,
			chainId,
			underwriter: contractAddress,
			deadline: Math.floor((+new Date() + 1000*60*60*24) / 1000),
			destination: utils.hexlify(utils.randomBytes(64))
		});
		transferRequest.toEIP712 = toEIP712USDC;
		transferRequest.requestType = 'BURN';
		await transferRequest.sign(signer, contractAddress);
		console.log('signed', transferRequest.signature);
		const tx = (await transferRequest.burn(signer));
		console.log((await tx.wait()).gasUsed);
	});
	it('should do a ibbtc burn', async () => {
		const contractAddress = (await hre.ethers.getContract('BadgerBridgeZeroController')).address;
		deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
		const [signer] = await hre.ethers.getSigners();
		const { chainId } = await signer.provider.getNetwork();
		console.log(chainId);
                const ibbtc = new ethers.Contract('0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F', [ 'function balanceOf(address) view returns (uint256)', 'function approve(address, uint256)' ], signer);
		const transferRequest = new UnderwriterBurnRequest({
			contractAddress,
			owner: await signer.getAddress(),
			amount: utils.hexlify(await ibbtc.balanceOf(await signer.getAddress())),
			asset: '0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F',
			chainId,
			underwriter: contractAddress,
			deadline: Math.floor((+new Date() + 1000*60*60*24) / 1000),
			destination: utils.hexlify(utils.randomBytes(64))
		});
		const { sign, toEIP712 } = transferRequest;
		transferRequest.sign = async function (signer, contractAddress) {
		  const asset = this.asset;
		  this.asset = deployParameters[process.env.CHAIN].renBTC;
	          const tokenNonce = String(await (new ethers.Contract(this.contractAddress, [ 'function nonces(address) view returns (uint256) '], signer)).nonces(await signer.getAddress()));
		  this.contractAddress = contractAddress;
		  transferRequest.toEIP712 = function (...args: any[]) {
	            this.asset = asset;
	            this.tokenNonce = tokenNonce;
		    this.assetName = 'ibBTC';
		    return toEIP712.apply(this, args);
		  };
		  return await sign.call(this, signer, contractAddress);
		};
		console.log(transferRequest);
		transferRequest.requestType = 'BURN';
		await transferRequest.sign(signer, contractAddress);
		console.log('signed', transferRequest.signature);
		await ibbtc.approve(contractAddress, ethers.constants.MaxUint256);
		const tx = (await transferRequest.burn(signer));
		console.log((await tx.wait()).gasUsed);
	});
});
