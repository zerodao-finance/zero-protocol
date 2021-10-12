import hre from 'hardhat';
import TransferRequest from '../lib/zero';
import { expect } from 'chai';
import { override } from '../lib/test/inject-mock';
import GatewayLogicV1 from '../artifacts/contracts/test/GatewayLogicV1.sol/GatewayLogicV1.json';
import BTCVault from '../artifacts/contracts/vaults/BTCVault.sol/BTCVault.json';
import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from '@ethersproject/abstract-provider';
import { Wallet, Contract, providers, utils } from 'ethers';

// @ts-expect-error
const { ethers, deployments } = hre;
const gasnow = require('ethers-gasnow');

const deployParameters = {
	MATIC: {
		btcGateway: '0x05Cadbf3128BcB7f2b89F3dD55E5B0a036a49e20',
		renBTC: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501',
		wBTC: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
		wNative: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
		USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
		Router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
		Curve_Ren: '0xC2d95EEF97Ec6C17551d45e77B590dc1F9117C67',
		sushiRouter: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'
	},
	ETHEREUM: {
		btcGateway: '0xe4b679400F0f267212D5D812B95f58C83243EE71',
		renBTC: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
		wBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
		wNative: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
		USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
		Curve_SBTC: '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714',
		Curve_TriCryptoTwo: '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46',
		Router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
		sushiRouter: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'
	}
}

const network = process.env.CHAIN || 'MATIC'

ethers.providers.BaseProvider.prototype.getGasPrice = gasnow.createGetGasPrice('rapid');
const USDC_MAINNET_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';


const toAddress = (contractOrAddress: any): string => contractOrAddress.address || contractOrAddress;
const mintRenBTC = async (amount: any, signer?: any) => {
	const abi = [
		'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
		'function mintFee() view returns (uint256)',
	];
	if (!signer) signer = (await ethers.getSigners())[0];
	//@ts-ignore
	const btcGateway = new ethers.Contract(deployParameters[network]["btcGateway"], abi, signer);
	await btcGateway.mint(
		ethers.utils.hexlify(ethers.utils.randomBytes(32)),
		amount,
		ethers.utils.hexlify(ethers.utils.randomBytes(32)),
		'0x',
	);
};

const getContract = async (...args: any[]) => {
	try {
		return await ethers.getContract(...args);
	} catch (e) {
		return ethers.Contract(ethers.constants.AddressZero, [], (await ethers.getSigners())[0]);
	}
};

