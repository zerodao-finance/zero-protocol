var sdk = require('../');
const { TransferRequest } = require('../dist/lib/zero');
const { ZeroController, Swap } = require("../dist/lib/util/deployed-contracts");
const { Contract, Wallet, providers, utils } = require("ethers");
const {
    abi: TrivialUnderwriterAbi,
    address: underwriterAddress,
} = require('../deployments/matic/TrivialUnderwriter.json');
const { abi: ControllerAbi, address: ControllerAddress } = require('../deployments/matic/ZeroController.json');
const { abi: BTCVaultAbi, address: BTCVaultAddress } = require('../deployments/matic/BTCVault.json');
const { ethers } = require('hardhat');



const urls = {
    MATIC: "https://polygon-mainnet.g.alchemy.com/v2/8_zmSL_WeJCxMIWGNugMkRgphmOCftMm",
    ETHEREUM: "https://eth-mainnet.alchemyapi.io/v2/Mqiya0B-TaJ1qWsUKuqBtwEyFIbKGWoX",
    FORK: "http://127.0.0.1:8545"
}

const chain = process.env.CHAIN || 'MATIC';
const privateKey = process.env.WALLET;

const provider = new providers.JsonRpcProvider(urls[chain]);
const signer = new Wallet(privateKey, provider)

const TrivialUnderwriter = new Contract(underwriterAddress, TrivialUnderwriterAbi, signer);
const Controller = new Contract(ControllerAddress, ControllerAbi, signer);
const BTCVault = new Contract(BTCVaultAddress, BTCVaultAbi, signer);

const underwriterImpl = new Contract(underwriterAddress, ControllerAbi, signer);

const transferRequest = new TransferRequest({
    module: Swap.address,
    to: signer.address,
    underwriter: TrivialUnderwriter.address,
    asset: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501', // renBTC on MATIC
    amount: String(utils.parseUnits('0.0001', 8)),
    data: '0x',
    nonce: '0xe2b89ac93f7d9af0f75d77a1924ebc4e7d554f2ef782437fbee2669d8980731b',
    pNonce: '0xb9e3df5b0139bc385699bde6fcdcc691443b409a7c97d276109b6841c4d2ef11'
});

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
let done;

const keeperCallback = async (msg) => {
    /*    if (done) return;
        done = true;
        */
    console.log("Transfer Request: ", msg)
    const tr = new TransferRequest(msg);
    const btcUtxo = await tr.pollForFromChainTx();

    const tx = await underwriterImpl.loan(
        tr.to,
        tr.asset,
        tr.amount,
        tr.pNonce,
        tr.module,
        tr.data,
        tr.signature,
    );

    console.log("Transaction:", tx);
};

const makeUser = async () => {
    const user = sdk.createZeroUser(await sdk.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));
    await user.conn.start();
    await user.subscribeKeepers();
    return user;
}

const makeKeeper = async () => {
    const keeper = sdk.createZeroKeeper(await sdk.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));
    await keeper.setTxDispatcher(keeperCallback);
    await keeper.conn.start();
    await keeper.advertiseAsKeeper();
    return keeper;
}

const makeDeferred = () => {
    let resolve, reject;
    const promise = new Promise((_resolve, _reject) => { resolve = _resolve; reject = _reject; });
    return {
        promise,
        resolve,
        reject
    };
};

const main = async () => {
    const keeper = await makeKeeper();
    const user = await makeUser();

    var published;
    const deferred = makeDeferred();

    keeper.conn.on('peer:discovery', () => {
        console.log('keeper discovered peer')
    })

    user.conn.on('peer:discovery', async () => {
        console.log('got peer:discovery');
        if (!published) {
            published = true
            console.log("discovered peer")
            await delay(5000);
            console.log("publishing transfer request to peer")
            console.log('peer:discovery waiting to be handled');
            await deferred.promise;
            await user.publishTransferRequest(transferRequest);
        }
    });
    transferRequest.setUnderwriter(underwriterImpl.address);
    const lock = await Controller.provider.getCode(await Controller.lockFor(TrivialUnderwriter.address, { gasPrice: ethers.utils.parseUnits('400', 'gwei'), gasLimit: '500000' }));
    console.log("Lock is: ", lock);
    if (lock === '0x') await Controller.mint(underwriterAddress, BTCVault.address, { gasPrice: ethers.utils.parseUnits('400', 'gwei'), gasLimit: '500000' });
    await transferRequest.sign(signer, Controller.address);

    const gatewayAddress = await transferRequest.toGatewayAddress();
    console.log("Deposit BTC to", gatewayAddress);
    console.log('handling peer discovery');

    // logic for deferred promise
    deferred.resolve();
}

main()
