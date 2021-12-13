import { Wallet } from 'ethers';
const { ethers } = require('hardhat');
const { TrivialUnderwriterTransferRequest } = require('../lib/zero');
const { createZeroConnection, createZeroKeeper } = require('../lib/zero');
const TrivialUnderwriter = require('../deployments/arbitrum/TrivialUnderwriter');
const trivial = new ethers.Contract(TrivialUnderwriter.address, TrivialUnderwriter.abi, new ethers.providers.InfuraProvider('mainnet'));


/*--------------------------- ENVIRONMENT VARIABLES -------------------------*/

// WALLET: The private key of the wallet to use.

//--------------------------------- CONSTANTS -------------------------------*/

// The number of confirmations at which to execute the loan
const LOAN_CONFIRMATION = 1

// Address of RenBTC. Used for balance check.
const MAX_AMOUNT = 50000000;

// URL of P2P network to use. DON'T MODIFY unless you know what you're doing...
const KEEPER_URL = '/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'

//-----------------------------------------------------------------------------
const getSigner = async () => {
  return new ethers.Wallet(process.env.WALLET, new ethers.providers.JsonRpcProvider('https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2'));
};

ethers.getSigners = async () => {
  return [ await getSigner() ];
};

const executeLoan = async (transferRequest) => {
    const [signer] = await ethers.getSigners();
    console.log(await signer.provider.getNetwork());
	global.signer = signer;
	global.provider = signer.provider;
    const wallet = new Wallet(process.env.WALLET, signer.provider);

    console.log(transferRequest);
	transferRequest.setProvider(signer.provider);
	console.log('loaning');
    const loan = await transferRequest.loan(wallet, { gas: 1.5e6 });
	console.log('loaned');
    await loan.wait();

    await transferRequest.waitForSignature();

    const repay = await transferRequest.repay(wallet, { gasLimit: 1.5e6 });
    await repay.wait();
}

const hasEnough = async (transferRequest) => {
    const [signer] = await ethers.getSigners();
	global.signer = signer;
	global.provider = signer.provider;
	transferRequest.setProvider(signer.provider);
    const wallet = new Wallet(process.env.WALLET, signer);

    const balance = await (new Contract(await underwriter.controller(), ['function balanceOf(address _owner) returns (uint256 balance)'], signer)).balanceOf(wallet.address);
    return balance > transferRequest.amount
}

let triggered = false;

const handleTransferRequest = async (message) => {
    try {
        const transferRequest = new TrivialUnderwriterTransferRequest({
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
           signature: message.signature
	});
        const [ signer ] = await ethers.getSigners();
	transferRequest.setProvider(signer.provider);
        //if (!(hasEnough(transferRequest))) return;
        console.log("Submitting to renVM...")
        const mint = await transferRequest.submitToRenVM();
        console.log("Successfully submitted to renVM.")
        console.log("Gateway address is", await transferRequest.toGatewayAddress())
        console.log("RECEIVED MESSAGE", message);
        console.log("RECEIVED TRANSFER REQUEST", transferRequest);
        await new Promise((resolve, reject) => mint.on('deposit', async (deposit) => {
            console.log("Deposit received.")
            await resolve();
            const hash = deposit.txHash();
            const depositLog = (msg) => console.log(`RenVM Hash: ${hash}\nStatus: ${deposit.status}\n${msg}`);

            await deposit.confirmed()
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
        }));
    } catch (e) {
        console.log(e);
    }
}

const run = async () => {
    // Initialize the keeper
    const keeper = createZeroKeeper(
        await createZeroConnection(KEEPER_URL)
    )
    await keeper.setTxDispatcher(handleTransferRequest);
    await keeper.conn.start();
    await keeper.advertiseAsKeeper();


}

run();
