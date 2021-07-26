import hre from 'hardhat';
import { createTransferRequest } from '../lib/zero';
import { expect } from 'chai';
import { override } from '../lib/test/inject-mock';
import GatewayLogicV1 from '../artifacts/contracts/test/GatewayLogicV1.sol/GatewayLogicV1.json';
import BTCVault from '../artifacts/contracts/vaults/BTCVault.sol/BTCVault.json';
import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from '@ethersproject/abstract-provider';
import { Contract } from 'ethers';

// @ts-expect-error
const { ethers, deployments } = hre;

const BTCGATEWAY_MAINNET_ADDRESS = '0xe4b679400F0f267212D5D812B95f58C83243EE71';
const RENBTC_MAINNET_ADDRESS = '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d';
const STRATEGY_ADDRESS = '0x36C02dA8a0983159322a80FFE9F24b1acfF8B570';
const CONTROLLER_ADDRESS = '0x0E801D84Fa97b50751Dbf25036d067dCf18858bF';

const getImplementation = async (proxyAddress: string) => {
	const [{ provider }] = await ethers.getSigners();
	return ethers.utils.getAddress(
		(
			await provider.getStorageAt(
				proxyAddress,
				'0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
			)
		).substr(26),
	);
};

const setupUnderwriter = async (signer: Signer, amountOfRenBTC = '100') => {
	const vault = (await ethers.getContract('BTCVault')).connect(signer);
	const renbtcGateway = getGateway(signer);
	await renbtcGateway.mint(
		ethers.utils.randomBytes(32),
		ethers.utils.parseUnits(amountOfRenBTC, 8),
		ethers.utils.randomBytes(32),
		'0x',
	);
	const underwriterFactory = (await ethers.getContractFactory('TrivialUnderwriter')).connect(signer);
	const controller = await ethers.getContract('ZeroController');
	const { address: underwriterAddress } = await underwriterFactory.deploy(controller.address);
	const renbtc = getRenBTC(signer);
	await renbtc.approve(vault.address, ethers.constants.MaxUint256);
	await vault.deposit(ethers.utils.parseUnits(amountOfRenBTC, 8));
	const from = await signer.getAddress();
	await vault.approve(controller.address, await vault.balanceOf(from));
	await controller.mint(underwriterAddress, vault.address);
	const lock = await controller.lockFor(underwriterAddress);
	return new ethers.Contract(underwriterAddress, underwriterFactory.interface, signer);
};

const getGateway = (signer: Signer): Contract => {
	return new ethers.Contract(BTCGATEWAY_MAINNET_ADDRESS, GatewayLogicV1.abi, signer);
};

const getRenBTC = (signer: Signer): Contract => {
	return new ethers.Contract(RENBTC_MAINNET_ADDRESS, BTCVault.abi, signer);
};

