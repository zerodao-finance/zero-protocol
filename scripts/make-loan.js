const { utils, Contract, Wallet, providers } = require("ethers");
const { abi: BTCVaultAbi, address: BTCVaultAddress } = require("../deployments/matic/BTCVault.json");
const { abi: SwapAbi, address: SwapAddress } = require("../deployments/matic/Swap.json");
const { abi: StrategyAbi, address: StrategyAddress } = require("../deployments/matic/StrategyRenVM.json");
const { abi: TrivialUnderwriterAbi, address: TrivialUnderwriterAddress } = require("../deployments/matic/TrivialUnderwriter.json");
const { abi: ControllerAbi, address: ControllerAddress } = require("../deployments/matic/ZeroController.json");
const { default: TransferRequest } = require("../dist/lib/zero");

const pk = process.env.WALLET;
const signer = new providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/8_zmSL_WeJCxMIWGNugMkRgphmOCftMm");
const wallet = Wallet(pk).connect(signer);

const BTCVault = new Contract(BTCVaultAddress, BTCVaultAbi, wallet);
const Swap = new Contract(SwapAddress, SwapAbi, wallet);
const TrivialUnderwriter = new Contract(TrivialUnderwriterAddress, TrivialUnderwriterAbi, wallet);
const Controller = new Contract(ControllerAddress, ControllerAbi, wallet);

const lock = await Controller.provider.getCode(await Controller.lockFor(TrivialUnderwriter.address));

const transferRequest = new TransferRequest(
    Swap.address,
    wallet.address,
    TrivialUnderwriter.address,
    "0xDBf31dF14B66535aF65AaC99C32e9eA844e14501",
    String(utils.parseUnits("0.01", 8)),
    "0x"
);

const signature = transferRequest.sign(wallet, Controller.address);