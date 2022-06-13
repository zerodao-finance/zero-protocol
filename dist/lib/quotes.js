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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var ethers = require("ethers");
var fixtures = require("./fixtures");
var JOE = require("@traderjoe-xyz/sdk");
var UNISWAP = require("@uniswap/sdk");
var Route = require("@uniswap/sdk").Route;
var returnChainDetails = function (CHAINID) {
    switch (String(CHAINID)) {
        case "1":
            return {
                name: "ETHEREUM",
                provider: new ethers.providers.InfuraProvider("mainnet", "816df2901a454b18b7df259e61f92cd2"),
                uniswapName: "MAINNET"
            };
        case "42161":
            return {
                name: "ARBITRUM",
                provider: new ethers.providers.InfuraProvider("mainnet", "816df2901a454b18b7df259e61f92cd2"),
                uniswapName: "ARBITRUM"
            };
        case "43114":
            return {
                name: "AVALANCHE",
                provider: new ethers.providers.JsonRpcProvider("https://api.avax.network/ext/bc/C/rpc"),
                uniswapName: ""
            };
    }
};
module.exports = function makeQuoter(CHAIN) {
    var _this = this;
    if (CHAIN === void 0) { CHAIN = "1"; }
    var chain = returnChainDetails(CHAIN);
    var renCrv = new ethers.Contract(fixtures[chain.name]["Curve_Ren"], [
        "function get_dy(int128, int128, uint256) view returns (uint256)",
        "function get_dy_underlying(int128, int128, uint256) view returns (uint256)",
    ], chain.provider);
    var quoter = new ethers.Contract("0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6", [
        "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) public view returns (uint256 amountOut)",
        "function quoteExactInput(bytes path, uint256 amountIn) public view returns (uint256 amountOut)",
    ], chain.provider);
    // direction ? renbtc -> avax : avax -> renbtc
    var getAVAXQuote = function (direction, amount) { return __awaiter(_this, void 0, void 0, function () {
        var WBTC, pair, wbtcAmount, route, trade, price, route, trade;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    WBTC = new JOE.Token(JOE.ChainId.AVALANCHE, fixtures.AVALANCHE.WBTC, 8);
                    return [4 /*yield*/, JOE.Fetcher.fetchPairData(WBTC, JOE.WAVAX[ChainId.AVALANCHE], chain.provider)];
                case 1:
                    pair = _a.sent();
                    if (!direction) return [3 /*break*/, 3];
                    return [4 /*yield*/, getWbtcQuoteAVAX(true, amount)];
                case 2:
                    wbtcAmount = _a.sent();
                    route = new Route([pair], WBTC);
                    trade = new Trade(route, new TokenAmount(WBTC_E, wbtcAmount), TradeType.EXACT_INPUT);
                    price = trade.midPrice.toSignificant(17);
                    return [2 /*return*/, ethers.utils.parseEther(price)];
                case 3:
                    route = new Route([pair], WAVAX[ChainId.AVALANCHE]);
                    trade = new Trade(route, new TokenAmount(WAVAX[ChainId.AVALANCHE], amount), TradeType.EXACT_INPUT);
                    return [4 /*yield*/, getWbtcQuoteAVAX(false, ethers.utils.parseUnits(trade.midPrice.toSignificant(7), 8))];
                case 4: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    // direction = true ? usdc -> renbtc
    var getUsdcQuoteAVAX = function (direction, amount) { return __awaiter(_this, void 0, void 0, function () {
        var aTricrypto, crvUSD, renCrvPath, path, av3usdAmount, wbtcAmount, wbtcAmount, av3usdAmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    aTricrypto = createContract("0xB755B949C126C04e0348DD881a5cF55d424742B2", ["function get_dy(uint256, uint256, uint256) view returns (uint256)"]);
                    crvUSD = createContract("0x7f90122BF0700F9E7e1F688fe926940E8839F353", [
                        "function calc_token_amount(uint256[3] calldata, bool) view returns (uint256)",
                    ], [
                        "function calc_withdraw_one_coin(uint256, int128) view returns (uint256)",
                    ]);
                    renCrvPath = [0, 1];
                    path = [0, 1];
                    if (!direction) return [3 /*break*/, 4];
                    return [4 /*yield*/, crvUSD.calc_token_amount([0, amount, 0], true)];
                case 1:
                    av3usdAmount = _a.sent();
                    return [4 /*yield*/, aTricrypto.get_dy.apply(aTricrypto, __spreadArray(__spreadArray([], path, false), [av3usdAmount], false))];
                case 2:
                    wbtcAmount = _a.sent();
                    return [4 /*yield*/, renCrv.get_dy.apply(renCrv, __spreadArray(__spreadArray([], renCrvPath, false), [wbtcAmount], false))];
                case 3: return [2 /*return*/, _a.sent()];
                case 4: return [4 /*yield*/, renCrv.get_dy.apply(renCrv, __spreadArray(__spreadArray([], __spreadArray([], renCrvPath, true).reverse(), false), [amount], false))];
                case 5:
                    wbtcAmount = _a.sent();
                    return [4 /*yield*/, aTricrypto.get_dy.apply(aTricrypto, __spreadArray(__spreadArray([], __spreadArray([], path, true).reverse(), false), [wbtcAmount], false))];
                case 6:
                    av3usdAmount = _a.sent();
                    return [4 /*yield*/, crvUSD.calc_withdraw_one_coin(av3usdAmount, 1)];
                case 7: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    var getRenBTCForOneETHPrice = function () { return __awaiter(_this, void 0, void 0, function () {
        var renBTC, pair, route, renBTCForOneEth, amt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(chain.name === "AVALANCHE")) return [3 /*break*/, 2];
                    return [4 /*yield*/, getAVAXQuote(false, ethers.utils.parseEther("1"))];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    if (!(chain.name === "ETHEREUM")) return [3 /*break*/, 4];
                    renBTC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.renBTC, 8);
                    return [4 /*yield*/, UNISWAP.Fetcher.fetchPairData(renBTC, UNISWAP.WETH[renBTC.chainId], chain.provider)];
                case 3:
                    pair = _a.sent();
                    route = new Route([pair], UNISWAP.WETH[renBTC.chainId]);
                    renBTCForOneEth = route.midPrice.toSignificant(7);
                    return [2 /*return*/, ethers.utils.parseUnits(renBTCForOneEth, 8)];
                case 4: return [4 /*yield*/, WBTCFromETH(parseEther("1"))];
                case 5:
                    amt = _a.sent();
                    return [4 /*yield*/, getWbtcQuote(false, amt)];
                case 6: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    var fromUSDC = function (amount) { return __awaiter(_this, void 0, void 0, function () {
        var output, e_1, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(chain.name === "AVALANCHE")) return [3 /*break*/, 2];
                    return [4 /*yield*/, getUsdcQuoteAVAX(true, amount)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    output = null;
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, quoter.quoteExactInput(ethers.utils.solidityPack(["address", "uint24", "address", "uint24", "address"], [
                            fixtures[chain.name].USDC,
                            500,
                            fixtures[chain.name].WETH,
                            500,
                            fixtures[chain.name].WBTC,
                        ]), amount)];
                case 4:
                    output = _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    console.error(e_1);
                    console.error("Insufficient USDC amount for price fetch");
                    return [2 /*return*/, 0];
                case 6: return [4 /*yield*/, renBTCFromWBTC(output)];
                case 7:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    }); };
    var toUSDC = function (amount) { return __awaiter(_this, void 0, void 0, function () {
        var wbtcOut, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    if (!(chain.name === "AVALANCHE")) return [3 /*break*/, 2];
                    return [4 /*yield*/, getUsdcQuoteAVAX(false, amount)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [4 /*yield*/, getWbtcQuote(true, amount)];
                case 3:
                    wbtcOut = _a.sent();
                    return [4 /*yield*/, quoter.quoteExactInput(ethers.utils.solidityPack(["address", "uint24", "address", "uint24", "address"], [
                            fixtures[chain.name].WBTC,
                            500,
                            fixtures[chain.name].WETH,
                            500,
                            fixtures[chain.name].USDC,
                        ]), wbtcOut)];
                case 4: return [2 /*return*/, _a.sent()];
                case 5: return [3 /*break*/, 7];
                case 6:
                    e_2 = _a.sent();
                    console.error(e_2);
                    return [2 /*return*/, 0];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // direction = true ? renbtc -> wbtc
    var getWbtcQuote = function (direction, amount) { return __awaiter(_this, void 0, void 0, function () {
        var path;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = chain.name === "ETHEREUM" ? [0, 1] : [1, 0];
                    return [4 /*yield*/, renCrv[chain.name === "AVALANCHE" ? "get_dy_underlying" : "get_dy"].apply(renCrv, __spreadArray(__spreadArray([], (direction ? path : __spreadArray([], path, true).reverse()), false), [amount], false))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    var ETHtoRenBTC = function (amount) { return __awaiter(_this, void 0, void 0, function () {
        var output, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(chain.name === "AVALANCHE")) return [3 /*break*/, 2];
                    return [4 /*yield*/, getAVAXQuote(false, amount)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 2: return [4 /*yield*/, quoter.quoteExactInputSingle(fixtures[chain.name].wETH, fixtures[chain.name].WBTC, 500, amount, 0)];
                case 3:
                    output = _a.sent();
                    return [4 /*yield*/, getWbtcQuote(false, output)];
                case 4:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var renBTCToETH = function (amount) { return __awaiter(_this, void 0, void 0, function () {
        var wbtcOut;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(chain.name === "AVALANCHE")) return [3 /*break*/, 1];
                    return [2 /*return*/, getAVAXQuote(true, amount)];
                case 1: return [4 /*yield*/, getWbtcQuote(true, amount)];
                case 2:
                    wbtcOut = _a.sent();
                    return [4 /*yield*/, quoter.quoteExactInputSingle(fixtures[chain.name].WBTC, fixtures[chain.name].WETH, 500, wbtcOut, 0)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    return {
        fromUSDC: fromUSDC,
        getAVAXQuote: getAVAXQuote,
        getRenBTCForOneETHPrice: getRenBTCForOneETHPrice,
        getUsdcQuoteAVAX: getUsdcQuoteAVAX,
        getWbtcQuote: getWbtcQuote,
        renBTCToETH: renBTCToETH,
        toUSDC: toUSDC,
        ETHtoRenBTC: ETHtoRenBTC,
        chain: chain
    };
};
