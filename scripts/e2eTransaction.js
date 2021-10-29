//require('ts-node').register(require('../tsconfig'));
var sdk = require('../lib/zero');
const hre = require('hardhat');
const { TrivialUnderwriterTransferRequest, TransferRequest } = require('../lib/zero');
const { ZeroController, Swap } = require('../dist/lib/util/deployed-contracts');
const { Contract, Wallet, providers, utils } = require('ethers');
const { abi: TrivialUnderwriterAbi } = require('../deployments/matic/TrivialUnderwriter.json');
const { abi: ControllerAbi, address: ControllerAddress } = require('../deployments/matic/ZeroController.json');
const { abi: BTCVaultAbi, address: BTCVaultAddress } = require('../deployments/matic/BTCVault');
const { ethers } = require('hardhat');

const underwriterAddress = '0xcDb584d7c6f4c5Cae485Ed62b2038703dC59E158';
const makeDeferred = () => {
	let resolve, reject;
	const promise = new Promise((_resolve, _reject) => {
		resolve = _resolve;
		reject = _reject;
	});
	return {
		promise,
		resolve,
		reject,
	};
};

const _queryTxResult = {
	amount: '153047',
	nHash: '0x5307f7a3c171f0c7816619667fa9bacf331e6b4c8577e778d9b3c7429cacd2db',
	pHash: '0xa760a7baec87176ce52f4df04100c28ed8f9e458274e0cf52a48e449320122ea',
	signature:
		'0xd708750affcb098f9836eb2736376dcab5d4f257ad96d9db134a019a827576111b6fe1a85f0d4b7adb97a5ab78ee60b6db877ebb5d9760e26a0521bf6070e1f21c',
};

/*
const urls = {
    MATIC: "https://polygon-mainnet.g.alchemy.com/v2/8_zmSL_WeJCxMIWGNugMkRgphmOCftMm",
    ETHEREUM: "https://eth-mainnet.alchemyapi.io/v2/Mqiya0B-TaJ1qWsUKuqBtwEyFIbKGWoX",
    FORK: "http://127.0.0.1:8545"
}
*/

const chain = process.env.CHAIN || 'MATIC';
const privateKey = process.env.WALLET;

const getSigner = async () => {
	const [signer] = await hre.ethers.getSigners();
	const wallet = new Wallet(privateKey, signer.provider);
	return wallet;
};

function delay(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}
let done;

const keeperCallback = async (msg) => {
	//console.log("Transfer Request: ", msg)
	try {
		const tr = new TrivialUnderwriterTransferRequest(msg);
		console.log(tr.nonce);
		const mint = await transferRequest.submitToRenVM();
		console.log(`(TransferRequest) Deposit ${utils.formatUnits(tr.amount, 8)} BTC to ${mint.gatewayAddress}`);
		mint.on('deposit', async (deposit) => {
			const hash = deposit.txHash();
			const depositLog = (msg) => console.log(`RenVM Hash: ${hash}\nStatus: ${deposit.status}\n${msg}`);

			/*
        deposit.confirmed().then(async () => {
            console.log("Executing loan");
            const tx = await underwriterImpl.loan(
                tr.to,
                tr.asset,
                tr.amount,
                tr.pNonce,
                tr.module,
                tr.data,
                tr.signature,
            );
            console.log(tx);
        })
        */

			await deposit
				.confirmed()
				.on('target', (target) => depositLog(`0/${target} confirmations`))
				.on('confirmation', (confs, target) => depositLog(`${confs}/${target} confirmations`));
			await deposit.signed().on('status', (status) => depositLog(`Status: ${status}`));
		});
		//    const loanTx = await tr.loan(signer);
		console.log('loaned!');
		//    console.log(loanTx);
		//    console.log('awaiting receipt');
		//    console.log(await loanTx.wait());
		tr._queryTxResult = _queryTxResult;
		tr._mint = {};
		const waitedSignature = await tr.waitForSignature();
		console.log('got signature!');
		console.log(waitedSignature);
		console.log('repaying');
		const tx = await tr.repay(signer, { gasLimit: 500e3 });
		console.log('tx submitted');
		console.log(tx);
		console.log('awaiting receipt');
		console.log(await tx.wait());
		completed.resolve();
	} catch (e) {
		completed.reject(e);
	}
};

const makeUser = async () => {
	const user = sdk.createZeroUser(
		await sdk.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'),
	);
	user.start = async () => {
		await user.conn.start();
	};
	user.waitForKeeper = async () =>
		await new Promise(async (resolve, reject) => {
			user.keepers.push = function (v) {
				[].push.call(this, v);
				user.keepers.push = [].push;
				resolve();
			};
			try {
				await user.subscribeKeepers();
			} catch (e) {
				reject(e);
			}
		});
	return user;
};

const completed = makeDeferred();

const makeKeeper = async () => {
	const keeper = sdk.createZeroKeeper(
		await sdk.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'),
	);
	await keeper.setTxDispatcher(keeperCallback); //TODO change back to keeper callback
	keeper.start = async () => {
		await keeper.conn.start();
		await keeper.advertiseAsKeeper();
	};
	return keeper;
};

let transferRequest;
let signer;

const main = async () => {
	const keeper = await makeKeeper();
	const user = await makeUser();
	signer = await getSigner();
	const TrivialUnderwriter = new Contract(underwriterAddress, TrivialUnderwriterAbi, signer);
	const Controller = new Contract(ControllerAddress, ControllerAbi, signer);
	const BTCVault = new Contract(BTCVaultAddress, BTCVaultAbi, signer);

	const underwriterImpl = new Contract(underwriterAddress, ControllerAbi, signer);

	transferRequest = new TransferRequest({
		module: Swap.address,
		to: await signer.getAddress(),
		underwriter: TrivialUnderwriter.address,
		asset: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501', // renBTC on MATIC
		nonce: '0x53fc9b778460077468d2e8fd44eb0d9c66810e551c9e983569f092133f37db3e',
		pNonce: '0x36cbcf365ecad2171742b1adeecb4b3d74eb0fddb8988b690117bf550a9b19c7',
		amount: String(utils.parseUnits('0.0016', 8)),
		data: '0x',
	});

	var published;
	const deferred = makeDeferred();

	const handlePeer = async () => {
		console.log('got peer:discovery');
		if (!published) {
			published = true;
			console.log('discovered peer');
			await delay(5000);
			console.log('publishing transfer request to peer');
			console.log('peer:discovery waiting to be handled');
			await deferred.promise;
			await user.waitForKeeper();
			await user.publishTransferRequest(transferRequest);
		}
	};
	keeper.conn.on('peer:discovery', handlePeer);
	user.conn.on('peer:discovery', handlePeer);
	await keeper.start();
	await user.start();
	transferRequest.setUnderwriter(underwriterImpl.address);
	const lock = await Controller.provider.getCode(
		await Controller.lockFor(TrivialUnderwriter.address, {
			gasPrice: ethers.utils.parseUnits('400', 'gwei'),
			gasLimit: '500000',
		}),
	);
	if (lock === '0x')
		await Controller.mint(underwriterAddress, BTCVault.address, {
			gasPrice: ethers.utils.parseUnits('400', 'gwei'),
			gasLimit: '500000',
		});
	await transferRequest.sign(signer, Controller.address);

	console.log('Generating deposit address...');
	const gatewayAddress = await transferRequest.toGatewayAddress();
	console.log(`(TransferRequest) Deposit ${utils.formatUnits(transferRequest.amount, 8)} BTC to ${gatewayAddress}`);

	// logic for deferred promise
	deferred.resolve();
	await completed.promise;
};

main()
	.then(() => {
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
