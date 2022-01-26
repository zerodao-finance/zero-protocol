const { getDefaultBitcoinClient } = require('../lib/rpc/btc');
const { utils, Contract, Wallet, providers } = require('ethers');
const { abi: BTCVaultAbi, address: BTCVaultAddress } = require('../deployments/matic/BTCVault.json');
const { abi: SwapAbi, address: SwapAddress } = require('../deployments/matic/Swap.json');
const { abi: StrategyAbi, address: StrategyAddress } = require('../deployments/matic/StrategyRenVM.json');
const {
    abi: DelegateUnderwriterAbi,
    address: underwriterAddress,
} = require('../deployments/matic/DelegateUnderwriter.json');
const { abi: ControllerAbi, address: ControllerAddress } = require('../deployments/matic/ZeroController.json');
const { default: TransferRequest } = require('../dist/lib/zero');

const pk = process.env.WALLET;
const signer = new providers.JsonRpcProvider(
    'https://polygon-mainnet.g.alchemy.com/v2/8_zmSL_WeJCxMIWGNugMkRgphmOCftMm',
);
signer.getGasPrice = require('ethers-polygongastracker').createGetGasPrice('rapid');
const wallet = new Wallet(pk).connect(signer);

const BTCVault = new Contract(BTCVaultAddress, BTCVaultAbi, wallet);
const Swap = new Contract(SwapAddress, SwapAbi, wallet);
const DelegateUnderwriter = new Contract(underwriterAddress, DelegateUnderwriterAbi, wallet);
const Controller = new Contract(ControllerAddress, ControllerAbi, wallet);
const underwriterImpl = new ethers.Contract(underwriterAddress, ControllerAbi, wallet);

const transferRequest = new TransferRequest(
    Swap.address,
    wallet.address,
    DelegateUnderwriter.address,
    '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501',
    String(utils.parseUnits('0.002', 8)),
    '0x',
);

const btc = getDefaultBitcoinClient();

(async () => {

    const address = transferRequest.toGatewayAddress()
    console.log("Gateway address is ", address)
    const received = await btc.listReceivedByAddress(address)
    received.txids.map((v) => console.log(v))
})()