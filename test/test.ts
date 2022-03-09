import * as hre from 'hardhat';
import { UnderwriterTransferRequest, TransferRequest, MetaRequest, UnderwriterMetaRequest } from '../lib/zero';
import { ZeroUser } from '../lib/p2p/core';
import { expect } from 'chai';
import { override } from '../lib/test/inject-mock';
//@ts-ignore
import GatewayLogicV1 from '../artifacts/contracts/test/GatewayLogicV1.sol/GatewayLogicV1.json';
//@ts-ignore
import BTCVault from '../artifacts/contracts/vaults/BTCVault.sol/BTCVault.json';
import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from '@ethersproject/abstract-provider';
import { Wallet, Contract, providers, utils } from 'ethers';
import { createMockKeeper, enableGlobalMockRuntime } from '../lib/mock';
//@ts-expect-error
const { ethers, deployments } = hre;
const gasnow = require('ethers-gasnow');

const deployParameters = require('../lib/fixtures');

const network = process.env.CHAIN || 'MATIC';

//ethers.providers.BaseProvider.prototype.getGasPrice = gasnow.createGetGasPrice('rapid');
const USDC_MAINNET_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

let _signers;
const _getSigners = ethers.getSigners;
/*
if (process.env.FORKING === 'true')
	ethers.getSigners = async () => {
		if (!_signers) _signers = await _getSigners.call(ethers);
		return [new ethers.Wallet(process.env.WALLET, _signers[0].provider)];
	};
 */

const toAddress = (contractOrAddress: any): string => contractOrAddress.address || contractOrAddress;
const mintRenBTC = async (amount: any, signer?: any) => {
	const abi = [
		'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
		'function mintFee() view returns (uint256)',
	];
	if (!signer) signer = (await ethers.getSigners())[0];
	//@ts-ignore
	const btcGateway = new ethers.Contract(deployParameters[network]['btcGateway'], abi, signer);
	await btcGateway.mint(
		ethers.utils.hexlify(ethers.utils.randomBytes(32)),
		amount,
		ethers.utils.hexlify(ethers.utils.randomBytes(32)),
		'0x',
	);
};

const getContract = async (...args: any[]) => {
	try {
		/*
				const c = require('../deployments/arbitrum/' + args[0]);
				return new ethers.Contract(c.address, c.abi, args[args.length - 1]);
		*/
		return await ethers.getContract(...args); //.attach(require('../deployments/arbitrum/' + args[0]).address);
	} catch (e) {
		console.error(e);
		return new ethers.Contract(ethers.constants.AddressZero, [], (await ethers.getSigners())[0]);
	}
};

const getContractFactory = async (...args: any[]) => {
	try {
		return await ethers.getContractFactory(...args);
	} catch (e) {
		return new ethers.ContractFactory('0x', [], (await ethers.getSigners())[0]);
	}
};

const convert = async (controller: any, tokenIn: any, tokenOut: any, amount: any, signer?: any): Promise<any> => {
	const [tokenInAddress, tokenOutAddress] = [tokenIn, tokenOut].map((v) => toAddress(v));
	const swapAddress = await controller.converters(tokenInAddress, tokenOutAddress);
	const converterContract = new ethers.Contract(
		swapAddress,
		['function convert(address) returns (uint256)'],
		signer || controller.signer || controller.provider,
	);

	if (tokenIn === ethers.constants.AddressZero) {
		await controller.signer.sendTransaction({ value: amount, to: swapAddress });
		const tx = await converterContract.convert(ethers.constants.AddressZero);
		return tx;
	} else {
		const tokenInContract = new ethers.Contract(
			tokenInAddress,
			['function transfer(address, uint256) returns (bool)'],
			signer || controller.signer || controller.provider,
		);
		await tokenInContract.transfer(swapAddress, amount);
		const tx = await converterContract.convert(ethers.constants.AddressZero);
		return tx;
	}
};

const getImplementation = async (proxyAddress: string) => {
	const [{ provider }] = await ethers.getSigners();
	return utils.getAddress(
		(
			await provider.getStorageAt(
				proxyAddress,
				'0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
			)
		).substr((await provider.getNetwork()).chainId === 1337 ? 0 : 26),
	);
};

