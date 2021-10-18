var sdk = require('../');
const { TransferRequest } = require('../dist/lib/zero');
const { ZeroController, ZeroUnderwriterImpl, Swap } = require("../dist/lib/util/deployed-contracts");
const { Wallet, providers, utils } = require("ethers");

const urls = {
    MATIC: "https://polygon-mainnet.g.alchemy.com/v2/8_zmSL_WeJCxMIWGNugMkRgphmOCftMm",
    ETHEREUM: "https://eth-mainnet.alchemyapi.io/v2/Mqiya0B-TaJ1qWsUKuqBtwEyFIbKGWoX"
}

const chain = process.env.CHAIN || 'MATIC';
const privateKey = process.env.WALLET;

const provider = new providers.JsonRpcProvider(urls[chain]);
const signer = new Wallet(privateKey, provider)



const transferRequest = new TransferRequest({
    module: Swap.address,
    to: signer.address,
    underwriter: ZeroUnderwriterImpl.address,
    asset: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501', // renBTC on MATIC
    amount: String(utils.parseUnits('0.0001', 8)),
    data: '0x',
    nonce: '0x3f08d051c9c13645dee6853ee00ff6a6181ef3665e14e2ba6d343d24a61726a1',
    pNonce: '0x1087ef19141539b84e2087f265709db228af8015c61c26dfcddf615e9d57ddd2'
});

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
let done;

const keeperCallback = async (msg) => {
    if (done) return;
    done = true;

    console.log("IMPORTANT CALLBACK:", msg);
    const tr = new TransferRequest(msg);
    console.log(await tr.pollForFromChainTx());
}

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

const main = async () => {
    const keeper = await makeKeeper();
    const user = await makeUser();

    transferRequest.setUnderwriter(ZeroUnderwriterImpl.address);
    await transferRequest.sign(signer, ZeroController.address);

    const gatewayAddress = await transferRequest.toGatewayAddress();
    console.log("Deposit BTC to", gatewayAddress);

    user.conn.on('peer:discovery', async () => {
        console.log("discovered peer")
        await delay(5000);
        console.log("publishing transfer request to peer")
        await user.publishTransferRequest(transferRequest);
    });
}

const signLoan = async (msg) => {
    console.log(msg)
}

main()
