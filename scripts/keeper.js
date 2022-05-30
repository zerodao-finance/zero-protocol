const { network, ethers } = require('hardhat');
const path = require('path');
const { UnderwriterTransferRequest, UnderwriterBurnRequest } = require('../lib/zero');
const { createZeroConnection, createZeroKeeper } = require('../lib/zero');

const gasnow = require('ethers-gasnow');
if (network.name === 'mainnet') ethers.providers.BaseProvider.prototype.getGasPrice = gasnow.createGetGasPrice('rapid'); //TODO: Arbitrum Gas Price

const { LevelDBPersistenceAdapter } = require('../lib/persistence/leveldb');

/*--------------------------- ENVIRONMENT VARIABLES -------------------------*/

// WALLET: The private key of the wallet to use.

//--------------------------------- CONSTANTS -------------------------------*/

// The number of confirmations at which to execute the loan
const LOAN_CONFIRMATION = 1;

// Address of RenBTC. Used for balance check.
const MAX_AMOUNT = 50000000;

// URL of P2P network to use. DON'T MODIFY unless you know what you're doing...
const KEEPER_URL = '/dns4/p2p.zerodao.com/tcp/443/wss/p2p-webrtc-star/';

const executeLoan = async (transferRequest, replyDispatcher) => {
	const [signer] = await ethers.getSigners();
	console.log(await signer.provider.getNetwork());
	global.signer = signer;
	global.provider = signer.provider;
	const wallet = new ethers.Wallet(process.env.WALLET, signer.provider);

	console.log(transferRequest);
	transferRequest.setProvider(signer.provider);
	console.log('loaning');
	const loan = await transferRequest.loan(wallet);
	console.log(loan);
	try {
		if (loan.nonce)
			await replyDispatcher('/zero/user/update', {
				request: transferRequest.signature,
				data: loan,
			});
	} catch (e) {
		console.error(e);
	}
	console.log('loaned');
	const loanTx = await loan.wait();
	console.log(loanTx);

	const repay = await transferRequest.repay(wallet, { gasLimit: 800000 });
	console.log('repaid');
	try {
		await replyDispatcher('/zero/user/update', {
			request: transferRequest.signature,
			data: repay,
		});
	} catch (e) {
		console.error(e);
	}
	const repayTx = await repay.wait();
	console.log(repayTx);
};

let triggered = false;

const handleTransferRequest = async (message, replyDispatcher) => {
	try {
		const transferRequest = new UnderwriterTransferRequest({
			amount: message.amount,
			module: message.module,
			to: message.to,
			underwriter: message.underwriter,
			asset: message.asset,
			nonce: message.nonce,
			pNonce: message.pNonce,
			amount: message.amount,
			data: message.data,
			contractAddress: message.contractAddress,
			chainId: message.chainId,
			signature: message.signature,
		});

    transferRequest.dry = async () => [];
    transferRequest.loan = async () => ({
      async wait() {
        return {};
      },
    });

		const [signer] = await ethers.getSigners();
		transferRequest.setProvider(signer.provider);
		console.log('Submitting to renVM...');
		const mint = await transferRequest.submitToRenVM();
		console.log('Successfully submitted to renVM.');
		console.log('Gateway address is', mint.gatewayAddress);
		console.log('RECEIVED MESSAGE', message);
		console.log('RECEIVED TRANSFER REQUEST', transferRequest);
		await new Promise((resolve, reject) =>
			mint.on('deposit', async (deposit) => {
				console.log('Deposit received.');
				await resolve();
				const hash = deposit.txHash();
				const depositLog = (msg) => console.log(`RenVM Hash: ${hash}\nStatus: ${deposit.status}\n${msg}`);

				await deposit
					.confirmed()
					.on('target', (target) => {
						depositLog(`0/${target} confirmations`);
					})
					.on('confirmation', async (confs, target) => {
						depositLog(`${confs}/${target} confirmations`);
						if (!triggered || confs == LOAN_CONFIRMATION) {
							triggered = true;
							await executeLoan(transferRequest, replyDispatcher);
						}
					});

				await deposit.signed().on('status', (status) => {
					depositLog(`Status: ${status}`);
				});
			}),
		);
	} catch (e) {
		throw e;
	}
};

const handleBurnRequest = async (message, replyDispatcher) => {
	try {
		const burnRequest = new UnderwriterBurnRequest({
			amount: message.amount,
			asset: message.asset,
			deadline: message.deadline,
			destination: message.destination,
			owner: message.owner,
			underwriter: message.underwriter,
			chainId: message.chainId,
			contractAddress: message.contractAddress,
			signature: message.signature,
			data: message.data,
		});
		const [signer] = await ethers.getSigners();
		const wallet = new ethers.Wallet(process.env.WALLET, signer.provider);
		const tx = await burnRequest.burn(signer, { gasLimit: 800000 });

		try {
			await replyDispatcher('/zero/user/update', {
				request: burnRequest.signature,
				data: tx,
			});
		} catch (e) {
			console.error(e);
		}
		console.log('TXHASH:', tx.hash);
		const burnReceipt = await tx.wait();
		console.log(burnReceipt);
	} catch (e) {
		console.error(e);
	}
};

const handler = {
	transfer: handleTransferRequest,
	burn: handleBurnRequest,
};

const handleRequest = (...args) =>
	handler[args[0].requestType ? args[0].requestType : args[0].destination ? 'burn' : 'transfer'](...args);

const run = async () => {
	// Initialize the keeper
	const keeper = createZeroKeeper(await createZeroConnection(KEEPER_URL));
	if (!process.env.ZERO_PERSISTENCE_DB) process.env.ZERO_PERSISTENCE_DB = path.join(process.env.HOME, '.keeper.db');
	keeper.setPersistence(new LevelDBPersistenceAdapter());
	await keeper.setTxDispatcher((...args) => {
		if (args[2]) {
			console.error('Error: ', args[2]);
			console.error('Ignored request details:');
			console.error(args[0]);
		} else {
			handleRequest(...args);
		}
	});
	await keeper.conn.start();
	await keeper.advertiseAsKeeper();
};

run().catch(console.error);