var underwriterAddress = '0x' + '00'.repeat(20);

const deployUnderwriter = async () => {
	const { signer, controller, renBTC, btcVault } = await getFixtures();
	/*
	const underwriterFactory = await getContractFactory('DelegateUnderwriter', signer);
	underwriterAddress = (await underwriterFactory.deploy(controller.address)).address;
       */
	underwriterAddress = (await ethers.getContract('DelegateUnderwriter')).address;
	await renBTC.approve(btcVault.address, ethers.constants.MaxUint256); //let btcVault spend renBTC on behalf of signer
	await btcVault.approve(controller.address, ethers.constants.MaxUint256); //let controller spend btcVault tokens
	//await mintUnderwriterNFTIfNotMinted();
};

const mintUnderwriterNFTIfNotMinted = async () => {
	const { signer, controller, renBTC, btcVault } = await getFixtures();
	const lock = await controller.provider.getCode(await controller.lockFor(underwriterAddress));
	if (lock === '0x') await controller.mint(underwriterAddress, btcVault.address);
};

const underwriterDeposit = async (amountOfRenBTC: string) => {
	const { btcVault, controller } = await getFixtures();
	await btcVault.deposit(amountOfRenBTC); //deposit renBTC into btcVault from signer
	console.log('deposited renBTC');
	console.log('Underwriter address is', underwriterAddress);
	await mintUnderwriterNFTIfNotMinted();
};

const getStrategyContract = async (signer) => {
	if (process.env.CHAIN === 'ARBITRUM') return await getContract('StrategyRenVMArbitrum', signer);
	return await getContract('StrategyRenVM', signer);
};

const getFixtures = async () => {
	const [signer] = await ethers.getSigners();
	const controller = await getContract('ZeroController', signer);
	const { abi: erc20abi } = await deployments.getArtifact('BTCVault');
	const { chainId } = await controller.provider.getNetwork();

	return {
		signer: signer,
		signerAddress: await signer.getAddress(),
		controller: controller,
		strategy: await getStrategyContract(signer),
		btcVault: await getContract('BTCVault', signer),
		swapModule:
			network === 'ARBITRUM'
				? await getContract('ArbitrumConvert', signer)
				: await getContract('PolygonConvert', signer),
		convertModule:
			network === 'ARBITRUM'
				? await getContract('ArbitrumConvert', signer)
				: await getContract('PolygonConvert', signer),
		uniswapFactory: await getContract('ZeroUniswapFactory', signer),
		curveFactory: await getContract('ZeroCurveFactory', signer),
		wrapper: await getContract('WrapNative', signer),
		unwrapper: await getContract('UnwrapNative', signer),
		//@ts-ignore
		gateway: new Contract(deployParameters[network]['btcGateway'], GatewayLogicV1.abi, signer),
		//@ts-ignore
		renBTC: new Contract(deployParameters[network]['renBTC'], erc20abi, signer),
		//@ts-ignore
		wETH: new Contract(deployParameters[network]['wNative'], erc20abi, signer),
		//@ts-ignore
		usdc: new Contract(deployParameters[network]['USDC'], erc20abi, signer),
		//@ts-ignore
		wBTC: new Contract(deployParameters[network]['wBTC'], erc20abi, signer),
		yvWBTC: await getContract('DummyVault', signer),
	};
};

const getBalances = async () => {
	return;
	const { swapModule, strategy, controller, btcVault, signerAddress, renBTC, wETH, usdc, wBTC, yvWBTC } =
		await getFixtures();
	const wallets: { [index: string]: string } = {
		Wallet: signerAddress,
		BTCVault: btcVault.address,
		Controller: controller.address,
		Strategy: strategy.address,
		yvWBTC: yvWBTC.address,
		'Swap Module': swapModule.address,
	};
	const tokens: { [index: string]: any } = {
		renBTC,
		wETH,
		ETH: 0,
		usdc,
		wBTC,
		yvWBTC,
		zBTC: btcVault,
	};
	const getBalance = async (wallet: string, token: Contract) => {
		let decimals, balance;
		try {
			decimals = await token.decimals();
		} catch (e) {
			console.log('failed to get decimals ' + token.address);
		}
		balance = await token.balanceOf(wallet);
		return String((balance / 10 ** decimals).toFixed(2));
	};
	console.table(
		Object.fromEntries(
			await Promise.all(
				Object.keys(wallets).map(async (name) => {
					const wallet: string = wallets[name];
					return [
						name,
						Object.fromEntries(
							await Promise.all(
								Object.keys(tokens).map(async (token) => {
									if (token === 'ETH') {
										const balance = await wETH.provider.getBalance(wallet);
										return [token, String(Number(utils.formatEther(balance)).toFixed(2))];
									} else {
										const tokenContract = tokens[token];
										return [token, await getBalance(wallet, tokenContract)];
									}
								}),
							),
						),
					];
				}),
			),
		),
	);
};