const getContractFactory = async (...args: any[]) => {
	try {
		return await ethers.getContractFactory(...args);
	} catch (e) {
		return await ethers.ContractFactory('0x', [], (await ethers.getSigners())[0]);
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

var underwriterAddress = '0x0';

const deployUnderwriter = async () => {
	const { signer, controller, renBTC, btcVault } = await getFixtures();
	const underwriterFactory = await getContractFactory('TrivialUnderwriter', signer);
	underwriterAddress = (await underwriterFactory.deploy(controller.address)).address;
	await renBTC.approve(btcVault.address, ethers.constants.MaxUint256); //let btcVault spend renBTC on behalf of signer
	await btcVault.approve(controller.address, ethers.constants.MaxUint256); //let controller spend btcVault tokens
	await mintUnderwriterNFTIfNotMinted();
};

const mintUnderwriterNFTIfNotMinted = async () => {
	const { signer, controller, renBTC, btcVault } = await getFixtures();
	const lock = await controller.provider.getCode(await controller.lockFor(underwriterAddress));
	if (lock === '0x') await controller.mint(underwriterAddress, btcVault.address);
};

const underwriterDeposit = async (amountOfRenBTC: string) => {
	const { btcVault, controller } = await getFixtures();
	await btcVault.deposit(amountOfRenBTC); //deposit renBTC into btcVault from signer
	console.log('Underwriter address is', underwriterAddress);
	await mintUnderwriterNFTIfNotMinted();
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
		strategy: await getContract('StrategyRenVM', signer),
		btcVault: await getContract('BTCVault', signer),
		swapModule: await getContract('Swap', signer),
		uniswapFactory: await getContract('ZeroUniswapFactory', signer),
		curveFactory: await getContract('ZeroCurveFactory', signer),
		wrapper: await getContract('WrapNative', signer),
		unwrapper: await getContract('UnwrapNative', signer),
		//@ts-ignore
		gateway: new Contract(deployParameters[network]["btcGateway"], GatewayLogicV1.abi, signer),
		//@ts-ignore
		renBTC: new Contract(deployParameters[network]["renBTC"], erc20abi, signer),
		//@ts-ignore
		wETH: new Contract(deployParameters[network]["wNative"], erc20abi, signer),
		//@ts-ignore
		usdc: new Contract(deployParameters[network]["USDC"], erc20abi, signer),
		//@ts-ignore
		wBTC: new Contract(deployParameters[network]["wBTC"], erc20abi, signer),
		yvWBTC: await getContract('DummyVault', signer),
	};
};

const getBalances = async () => {
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
	const { swapModule, signerAddress } = await getFixtures();
	const { underwriter } = await getUnderwriter();
	return new TransferRequest({
		module: swapModule.address,
		to: signerAddress,
		underwriter: underwriter.address,
		//@ts-ignore
		asset: deployParameters[network]['renBTC'],
		amount: String(amount),
		data: '0x',
  });
};

const getUnderwriter = async () => {
	const { signer, controller } = await getFixtures();
	const underwriterFactory = await getContractFactory('TrivialUnderwriter', signer);
	return {
		underwriterFactory,
		underwriterAddress,
		underwriter: new Contract(underwriterAddress, underwriterFactory.interface, signer),
		underwriterImpl: new Contract(underwriterAddress, controller.interface, signer),
		lock: await controller.lockFor(underwriterAddress),
	};
};

const getWrapperContract = async (address: string) => {
	const { signer } = await getFixtures();
	const wrapperAbi = (await deployments.getArtifact('ZeroUniswapWrapper')).abi;
	return new Contract(address, wrapperAbi, signer);
};

describe('Zero', () => {
	var prop;
	before(async () => {
		await deployments.fixture();
		await deployUnderwriter();
		const artifact = await deployments.getArtifact('MockGatewayLogicV1');
		//@ts-ignore
		const implementationAddress = await getImplementation(deployParameters[network]["btcGateway"]);
		override(implementationAddress, artifact.deployedBytecode);
		const { gateway } = await getFixtures();
		await gateway.mint(utils.randomBytes(32), utils.parseUnits('50', 8), utils.randomBytes(32), '0x'); //mint renBTC to signer
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
		const btcGateway = new ethers.Contract(deployParameters[network]["btcGateway"], abi, signer);
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
		const addedAmount = '5000000000';
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
		await underwriterDeposit('5000000000');
		console.log('deposited all renBTC into vault');
		await getBalances();
		await btcVault.earn();
		console.log('Called earn on vault');
	});

	it('should take out, make a swap with, then repay a small loan', async () => {
		const { signer, controller, btcVault } = await getFixtures();
		const { underwriter, underwriterImpl } = await getUnderwriter();

		const renbtc = new ethers.Contract(await btcVault.token(), btcVault.interface, signer);
		await renbtc.approve(btcVault.address, ethers.constants.MaxUint256);
		await btcVault.deposit('1500000000');
		await btcVault.earn();
		console.log('Deposited 15renBTC and called earn');
		await getBalances();

		//@ts-ignore
		const transferRequest = await generateTransferRequest(100000000);

		transferRequest.setUnderwriter(underwriter.address);
		const signature = await transferRequest.sign(signer, controller.address);

		console.log('\nWriting a small loan');
		await underwriter.proxy(controller.address, controller.interface.encodeFunctionData('loan', [
			transferRequest.to,
			transferRequest.asset,
			transferRequest.amount,
			transferRequest.pNonce,
			transferRequest.module,
			transferRequest.data,
			signature,
		]));
		await getBalances();

		console.log('\nRepaying loan...');
		const nHash = utils.hexlify(utils.randomBytes(32));
		const actualAmount = String(Number(transferRequest.amount) - 1000);
		const renVMSignature = '0x';
		await underwriter.proxy(controller.address, controller.interface.encodeFunctionData('repay', [
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
		]));
		await getBalances();
	});

	it('should take out, make a swap with, then repay a large loan', async () => {
		const { signer, controller, btcVault } = await getFixtures();
		const { underwriter, underwriterImpl } = await getUnderwriter();
		const renbtc = new ethers.Contract(await btcVault.token(), btcVault.interface, signer);
		await renbtc.approve(btcVault.address, ethers.constants.MaxUint256);

		await btcVault.deposit('2500000000');
		await btcVault.earn();
		console.log('Deposited 15renBTC and called earn');
		await getBalances();

		//@ts-ignore
		const transferRequest = await generateTransferRequest(1500000000);

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
		const transferRequest = await generateTransferRequest(100000000);

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
});
