const { Contract, Wallet, providers } = require("ethers");

const BTCVaultJson = require("../../deployments/matic/BTCVault.json");
const DummyVaultJson = require("../../deployments/matic/DummyVault.json");
const StrategyRenVMJson = require("../../deployments/matic/StrategyRenVM.json");
const SwapJson = require("../../deployments/matic/Swap.json");
const TrivialUnderwriterJson = require("../../deployments/matic/TrivialUnderwriter.json");
const UnwrapNativeJson = require("../../deployments/matic/UnwrapNative.json");
const WrapNativeJson = require("../../deployments/matic/WrapNative.json");
const ZeroControllerJson = require("../../deployments/matic/ZeroController.json");
const ZeroCurveFactoryJson = require("../../deployments/matic/ZeroCurveFactory.json");
const ZeroUniswapFactoryJson = require("../../deployments/matic/ZeroUniswapFactory.json");

const url = "https://polygon-mainnet.g.alchemy.com/v2/8_zmSL_WeJCxMIWGNugMkRgphmOCftMm";
const provider = new providers.JsonRpcProvider(url);

const privateKey = process.env.WALLET;
var signer = new Wallet(privateKey, provider);
signer.provider.getGasPrice = require('ethers-polygongastracker').createGetGasPrice('rapid')

export const BTCVault = new Contract(BTCVaultJson.address, BTCVaultJson.abi, signer);
export const DummyVault = new Contract(DummyVaultJson.address, DummyVaultJson.abi, signer);
export const Swap = new Contract(SwapJson.address, SwapJson.abi, signer);
export const TrivialUnderwriter = new Contract(TrivialUnderwriterJson.address, TrivialUnderwriterJson.abi, signer);
export const UnwrapNative = new Contract(UnwrapNativeJson.address, UnwrapNativeJson.abi, signer);
export const WrapNative = new Contract(WrapNativeJson.address, WrapNativeJson.abi, signer);
export const ZeroController = new Contract(ZeroControllerJson.address, ZeroControllerJson.abi, signer);
export const ZeroCurveFactory = new Contract(ZeroCurveFactoryJson.address, ZeroCurveFactoryJson.abi, signer);
export const ZeroUniswapFactory = new Contract(ZeroUniswapFactoryJson.address, ZeroUniswapFactoryJson.abi, signer);
export const ZeroUnderwriterImpl = new Contract(TrivialUnderwriterJson.address, ZeroControllerJson.abi, signer);