const generateTransferRequest = async (amount: number) => {
	const { convertModule, swapModule, signerAddress } = await getFixtures();
	const { underwriter } = await getUnderwriter();
	return new TransferRequest({
		module: process.env.CHAIN === 'ARBITRUM' ? convertModule.address : swapModule.address,
		to: signerAddress,
		underwriter: underwriter.address,
		//@ts-ignore
		asset: deployParameters[network]['renBTC'],
		amount: String(amount),
		data: ethers.utils.defaultAbiCoder.encode(['uint256'], [ethers.utils.parseEther('0.01')]),
	});
};

const getUnderwriter = async () => {
	const { signer, controller } = await getFixtures();
	const underwriterFactory = await getContractFactory('DelegateUnderwriter', signer);
	return {
		underwriterFactory,
		underwriterAddress,
		underwriter: new Contract(underwriterAddress, underwriterFactory.interface, signer),
		underwriterImpl: new Contract(underwriterAddress, controller.interface, signer),
		lock: ethers.constants.AddressZero || (await controller.lockFor(underwriterAddress)),
	};
};

const getWrapperContract = async (address: string) => {
	const { signer } = await getFixtures();
	const wrapperAbi = (await deployments.getArtifact('ZeroUniswapWrapper')).abi;
	return new Contract(address, wrapperAbi, signer);
};

