require('ts-node').register(require('nice-repl/lib/ts-node-config'));
var sdk = require('../lib/zero');
const { TransferRequest } = require('../lib/zero');
const { ZeroController, Swap } = require("../dist/lib/util/deployed-contracts");
const { Contract, Wallet, providers, utils } = require("ethers");
const {
    abi: TrivialUnderwriterAbi,
} = require('../deployments/matic/TrivialUnderwriter.json');
const { abi: ControllerAbi, address: ControllerAddress } = require('../deployments/matic/ZeroController.json');
const { abi: BTCVaultAbi, address: BTCVaultAddress } = require('../deployments/matic/BTCVault');
const { ethers } = require('hardhat');

const underwriterAddress = '0xcDb584d7c6f4c5Cae485Ed62b2038703dC59E158';

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
    nonce: '0x53fc9b778460077468d2e8fd44eb0d9c66810e551c9e983569f092133f37db3d',
    pNonce: '0x36cbcf365ecad2171742b1adeecb4b3d74eb0fddb8988b690117bf550a9b19c6'
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

    const mint = await transferRequest.submitToRenVM()
    /*const tx = await underwriterImpl.loan(
        tr.to,
        tr.asset,
        tr.amount,
        tr.pNonce,
        tr.module,
        tr.data,
        tr.signature,
    );*/

    console.log("Mint:", mint);
};

const makeUser = async () => {
    const user = sdk.createZeroUser(await sdk.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));
    user.start = async () => {
        await user.conn.start();
    };
    user.waitForKeeper = async () => await new Promise(async (resolve, reject) => {
        user.keepers.push = function (v) {
            [].push.call(this, v);
            user.keepers.push = [].push;
            resolve();
        };
        try {
            await user.subscribeKeepers();
        } catch (e) { reject(e); }
    });
    return user;
}

const makeKeeper = async () => {
    const keeper = sdk.createZeroKeeper(await sdk.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));
    await keeper.setTxDispatcher(keeperCallback);
    keeper.start = async () => {
        await keeper.conn.start();
        await keeper.advertiseAsKeeper();
    };
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

    const handlePeer = async () => {
        console.log('got peer:discovery');
        if (!published) {
            published = true
            console.log("discovered peer")
            await delay(5000);
            console.log("publishing transfer request to peer")
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
