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
var RenJS = require("@renproject/ren");
var _a = require("@renproject/chains"), Bitcoin = _a.Bitcoin, Zcash = _a.Zcash, Arbitrum = _a.Arbitrum, Avalanche = _a.Avalanche, Polygon = _a.Polygon, Ethereum = _a.Ethereum, Optimism = _a.Optimism;
var RPC_ENDPOINTS = require("../dist/lib/deployment-utils").RPC_ENDPOINTS;
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
    var zcash = new Zcash({ network: "mainnet" });
    var arbitrum = new Arbitrum({
        provider: getProvider("Arbitrum"),
        network: "mainnet"
    });
    var avalanche = new Avalanche({
        provider: getProvider("Avalanche"),
        network: "mainnet"
    });
    var polygon = new Polygon({
        provider: getProvider("Polygon"),
        network: "mainnet"
    });
    var optimism = new Optimism({
        provider: getProvider("Optimism"),
        network: "mainnet"
    });
    var ethereum = new Ethereum({
        provider: getProvider("Ethereum"),
        network: "mainnet"
    });
    var renJS = new RenJS.RenJS("mainnet").withChains(bitcoin, zcash, arbitrum, avalanche, polygon, optimism, ethereum);
    var computeTransferOutput = function (_a) {
        var module = _a.module, amount = _a.amount, primaryToken = _a.primaryToken;
        return __awaiter(void 0, void 0, void 0, function () {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        if (!(primaryToken == "ZEC")) return [3 /*break*/, 7];
                        _b = module;
                        switch (_b) {
                            case fixtures["ETHEREUM"].renZEC: return [3 /*break*/, 1];
                            case fixtures["ETHEREUM"].ETH: return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 6];
                    case 1: return [4 /*yield*/, deductMintFee(amount, primaryToken)];
                    case 2: return [2 /*return*/, _l.sent()];
                    case 3:
                        _d = (_c = quotes).renZECToETH;
                        return [4 /*yield*/, deductMintFee(amount, primaryToken)];
                    case 4: return [4 /*yield*/, _d.apply(_c, [_l.sent()])];
                    case 5: return [2 /*return*/, _l.sent()];
                    case 6:
                        console.error("no asset found for getConvertedAmount:" + module);
                        return [2 /*return*/, ethers.BigNumber.from("0")];
                    case 7:
                        _e = module;
                        switch (_e) {
                            case fixtures[quotes.chain.name].USDC: return [3 /*break*/, 8];
                            case fixtures[quotes.chain.name].WBTC: return [3 /*break*/, 11];
                            case fixtures[quotes.chain.name].renBTC: return [3 /*break*/, 14];
                            case ethers.constants.AddressZero: return [3 /*break*/, 16];
                        }
                        return [3 /*break*/, 19];
                    case 8:
                        _g = (_f = quotes).toUSDC;
                        return [4 /*yield*/, deductMintFee(amount, primaryToken)];
                    case 9: return [4 /*yield*/, _g.apply(_f, [_l.sent()])];
                    case 10: return [2 /*return*/, _l.sent()];
                    case 11:
                        _h = deductMintFee;
                        return [4 /*yield*/, quotes.getWbtcQuote(true, amount)];
                    case 12: return [4 /*yield*/, _h.apply(void 0, [_l.sent(), 1])];
                    case 13: return [2 /*return*/, _l.sent()];
                    case 14: return [4 /*yield*/, deductMintFee(amount, primaryToken)];
                    case 15: return [2 /*return*/, _l.sent()];
                    case 16:
                        _k = (_j = quotes).renBTCToETH;
                        return [4 /*yield*/, deductMintFee(amount, primaryToken)];
                    case 17: return [4 /*yield*/, _k.apply(_j, [_l.sent()])];
                    case 18: return [2 /*return*/, _l.sent()];
                    case 19: return [2 /*return*/, ethers.BigNumber.from("0")];
                }
            });
        });
    };
    var computeGasFee = function (gasCost, gasPrice, primaryToken) {
        switch (primaryToken) {
            case "ZEC":
                return computeRenZECGasFee(gasCost, gasPrice);
            default:
                return computeRenBTCGasFee(gasCost, gasPrice);
        }
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
    var computeRenZECGasFee = function (gasCost, gasPrice) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = gasCost
                        .mul(gasPrice))
                        .mul;
                    return [4 /*yield*/, quotes.ETHToRenZEC(ethers.utils.parseEther("1"))];
                case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])
                        .div(ethers.utils.parseEther("1"))];
            }
        });
    }); };
    var deductBurnFee = function (amount, primaryToken) { return __awaiter(void 0, void 0, void 0, function () {
        var feeAmounts, amountAfterDeduction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    amount = ethers.BigNumber.from(amount);
                    return [4 /*yield*/, applyFee(amount, burnFee, renVmFeeBurn, primaryToken)];
                case 1:
                    feeAmounts = _a.sent();
                    amountAfterDeduction = amount.sub(feeAmounts.totalFees);
                    return [2 /*return*/, amountAfterDeduction <= 0 ? 0 : amountAfterDeduction];
            }
        });
    }); };
    var deductMintFee = function (amount, primaryToken) { return __awaiter(void 0, void 0, void 0, function () {
        var feeAmounts, amountAfterDeduction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    amount = ethers.BigNumber.from(amount);
                    return [4 /*yield*/, applyFee(amount, mintFee, renVmFeeMint, primaryToken)];
                case 1:
                    feeAmounts = _a.sent();
                    amountAfterDeduction = amount.sub(feeAmounts.totalFees);
                    return [2 /*return*/, amountAfterDeduction <= 0 ? 0 : amountAfterDeduction];
            }
        });
    }); };
    var getConvertedAmount = (exports.getConvertedAmount = function (asset, amount, primaryToken) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(primaryToken == "ZEC")) return [3 /*break*/, 5];
                    _a = asset;
                    switch (_a) {
                        case fixtures["ETHEREUM"].renZEC: return [3 /*break*/, 1];
                        case fixtures["ETHEREUM"].ETH: return [3 /*break*/, 2];
                    }
                    return [3 /*break*/, 4];
                case 1: return [2 /*return*/, amount];
                case 2: return [4 /*yield*/, quotes.ETHToRenZEC(amount)];
                case 3: return [2 /*return*/, _c.sent()];
                case 4:
                    console.error("no asset found for getConvertedAmount:" + asset);
                    return [2 /*return*/, amount];
                case 5:
                    _b = asset;
                    switch (_b) {
                        case fixtures[quotes.chain.name].WBTC: return [3 /*break*/, 6];
                        case fixtures[quotes.chain.name].renBTC: return [3 /*break*/, 8];
                        case fixtures[quotes.chain.name].USDC: return [3 /*break*/, 9];
                        case ethers.constants.AddressZero: return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 13];
                case 6: return [4 /*yield*/, quotes.getWbtcQuote(false, amount)];
                case 7: return [2 /*return*/, _c.sent()];
                case 8: return [2 /*return*/, amount];
                case 9: return [4 /*yield*/, quotes.fromUSDC(amount)];
                case 10: return [2 /*return*/, _c.sent()];
                case 11: return [4 /*yield*/, quotes.ETHtoRenBTC(amount)];
                case 12: return [2 /*return*/, _c.sent()];
                case 13:
                    console.error("no asset found for getConvertedAmount:" + asset);
                    return [2 /*return*/, amount];
            }
        });
    }); });
    var computeOutputBTC = function (burnRequest) { return __awaiter(void 0, void 0, void 0, function () {
        var asset, amount, primaryToken, convertedAmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    asset = burnRequest.asset, amount = burnRequest.amount, primaryToken = burnRequest.primaryToken;
                    return [4 /*yield*/, getConvertedAmount(asset, amount, primaryToken)];
                case 1:
                    convertedAmount = _a.sent();
                    return [4 /*yield*/, deductBurnFee(convertedAmount, primaryToken)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    var selectNetwork = function (primaryToken) {
        switch (primaryToken) {
            case "ZEC":
                return { network: "Zcash", asset: "ZEC" };
            default:
                return { network: "Bitcoin", asset: "BTC" };
        }
    };
    var applyFee = function (amountIn, zeroFee, renVmFee, primaryToken) { return __awaiter(void 0, void 0, void 0, function () {
        var gasPrice, _a, network, asset, gasFee, evmChain, renOutput, renVmFees, e_1, zeroProtocolFeeAmt, renVmFeeAmt, renVmBtcNetworkFee, opFee, totalFees;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, quotes.chain.provider.getGasPrice()];
                case 1:
                    gasPrice = _b.sent();
                    _a = selectNetwork(primaryToken), network = _a.network, asset = _a.asset;
                    return [4 /*yield*/, computeGasFee(GAS_COST.add(keeperReward.div(gasPrice)), gasPrice, primaryToken)];
                case 2:
                    gasFee = _b.sent();
                    evmChain = getChainName(CHAIN) == "Mainnet" ? "Ethereum" : getChainName(CHAIN);
                    renOutput = ethers.utils.parseUnits("0", 8);
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, renJS.getFees({
                            asset: asset,
                            from: zeroFee == mintFee ? network : evmChain,
                            to: zeroFee == burnFee ? network : evmChain
                        })];
                case 4:
                    renVmFees = _b.sent();
                    renOutput = ethers.BigNumber.from(renVmFees.estimateOutput(amountIn.toString()).toFixed());
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _b.sent();
                    console.error("error getting renVM fees", e_1);
                    renOutput = amountIn.sub(ethers.utils.parseUnits("0.004", 8));
                    return [3 /*break*/, 6];
                case 6:
                    zeroProtocolFeeAmt = applyRatio(amountIn, zeroFee);
                    renVmFeeAmt = applyRatio(amountIn, renVmFee);
                    renVmBtcNetworkFee = amountIn.sub(renOutput).sub(renVmFeeAmt);
                    opFee = zeroProtocolFeeAmt.add(renVmFeeAmt);
                    totalFees = gasFee.add(opFee);
                    totalFees = totalFees.add(renVmBtcNetworkFee);
                    return [2 /*return*/, {
                            gasFee: gasFee,
                            zeroProtocolFeeAmt: zeroProtocolFeeAmt,
                            renVmFeeAmt: renVmFeeAmt,
                            renVmBtcNetworkFee: renVmBtcNetworkFee,
                            opFee: opFee,
                            totalFees: totalFees
                        }];
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
