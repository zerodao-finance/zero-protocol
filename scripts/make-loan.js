const { utils, Contract, Wallet, providers } = require('ethers');
const { abi: BTCVaultAbi, address: BTCVaultAddress } = require('../deployments/matic/BTCVault.json');
const { abi: SwapAbi, address: SwapAddress } = require('../deployments/matic/Swap.json');
const { abi: StrategyAbi, address: StrategyAddress } = require('../deployments/matic/StrategyRenVM.json');
const {
	abi: TrivialUnderwriterAbi,
	address: underwriterAddress,
} = require('../deployments/matic/TrivialUnderwriter.json');
const { abi: ControllerAbi, address: ControllerAddress } = require('../deployments/matic/ZeroController.json');
const { default: TransferRequest } = require('../dist/lib/zero');

const pk = process.env.WALLET;
const signer = new providers.JsonRpcProvider(
	'https://polygon-mainnet.g.alchemy.com/v2/8_zmSL_WeJCxMIWGNugMkRgphmOCftMm',
);
signer.getGasPrice = require('ethers-polygongastracker').createGetGasPrice('rapid');
const wallet = new Wallet(pk).connect(signer);

const BTCVault = new Contract(BTCVaultAddress, BTCVaultAbi, wallet);
const Swap = new Contract(SwapAddress, SwapAbi, wallet);
const TrivialUnderwriter = new Contract(underwriterAddress, TrivialUnderwriterAbi, wallet);
const Controller = new Contract(ControllerAddress, ControllerAbi, wallet);

const transferRequest = new TransferRequest(
	Swap.address,
	wallet.address,
	TrivialUnderwriter.address,
	'0xDBf31dF14B66535aF65AaC99C32e9eA844e14501',
	String(utils.parseUnits('0.002', 8)),
	'0x',
);


(async () => {
	const lock = await Controller.provider.getCode(await Controller.lockFor(TrivialUnderwriter.address));
	if (lock === '0x') await Controller.mint(underwriterAddress, BTCVault.address);
        const underwriterImpl = new ethers.Contract(underwriterAddress, ControllerAbi, wallet);

	const signature = transferRequest.sign(wallet, Controller.address);

	const tx = await underwriterImpl.loan(
		transferRequest.to,
		transferRequest.asset,
		transferRequest.amount,
		transferRequest.pNonce,
		transferRequest.module,
		transferRequest.data,
		signature,
	);
	console.log(require('util').inspect(tx, { colors: true, depth: 15 }));
	console.log('waiting ... ');
	console.log(await tx.wait());
})().catch((err) => console.error(err));
