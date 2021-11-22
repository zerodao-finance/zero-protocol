import { Wallet } from '@renproject/chains-ethereum/node_modules/ethers';
import { reject } from 'bluebird';

const { ethers } = require('hardhat');
const { TrivialUnderwriterTransferRequest } = require('../lib/zero');
const { createZeroConnection, createZeroKeeper } = require('../lib/zero');


/*--------------------------- ENVIRONMENT VARIABLES ---------------------------

PK: The private key of the wallet to use.

//--------------------------------- CONSTANTS -------------------------------*/

// The number of confirmations at which to execute the loan
const LOAN_CONFIRMATION = 1

// Address of RenBTC. Used for balance check.
RENBTC_ADDRESS = '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501'

MAX_AMOUNT = 50000000;

// URL of P2P network to use. DON'T MODIFY unless you know what you're doing...
const KEEPER_URL = '/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'

//-----------------------------------------------------------------------------

const executeLoan = async (transferRequest) => {
    const [signer] = await ethers.getSigners();
    const wallet = new Wallet(process.env.PK, signer.provider);

    const loan = await transferRequest.loan(wallet);
    await loan.wait();

    await transferRequest.waitForSignature();

    const repay = await transferRequest.repay(wallet, { gasLimit: 500e3 });
    await repay.wait();
}

const hasEnough = async (transferRequest) => {
    const [signer] = await ethers.getSigners();
    const wallet = new Wallet(process.env.PK, signer);

    const balance = await (new Contract(await underwriter.controller(), ['function balanceOf(address _owner) returns (uint256 balance)'], signer)).balanceOf(wallet.address);
    return balance > transferRequest.amount
}

const handleTransferRequest = async (message) => {
    try {
        const contract = await loadContracts();
        const transferRequest = new TrivialUnderwriterTransferRequest(message);

        if (!(hasEnough(transferRequest))) return;

        const mint = await transferRequest.submitToRenVM();

        await new Promise((resolve, reject) => mint.on('deposit', async (deposit) => {
            await resolve();
            const hash = deposit.txHash();
            const depositLog = (msg) => console.log(`RenVM Hash: ${hash}\nStatus: ${deposit.status}\n${msg}`);

            await deposit.confirmed()
                .on('target', (target) => {
                    depositLog(`0/${target} confirmations`);
                })
                .on('confirmation', (confs, target) => {
                    depositLog(`${confs}/${target} confirmations`);
                    confs == LOAN_CONFIRMATION && (await executeLoan(transferRequest));
                });

            await deposit.signed().on('status', (status) => {
                depositLog(`Status: ${status}`);
            });
        }));
    }
}

const run = async () => {
    // Initialize the keeper
    const keeper = createZeroKeeper(
        await createZeroConnection(KEEPER_URL)
    )


}

export default run;