describe('Zero', () => {
	if (process.env.CHAIN === 'ETHEREUm') return;
	var prop;
	before(async () => {
		await deployments.fixture();
		await deployUnderwriter();
		const artifact = await deployments.getArtifact('MockGatewayLogicV1');
		//@ts-ignore
		await hre.network.provider.send('hardhat_setCode', [
			//@ts-ignore
			hre.ethers.utils.getAddress(deployParameters[process.env.CHAIN].btcGateway),
			artifact.deployedBytecode,
		]);
		const { gateway } = await getFixtures();
		await gateway.mint(utils.randomBytes(32), utils.parseUnits('50', 8), utils.randomBytes(32), '0x'); //mint renBTC to signer
		console.log('minted renBTC to signer');
		const delegate = await ethers.getContract('DelegateUnderwriter');
		const controller = await ethers.getContract('ZeroController');
		const lock = await controller.lockFor(delegate.address);
		console.log('got lock for delegateUnderwriter');
		const btcVault = await ethers.getContract('BTCVault');
		const renbtc = new ethers.Contract(deployParameters[network].renBTC, btcVault.interface, btcVault.signer);
		await renbtc.approve(btcVault.address, ethers.constants.MaxUint256);
		await btcVault.setMin(25);
		console.log('depositing on btcVault');
		await btcVault.deposit(ethers.utils.parseUnits('10', 8));
		await btcVault.transfer(lock, btcVault.balanceOf(btcVault.signer.getAddress()));
	});

	beforeEach(async function () {
		console.log('\n');
		//@ts-ignore
		console.log('='.repeat(32), 'Beginning Test', '='.repeat(32));
		console.log('Test:', this.currentTest.title, '\n');
		console.log('Initial Balances:');
		await getBalances();
	});

	afterEach(async () => {
		console.log('Final Balances:');
		await getBalances();
	});
	it('mock gateway should work', async () => {
		const abi = [
			'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
			'function mintFee() view returns (uint256)',
		];
		const { abi: erc20Abi } = await deployments.getArtifact('BTCVault');
		const [signer] = await ethers.getSigners();
		const signerAddress = await signer.getAddress();
		//@ts-ignore
		const btcGateway = new ethers.Contract(deployParameters[network]['btcGateway'], abi, signer);
		//@ts-ignore
		const renbtc = new ethers.Contract(deployParameters[network]['renBTC'], erc20Abi, signer);
		await btcGateway.mint(
			ethers.utils.solidityKeccak256(
				['bytes'],
				[ethers.utils.defaultAbiCoder.encode(['uint256', 'bytes'], [0, '0x'])],
			),
			ethers.utils.parseUnits('50', 8),
			ethers.utils.solidityKeccak256(['string'], ['random ninputs']),
			'0x',
		);
		expect(Number(ethers.utils.formatUnits(await renbtc.balanceOf(signerAddress), 8))).to.be.gt(0);
	});

	it('Swap ETH -> wETH -> ETH', async () => {
		const { wETH, controller, signer } = await getFixtures();
		const amount = ethers.utils.parseUnits('1', '18');
		const signerAddress = await signer.getAddress();
		const originalBalance = await signer.provider.getBalance(signerAddress);
		await convert(controller, ethers.constants.AddressZero, wETH, amount);
		console.log('Swapped ETH to wETH');
		await getBalances();
		await convert(controller, wETH, ethers.constants.AddressZero, amount);
		console.log('Swapped wETH to ETH');
		expect(
			originalBalance === (await signer.provider.getBalance(signerAddress)),
			'balance before not same as balance after',
		);
	});

	it('Swap renBTC -> wBTC -> renBTC', async () => {
		const { renBTC, wBTC, controller, signer } = await getFixtures();
		const amount = ethers.utils.parseUnits('5', '8');
		await convert(controller, renBTC, wBTC, amount);
		console.log('Converted renBTC to wBTC');
		await getBalances();
		const newAmount = Number(await wBTC.balanceOf(await signer.getAddress()));
		await convert(controller, wBTC, renBTC, newAmount);
		console.log('Converted wBTC to renBTC');
		expect(Number(await renBTC.balanceOf(await signer.getAddress())) > 0, 'The swap amounts dont add up');
	});

	it('should return the number of decimals in the yearn vault', async () => {
		const { yvWBTC } = await getFixtures();

		const decimals = await yvWBTC.decimals();
	});

	it('should deposit funds then withdraw funds back from vault', async () => {
		const { renBTC, btcVault } = await getFixtures();

		const beforeBalance = (await renBTC.balanceOf(btcVault.address)).toNumber() / (await renBTC.decimals());
		const addedAmount = '4000000';
		await underwriterDeposit(addedAmount);
		const afterBalance = (await renBTC.balanceOf(btcVault.address)).toNumber() / (await renBTC.decimals());
		console.log('Deposited funds into vault');
		await getBalances();

		await btcVault.withdrawAll();
		console.log('Withdrew funds from vault');

		expect(beforeBalance + Number(addedAmount) == afterBalance, 'Balances not adding up');
	});
	it('should transfer overflow funds to strategy vault', async () => {
		const { btcVault, renBTC } = await getFixtures();
		await underwriterDeposit('4000000');
		console.log('deposited all renBTC into vault');
		await getBalances();
		await btcVault.earn();
		console.log('Called earn on vault');
	});

	it('should take out, make a swap with, then repay a small loan', async () => {
		const { signer, controller, swapModule, convertModule, btcVault } = await getFixtures();
		const { underwriter, underwriterImpl } = await getUnderwriter();

		const renbtc = new ethers.Contract(await btcVault.token(), btcVault.interface, signer);
		await renbtc.approve(btcVault.address, ethers.constants.MaxUint256);
		await btcVault.deposit('4000000');
		await btcVault.earn();
		console.log('Deposited 15renBTC and called earn');
		await getBalances();

		//@ts-ignore
		('0x42e48680f15b7207c7602fec83b9c252fa3548c8533246ed532a75c6d0c486394648ba8f42a73a0ce2482712f09d177c3641ef07fcfd3b5cd3b4329982f756141b');
		const transferRequest = new UnderwriterTransferRequest({
			module:
				process.env.CHAIN === 'ARBITRUM' || process.env.CHAIN === 'MATIC'
					? convertModule.address
					: swapModule.address,
			to: '0xC6ccaC065fCcA640F44289886Ce7861D9A527F9E',
			underwriter: '0xd0D8fA764352e33F40c66C75B3BC0204DC95973e',
			asset: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501',
			amount: '0x061a80',
			data: '0x00000000000000000000000000000000000000000000000000009184e72a0000',
			nonce: '0xb67ed6c41ea6f5b7395f005ceb172eb093273396d1e5bb49d919c4df396e0d5a',
			pNonce: '0x0153c5fa086b7eceef6ec52b6b96381ee6f16852a6ace5b742f239296b4cd901',
			chainId: process.env.CHAIN === 'ARBITRUM' ? 42161 : 137,
			contractAddress: '0x53f38bEA30fE6919e0475Fe57C2629f3D3754d1E',
			signature:
				'0x42e48680f15b7207c7602fec83b9c252fa3548c8533246ed532a75c6d0c486394648ba8f42a73a0ce2482712f09d177c3641ef07fcfd3b5cd3b4329982f756141b',
		});
		transferRequest.setProvider((await ethers.getSigners())[0].provider);

		transferRequest.setUnderwriter(underwriter.address);
		const signature = await transferRequest.sign(signer, controller.address);

		console.log('\nWriting a small loan');
		await transferRequest.loan(signer, { gasLimit: 1.5e6 });
		/*
			transferRequest.to,
			transferRequest.asset,
			transferRequest.amount,
			transferRequest.pNonce,
			transferRequest.module,
			transferRequest.data,
			signature,
		);
*/
		await getBalances();

		console.log('\nRepaying loan...');
		const nHash = utils.hexlify(utils.randomBytes(32));
		const actualAmount = String(Number(transferRequest.amount) - 1000);
		const renVMSignature = '0x';
		await underwriter.proxy(
			controller.address,
			controller.interface.encodeFunctionData('repay', [
				underwriter.address, //underwriter
				transferRequest.to, //to
				transferRequest.asset, //asset
				transferRequest.amount, //amount
				actualAmount,
				transferRequest.pNonce, //nonce
				transferRequest.module, //module
				nHash,
				transferRequest.data,
				renVMSignature, //signature
			]),
		);
		await getBalances();
	});

	it('should take out, make a swap with, then repay a large loan', async () => {
		const { signer, controller, btcVault } = await getFixtures();
		const { underwriter, underwriterImpl } = await getUnderwriter();
		const renbtc = new ethers.Contract(await btcVault.token(), btcVault.interface, signer);
		await renbtc.approve(btcVault.address, ethers.constants.MaxUint256);

		await btcVault.deposit('4000000');
		await btcVault.earn();
		console.log('Deposited 15renBTC and called earn');
		await getBalances();

		//@ts-ignore
		const transferRequest = await generateTransferRequest(40000);

		console.log('\nInitial balances');
		await getBalances();

		transferRequest.setUnderwriter(underwriter.address);
		const signature = await transferRequest.sign(signer, controller.address);

		console.log('\nWriting a large loan');
		await underwriterImpl.loan(
			transferRequest.to,
			transferRequest.asset,
			transferRequest.amount,
			transferRequest.pNonce,
			transferRequest.module,
			transferRequest.data,
			signature,
		);
		await getBalances();

		console.log('\nRepaying loan...');
		await underwriterImpl.repay(
			underwriter.address, //underwriter
			transferRequest.to, //to
			transferRequest.asset, //asset
			transferRequest.amount, //amount
			String(Number(transferRequest.amount) - 1000), //actualAmount
			transferRequest.pNonce, //nonce
			transferRequest.module, //module
			utils.hexlify(utils.randomBytes(32)), //nHash
			transferRequest.data,
			signature, //signature
		);
		await getBalances();
	});
	it('should handle a default', async () => {
		const { signer, controller, btcVault } = await getFixtures();
		const { underwriter, underwriterImpl } = await getUnderwriter();
		const renbtc = new ethers.Contract(await btcVault.token(), btcVault.interface, signer);
		await renbtc.approve(btcVault.address, ethers.constants.MaxUint256);

		await btcVault.deposit('4000000');
		await btcVault.earn();
		console.log('Deposited 15renBTC and called earn');
		await getBalances();

		//@ts-ignore
		const transferRequest = await generateTransferRequest(40000);

		console.log('\nInitial balances');
		await getBalances();

		transferRequest.setUnderwriter(underwriter.address);
		const signature = await transferRequest.sign(signer, controller.address);

		console.log('\nWriting a large loan');
		await underwriterImpl.loan(
			transferRequest.to,
			transferRequest.asset,
			transferRequest.amount,
			transferRequest.pNonce,
			transferRequest.module,
			transferRequest.data,
			signature,
		);
		await getBalances();

		console.log('\nRepaying loan...');
		await underwriterImpl.repay(
			underwriter.address, //underwriter
			transferRequest.to, //to
			transferRequest.asset, //asset
			transferRequest.amount, //amount
			String(Number(transferRequest.amount) - 1000), //actualAmount
			transferRequest.pNonce, //nonce
			transferRequest.module, //module
			utils.hexlify(utils.randomBytes(32)), //nHash
			transferRequest.data,
			signature, //signature
		);
		await getBalances();
	});

	it('should call fallback mint and return funds', async () => {
		const { signer, controller } = await getFixtures();
		const { underwriter, underwriterImpl } = await getUnderwriter();

		//@ts-ignore
		const transferRequest = await generateTransferRequest(40000);

		console.log('\nInitial balances');
		await getBalances();

		transferRequest.setUnderwriter(underwriter.address);
		const signature = await transferRequest.sign(signer, controller.address);

		console.log('Calling fallbackMint...');
		await controller.fallbackMint(
			underwriter.address, //underwriter,
			transferRequest.to, //to
			transferRequest.asset, //asset
			transferRequest.amount, //amount
			String(Number(transferRequest.amount) - 1000), //actualAmount
			transferRequest.pNonce, //nonce
			transferRequest.module, //module
			utils.hexlify(utils.randomBytes(32)), //nHash
			transferRequest.data, //data
			signature,
		);
		await getBalances();
	});
	it('ArbitrumConvertQuick.sol', async () => {
		if (process.env.CHAIN !== 'ARBITRUM') return;
		const { signer, controller, btcVault } = await getFixtures();
		const renbtc = await btcVault.token();
		await btcVault.deposit('4000000');

		await btcVault.earn();
		console.log('called earn');
		const module = await ethers.getContract('ArbitrumConvertQuick');
		const underwriter = await ethers.getContract('DelegateUnderwriter');
		await underwriterDeposit(utils.parseUnits('0.5', 8).toString());
		const transferRequest = new UnderwriterTransferRequest({
			contractAddress: controller.address,
			underwriter: underwriter.address,
			module: module.address,
			data: ethers.utils.defaultAbiCoder.encode(['uint256'], [ethers.utils.parseEther('1')]),
			pNonce: utils.hexlify(utils.randomBytes(32)),
			nonce: utils.hexlify(utils.randomBytes(32)),
			to: await signer.getAddress(),
			asset: renbtc,
			amount: utils.parseUnits('0.05', 8),
		});
		await transferRequest.sign(signer);
		const tx = await transferRequest.loan(signer);
		console.log(await tx.wait());
	});
	it('MetaRequest test: tests basic metarequest stuff without keepers', async () => {
		const { signer, controller, btcVault } = await getFixtures();
		// enableGlobalMockRuntime();
		// createMockKeeper(signer.provider);
		const metaRequest = new UnderwriterMetaRequest({
			module: (await getContract('MetaExecutor')).address,
			underwriter: (await ethers.getContract('DelegateUnderwriter')).address,
			asset: await btcVault.token(),
			data: '0x',
			contractAddress: controller.address,
			addressFrom: await signer.getAddress(),
		});
		await metaRequest.sign(signer);
		await metaRequest.dry(signer, {}, 'meta');
		//@ts-ignore
		//TODO: write out dryMeta function which staticcalls meta directly
		//@ts-ignore
		//await metaRequest.dryMeta();
		//@ts-ignore
		// console.log(metaRequest.submitMetaRequest.toString())
		// do stuff with metarequest here
	});
});
