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


var makeUser = async () => {
    const user = sdk.createZeroUser(await sdk.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));
    await user.conn.start();
    await user.subscribeKeepers();
    return user;
}

const transferRequest = new TransferRequest({
    module: Swap.address,
    to: signer.address,
    underwriter: ZeroUnderwriterImpl.address,
    asset: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501', // renBTC on MATIC
    amount: String(utils.parseUnits('0.001', 8)),
    data: '0x'
});

const main = async () => {
    const user = await makeUser();



    transferRequest.setUnderwriter(ZeroUnderwriterImpl.address);
    await transferRequest.sign(signer, ZeroController.address);

    const gatewayAddress = await transferRequest.toGatewayAddress();
    console.log("Deposit BTC to", gatewayAddress)

    user.conn.on('peer:discovery', async () => await user.publishTransferRequest(transferRequest));
}

const signLoan = async (msg) => {
    console.log(msg)
}

main()