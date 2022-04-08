const { ethers } = require('hardhat');
const path = require('path');
const { UnderwriterTransferRequest, UnderwriterBurnRequest } = require('../lib/zero');
const { createZeroConnection, createZeroKeeper } = require('../lib/zero');
const { LevelDBPersistenceAdapter } = require('../lib/persistence/leveldb');
const Underwriter = require('../deployments/arbitrum/DelegateUnderwriter');
const BadgerBridgeZeroController = require('../deployments/mainnet/BadgerBridgeZeroController');
const trivial = new ethers.Contract(
	Underwriter.address,
	Underwriter.abi,
	new ethers.providers.InfuraProvider('mainnet'),
);

/*--------------------------- ENVIRONMENT VARIABLES -------------------------*/

// WALLET: The private key of the wallet to use.

//--------------------------------- CONSTANTS -------------------------------*/

// The number of confirmations at which to execute the loan
const LOAN_CONFIRMATION = 1;

// Address of RenBTC. Used for balance check.
const MAX_AMOUNT = 50000000;

// URL of P2P network to use. DON'T MODIFY unless you know what you're doing...
const KEEPER_URL = '/dns4/p2p.zerodao.com/tcp/443/wss/p2p-webrtc-star/';

//-----------------------------------------------------------------------------
const _getSigners = ethers.getSigners;
const getSigner = async () => {
	const [signer] = await _getSigners.call(ethers);
	return new ethers.Wallet(
		process.env.WALLET,
		process.env.FORKING
			? signer.provider
			: new ethers.providers.JsonRpcProvider(
					'https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
			  ),
	);
};

ethers.getSigners = async () => {
	return [await getSigner()];
};

const executeLoan = async (transferRequest) => {
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
	console.log('loaned');
	console.log(await loan.wait());

	await transferRequest.waitForSignature();

	const repay = await transferRequest.repay(wallet);
	await repay.wait();
};

const hasEnough = async (transferRequest) => {
	const [signer] = await ethers.getSigners();
	global.signer = signer;
	global.provider = signer.provider;
	transferRequest.setProvider(signer.provider);
	const wallet = new ethers.Wallet(process.env.WALLET, signer);

	const balance = await new Contract(
		await underwriter.controller(),
		['function balanceOf(address _owner) returns (uint256 balance)'],
		signer,
	).balanceOf(wallet.address);
	return balance > transferRequest.amount;
};

let triggered = false;

const handleTransferRequest = async (message) => {
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
		if (transferRequest.contractAddress === BadgerBridgeZeroController.address) {
                  transferRequest.dry = async () => [];
		  transferRequest.loan = async (...args) => ({ async wait() { return {}; } });
		};
		const [signer] = await ethers.getSigners();
		transferRequest.setProvider(signer.provider);
		//if (!(hasEnough(transferRequest))) return;
		console.log('Submitting to renVM...');
		const mint = await transferRequest.submitToRenVM();
		console.log('Successfully submitted to renVM.');
		console.log('Gateway address is', await transferRequest.toGatewayAddress());
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
							await executeLoan(transferRequest);
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

const handleBurnRequest = async (message) => {
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
		});
	        const [signer] = await ethers.getSigners();
	        const wallet = new ethers.Wallet(process.env.WALLET, signer.provider);
		const tx = await burnRequest.burn(signer);
		console.log('TXHASH:', tx.hash);
		console.log(await tx.wait());
	} catch (e) { console.error(e); }
		/*
		const [signer] = await ethers.getSigners();
		burnRequest.setProvider(signer.provider);
		//if (!(hasEnough(transferRequest))) return;
		console.log('Submitting to renVM...');
		const burnAndRelease = await burnRequest.submitToRenVM();
		console.log('Successfully submitted to renVM.');
		console.log('Gateway address is', await burnRequest.toGatewayAddress());
		console.log('RECEIVED MESSAGE', message);
		console.log('RECEIVED TRANSFER REQUEST', burnRequest);
		const burn = await burnAndRelease.burn();
		const tx = await burnRequest.waitForTxNonce(burn);
		await burnAndRelease
			.release()
			.on('status', (status) => (status === 'confirming' ? console.log('confirming') : console.log(status)))
			.on('txHash', console.log);
	} catch (e) {
		throw e;
	}
	*/
};

const handler = {
	transfer: handleTransferRequest,
	burn: handleBurnRequest,
};

const handleRequest = (request, type = 'transfer') =>
	handler[request.requestType ? request.requestType : request.destination ? 'burn' : type](request);

const run = async () => {
	// Initialize the keeper
	const keeper = createZeroKeeper(await createZeroConnection(KEEPER_URL));
	if (!process.env.ZERO_PERSISTENCE_DB) process.env.ZERO_PERSISTENCE_DB = path.join(process.env.HOME, '.keeper.db');
	keeper.setPersistence(new LevelDBPersistenceAdapter());
	await keeper.setTxDispatcher((transferRequest) => {
        	console.log(transferRequest);
	  handleRequest(transferRequest);
	});
	await keeper.conn.start();
	await keeper.advertiseAsKeeper();
};

run().catch(console.error);
