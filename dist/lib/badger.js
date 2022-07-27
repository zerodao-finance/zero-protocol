"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var ethers = require("ethers");
var fixtures = require("./fixtures");
var Quotes = require("./quotes");
var RenJS = require('@renproject/ren');
var _a = require("@renproject/chains"), Bitcoin = _a.Bitcoin, Arbitrum = _a.Arbitrum, Avalanche = _a.Avalanche, Polygon = _a.Polygon, Ethereum = _a.Ethereum, Optimism = _a.Optimism;
var RPC_ENDPOINTS = require('../dist/lib/deployment-utils').RPC_ENDPOINTS;
var keeperReward = ethers.utils.parseEther("0.001");
var getProvider = function (chainName) {
    return new ethers.providers.JsonRpcProvider(RPC_ENDPOINTS[chainName]);
};
var getChainName = function (chainId) {
    switch (chainId) {
        case "42161":
            return "Arbitrum";
        case "43114":
            return "Avalanche";
        case "137":
            return "Polygon";
        case "1":
            return "Mainnet";
        case "10":
            return "Optimism";
        default:
            return "Unsupported Chain";
    }
};
var applyRatio = function (amount, ratio) {
    return ethers.BigNumber.from(amount)
        .mul(ratio)
        .div(ethers.utils.parseEther("1"));
};
exports.makeCompute = function (CHAIN) {
    if (CHAIN === void 0) { CHAIN = "1"; }
    var quotes = Quotes(CHAIN);
    var GAS_COST = ethers.BigNumber.from((function () {
        switch (CHAIN) {
            case "42161":
                return "480000";
            case "137":
                return "642000";
            case "43114":
                return "1240000";
            default:
                return "420000";
        }
    })());
    var bitcoin = new Bitcoin({ network: "mainnet" });
    var arbitrum = new Arbitrum({ provider: getProvider('Arbitrum'), network: "mainnet" });
    var avalanche = new Avalanche({ provider: getProvider('Avalanche'), network: "mainnet" });
    var polygon = new Polygon({ provider: getProvider('Polygon'), network: "mainnet" });
    var optimism = new Optimism({ provider: getProvider('Optimism'), network: "mainnet" });
    var ethereum = new Ethereum({ provider: getProvider('Ethereum'), network: "mainnet" });
    var renJS = new RenJS.RenJS("mainnet").withChains(bitcoin, arbitrum, avalanche, polygon, optimism, ethereum);
    var computeTransferOutput = function (_a) {
        var module = _a.module, amount = _a.amount;
        return __awaiter(void 0, void 0, void 0, function () {
            var _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _b = module;
                        switch (_b) {
                            case fixtures[quotes.chain.name].USDC: return [3 /*break*/, 1];
                            case fixtures[quotes.chain.name].WBTC: return [3 /*break*/, 4];
                            case fixtures[quotes.chain.name].renBTC: return [3 /*break*/, 7];
                            case ethers.constants.AddressZero: return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 12];
                    case 1:
                        _d = (_c = quotes).toUSDC;
                        return [4 /*yield*/, deductMintFee(amount)];
                    case 2: return [4 /*yield*/, _d.apply(_c, [_h.sent()])];
                    case 3: return [2 /*return*/, _h.sent()];
                    case 4:
                        _e = deductMintFee;
                        return [4 /*yield*/, quotes.getWbtcQuote(true, amount)];
                    case 5: return [4 /*yield*/, _e.apply(void 0, [_h.sent(), 1])];
                    case 6: return [2 /*return*/, _h.sent()];
                    case 7: return [4 /*yield*/, deductMintFee(amount)];
                    case 8: return [2 /*return*/, _h.sent()];
                    case 9:
                        _g = (_f = quotes).renBTCToETH;
                        return [4 /*yield*/, deductMintFee(amount)];
                    case 10: return [4 /*yield*/, _g.apply(_f, [_h.sent()])];
                    case 11: return [2 /*return*/, _h.sent()];
                    case 12: return [2 /*return*/, ethers.BigNumber.from("0")];
                }
            });
        });
    };
    var computeRenBTCGasFee = function (gasCost, gasPrice) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = gasCost
                        .mul(gasPrice))
                        .mul;
                    return [4 /*yield*/, quotes.getRenBTCForOneETHPrice()];
                case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])
                        .div(ethers.utils.parseEther("1"))];
            }
        });
    }); };
    var deductBurnFee = function (amount, multiplier) { return __awaiter(void 0, void 0, void 0, function () {
        var feeAmounts, amountAfterDeduction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    amount = ethers.BigNumber.from(amount);
                    return [4 /*yield*/, applyFee(amount, burnFee, renVmFeeBurn)];
                case 1:
                    feeAmounts = _a.sent();
                    amountAfterDeduction = amount.sub(feeAmounts.totalFees);
                    return [2 /*return*/, amountAfterDeduction <= 0 ? 0 : amountAfterDeduction];
            }
        });
    }); };
    var deductMintFee = function (amount) { return __awaiter(void 0, void 0, void 0, function () {
        var feeAmounts, amountAfterDeduction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    amount = ethers.BigNumber.from(amount);
                    return [4 /*yield*/, applyFee(amount, mintFee, renVmFeeMint)];
                case 1:
                    feeAmounts = _a.sent();
                    amountAfterDeduction = amount.sub(feeAmounts.totalFees);
                    return [2 /*return*/, amountAfterDeduction <= 0 ? 0 : amountAfterDeduction];
            }
        });
    }); };
    var getConvertedAmount = (exports.getConvertedAmount = function (asset, amount) { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = asset;
                    switch (_a) {
                        case fixtures[quotes.chain.name].WBTC: return [3 /*break*/, 1];
                        case fixtures[quotes.chain.name].renBTC: return [3 /*break*/, 3];
                        case fixtures[quotes.chain.name].USDC: return [3 /*break*/, 4];
                        case ethers.constants.AddressZero: return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 8];
                case 1: return [4 /*yield*/, quotes.getWbtcQuote(false, amount)];
                case 2: return [2 /*return*/, _b.sent()];
                case 3: return [2 /*return*/, amount];
                case 4: return [4 /*yield*/, quotes.fromUSDC(amount)];
                case 5: return [2 /*return*/, _b.sent()];
                case 6: return [4 /*yield*/, quotes.ETHtoRenBTC(amount)];
                case 7: return [2 /*return*/, _b.sent()];
                case 8:
                    console.error("no asset found for getConvertedAmount:" + asset);
                    return [2 /*return*/, amount];
            }
        });
    }); });
    var computeOutputBTC = function (burnRequest) { return __awaiter(void 0, void 0, void 0, function () {
        var asset, amount, convertedAmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    asset = burnRequest.asset, amount = burnRequest.amount;
                    return [4 /*yield*/, getConvertedAmount(asset, amount)];
                case 1:
                    convertedAmount = _a.sent();
                    return [4 /*yield*/, deductBurnFee(convertedAmount)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    var applyFee = function (amountIn, zeroFee, renVmFee) { return __awaiter(void 0, void 0, void 0, function () {
        var gasPrice, gasFee, evmChain, renVmFees, renOutput, zeroProtocolFeeAmt, renVmFeeAmt, renVmBtcNetworkFee, opFee, totalFees;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, quotes.chain.provider.getGasPrice()];
                case 1:
                    gasPrice = _a.sent();
                    return [4 /*yield*/, computeRenBTCGasFee(GAS_COST.add(keeperReward.div(gasPrice)), gasPrice)];
                case 2:
                    gasFee = _a.sent();
                    evmChain = getChainName(CHAIN) == 'Mainnet' ? 'Ethereum' : getChainName(CHAIN);
                    return [4 /*yield*/, renJS.getFees({
                            asset: "BTC",
                            from: zeroFee == mintFee ? "Bitcoin" : evmChain,
                            to: zeroFee == burnFee ? "Bitcoin" : evmChain
                        })];
                case 3:
                    renVmFees = _a.sent();
                    renOutput = ethers.BigNumber.from(renVmFees.estimateOutput(amountIn.toString()).toFixed());
                    zeroProtocolFeeAmt = applyRatio(amountIn, zeroFee);
                    renVmFeeAmt = applyRatio(amountIn, renVmFee);
                    renVmBtcNetworkFee = amountIn.sub(renOutput).sub(renVmFeeAmt);
                    opFee = zeroProtocolFeeAmt.add(renVmFeeAmt);
                    totalFees = gasFee.add(opFee);
                    totalFees = totalFees.add(renVmBtcNetworkFee);
                    return [2 /*return*/, { gasFee: gasFee, zeroProtocolFeeAmt: zeroProtocolFeeAmt, renVmFeeAmt: renVmFeeAmt, renVmBtcNetworkFee: renVmBtcNetworkFee, opFee: opFee, totalFees: totalFees }];
            }
        });
    }); };
    var burnFee = ethers.utils.parseEther("0.003");
    var renVmFeeBurn = ethers.utils.parseEther("0.001");
    var mintFee = ethers.utils.parseEther("0.002");
    var renVmFeeMint = ethers.utils.parseEther("0.002");
    return {
        computeTransferOutput: computeTransferOutput,
        computeOutputBTC: computeOutputBTC,
        applyFee: applyFee,
        burnFee: burnFee,
        mintFee: mintFee,
        renVmFeeBurn: renVmFeeBurn,
        renVmFeeMint: renVmFeeMint,
        computeRenBTCGasFee: computeRenBTCGasFee,
        getConvertedAmount: getConvertedAmount
    };
};