describe('Zero', () => {
	before(async () => {
		await deployments.fixture();
		const artifact = await deployments.getArtifact('MockGatewayLogicV1');
		const implementationAddress = await getImplementation(BTCGATEWAY_MAINNET_ADDRESS);
		override(implementationAddress, artifact.deployedBytecode);
	});
	it('mock should work', async () => {
		const abi = [
			'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
			'function mintFee() view returns (uint256)',
		];
		const { abi: erc20Abi } = await deployments.getArtifact('BTCVault');
		const [signer] = await ethers.getSigners();
		const btcGateway = new ethers.Contract(BTCGATEWAY_MAINNET_ADDRESS, abi, signer);
		const renbtc = new ethers.Contract(RENBTC_MAINNET_ADDRESS, erc20Abi, signer);
		const signerAddress = await signer.getAddress();
		await btcGateway.mint(
			ethers.utils.solidityKeccak256(
				['bytes'],
				[ethers.utils.defaultAbiCoder.encode(['uint256', 'bytes'], [0, '0x'])],
			),
			ethers.utils.parseUnits('100', 8),
			ethers.utils.solidityKeccak256(['string'], ['random ninputs']),
			'0x',
		);
		expect(Number(ethers.utils.formatUnits(await renbtc.balanceOf(signerAddress), 8))).to.be.gt(0);
	});
	it('should be able to launch an underwriter', async () => {
		const [signer] = await ethers.getSigners();
		const lock = await setupUnderwriter(signer);
	});
	it('should deposit in vault', async () => {
		const [signer] = await ethers.getSigners();
		const lock = await setupUnderwriter(signer);

		const { abi: erc20abi } = await deployments.getArtifact('BTCVault')
		const renbtc = new ethers.Contract(RENBTC_MAINNET_ADDRESS, erc20abi, signer);

		const BTCVault = await ethers.getContract('BTCVault', signer)
		const signerAddress = await signer.getAddress();

		const beforeBalance = (await renbtc.balanceOf(BTCVault.address)).toNumber() / await renbtc.decimals();
		const addedAmount = 10;
		await BTCVault.deposit(addedAmount * await renbtc.decimals());
		const afterBalance = (await renbtc.balanceOf(BTCVault.address)).toNumber() / await renbtc.decimals();

		expect(beforeBalance + addedAmount == afterBalance, 'Balances not adding up');
	});
	it('should transfer overflow funds to strategy vault', async () => {
		const [signer] = await ethers.getSigners();
		await setupUnderwriter(signer);
		const { abi: erc20abi } = await deployments.getArtifact('BTCVault');
		const signerAddress = await signer.getAddress();

		const renbtc = new ethers.Contract(RENBTC_MAINNET_ADDRESS, erc20abi, signer);
		const decimals = await renbtc.decimals();

		const BTCVault = await ethers.getContract('BTCVault', signer)
		const Controller = await ethers.getContract('ZeroController', signer)
		const Strategy = await ethers.getContract('StrategyRenVM', signer)
		const StrategyVault = new ethers.Contract('0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E', erc20abi, signer)


		await BTCVault.earn();
	});
	it('should make a swap', async () => {
		const [signer] = await ethers.getSigners();
		const underwriter = await setupUnderwriter(signer);
		const signerAddress = await signer.getAddress();

		const { abi: erc20abi } = await deployments.getArtifact('BTCVault');
		const { abi: controllerABI } = await deployments.getArtifact('ZeroController');
		const renBTC = new ethers.Contract(RENBTC_MAINNET_ADDRESS, erc20abi, signer);
		const Strategy = await ethers.getContract('StrategyRenVM', signer);
		const Controller = await ethers.getContract('ZeroController', signer);
		const BTCVault = await ethers.getContract('BTCVault', signer);
		const SwapModule = await ethers.getContract('Swap');
		const underwriterFactory = (await ethers.getContractFactory('TrivialUnderwriter')).connect(signer);
		const { address: underwriterAddress } = await underwriterFactory.deploy(Controller.address);
		const lock = await Controller.lockFor(underwriterAddress);

		const getBalances = async () => {
			const renBTCDecimals = await renBTC.decimals();
			const wETH = new ethers.Contract('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', erc20abi, signer);
			const wETHDecimals = await wETH.decimals();
			const USDC = new ethers.Contract('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', erc20abi, signer);
			const usdcDecimals = await USDC.decimals();
			const wBTC = new ethers.Contract('0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', erc20abi, signer);
			const wBTCDecimals = await wBTC.decimals();
			const StrategyVault = new ethers.Contract('0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E', erc20abi, signer);
			const [{ provider }] = await ethers.getSigners();
			const contracts: { [index: string]: string } = {
				Wallet: signerAddress,
				RenBTCVault: BTCVault.address,
				Controller: Controller.address,
				Strategy: Strategy.address,
				'Strategy Vault': '0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E',
				'Swap Module': SwapModule.address,
			};
			console.log("Lock:", lock);
			console.table(
				// @ts-expect-error
				Object.fromEntries(
					await Promise.all(
						Object.keys(contracts).map(async (name) => {
							const address: string = contracts[name];
							return [
								name,
								{
									renBTC: ((await renBTC.balanceOf(address)) / 10 ** renBTCDecimals).toLocaleString(),
									ETH: (await provider.getBalance(address)).div((1e18).toString()).toString(),
									WETH: ((await wETH.balanceOf(address)) / 10 ** 18).toLocaleString(),
									USDC: ((await USDC.balanceOf(address)) / 10 ** usdcDecimals).toLocaleString(),
									wBTC: ((await wBTC.balanceOf(address)) / 10 ** wBTCDecimals).toLocaleString(),
									yvWBTC: ((await StrategyVault.balanceOf(address)) / 10 ** 8).toLocaleString(),
									zBTC: ((await BTCVault.balanceOf(address)) / 10 ** (await BTCVault.decimals())).toLocaleString(),
								},
							];
						}),
					),
				),
			);
		};

		const _balance = (await renBTC.balanceOf(signerAddress)).toString();

		await getBalances();

		console.log('\nDepositing to vault');
		await renBTC.approve(BTCVault.address, _balance);
		await BTCVault.deposit(_balance);
		await getBalances();

		console.log('\nCalling earn on the vault & deposit on the strategy');
		await BTCVault.earn();
		const transferRequest = createTransferRequest(
			SwapModule.address,
			signerAddress,
			RENBTC_MAINNET_ADDRESS,
			underwriter.address,
			'100000000',
			'0x',
		);
		await getBalances();

		transferRequest.setUnderwriter(underwriter.address);
		const signature = await transferRequest.sign(signer, Controller.address);
		const Underwriter = new ethers.Contract(underwriter.address, controllerABI, signer);

		console.log('\nWriting loan');

		await Underwriter.loan(
			transferRequest.to,
			transferRequest.asset,
			transferRequest.amount,
			transferRequest.pNonce,
			transferRequest.module,
			transferRequest.data,
			signature,
		);

		await getBalances();
	});

	it('should repay the loan', async () => {
		const [signer] = await ethers.getSigners();
		const { abi: controllerABI } = await deployments.getArtifact('ZeroController');
		const underwriter = await setupUnderwriter(signer);
		const Underwriter = new ethers.Contract(underwriter.address, controllerABI, signer);
		const signerAddress = await signer.getAddress();
		/*
		Underwriter.repay(
			underwriter.address,
			signerAddress,
			RENBTC_MAINNET_ADDRESS,
			
		)
		*/
	})
});
