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
    ETHEREUM: "https://eth-mainnet.alchemyapi.io/v2/Mqiya0B-TaJ1qWsUKuqBtwEyFIbKGWoX"
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
});

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
let done;

const keeperCallback = async (msg) => {
    if (done) return;
    done = true;
    console.log("Transfer Request: ", msg)
    const tr = new TransferRequest(msg);
    const tx = await tr.pollForFromChainTx();
    if (tx.amount >= tr.amount) {
        const tx = await underwriterImpl.loan(
            tr.to,
            tr.asset,
            tr.amount,
            tr.pNonce,
            tr.module,
            tr.data,
            tr.signature,
            { gasPrice: ethers.utils.parseUnits('400', 'gwei'), gasLimit: '500000' }
        );
        console.log("Transaction:", tx);
    }
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

    transferRequest.setUnderwriter(underwriterImpl.address);
    const lock = await Controller.provider.getCode(await Controller.lockFor(TrivialUnderwriter.address, { gasPrice: ethers.utils.parseUnits('400', 'gwei'), gasLimit: '500000' }));
    if (lock === '0x') await Controller.mint(underwriterAddress, BTCVault.address, { gasPrice: ethers.utils.parseUnits('400', 'gwei'), gasLimit: '500000' });
    await transferRequest.sign(signer, Controller.address);

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
