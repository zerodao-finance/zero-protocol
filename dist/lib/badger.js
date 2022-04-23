'use strict';
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
var ethers = require('ethers');
var fixtures = require('./fixtures');
var UNISWAP = require('@uniswap/sdk');
var Route = require('@uniswap/sdk').Route;
var provider = new ethers.providers.InfuraProvider('mainnet', '816df2901a454b18b7df259e61f92cd2');
var getRenBTCForOneETHPrice = function () { return __awaiter(void 0, void 0, void 0, function () {
    var renBTC, pair, route, renBTCForOneEth;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                renBTC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.renBTC, 8);
                return [4 /*yield*/, UNISWAP.Fetcher.fetchPairData(renBTC, UNISWAP.WETH[renBTC.chainId], provider)];
            case 1:
                pair = _a.sent();
                route = new Route([pair], UNISWAP.WETH[renBTC.chainId]);
                renBTCForOneEth = route.midPrice.toSignificant(7);
                return [2 /*return*/, ethers.utils.parseUnits(renBTCForOneEth, 8)];
        }
    });
}); };
var computeRenBTCGasFee = function (gasCost, gasPrice) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = gasCost.mul(gasPrice)).mul;
                return [4 /*yield*/, getRenBTCForOneETHPrice()];
            case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()]).div(ethers.utils.parseEther('1'))];
        }
    });
}); };
var GAS_COST = ethers.BigNumber.from('300000');
var keeperReward = ethers.utils.parseEther('0.001');
var applyRatio = function (amount, ratio) {
    return ethers.BigNumber.from(amount).mul(ratio).div(ethers.utils.parseEther('1'));
};
var applyFee = function (amountIn, fee, multiplier, gasPrice) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, computeRenBTCGasFee(GAS_COST.add(keeperReward.div(gasPrice)), gasPrice)];
            case 1: return [2 /*return*/, (_a.sent()).add(applyRatio(amountIn, fee))];
        }
    });
}); };
var burnFee = ethers.utils.parseEther('0.004');
var mintFee = ethers.utils.parseEther('0.0025');
var deductBurnFee = function (amount, multiplier) { return __awaiter(void 0, void 0, void 0, function () {
    var gasPrice, amountAfterDeduction, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                amount = ethers.BigNumber.from(amount);
                return [4 /*yield*/, provider.getGasPrice()];
            case 1:
                gasPrice = _c.sent();
                _b = (_a = amount).sub;
                return [4 /*yield*/, applyFee(amount, burnFee, multiplier, gasPrice)];
            case 2:
                amountAfterDeduction = _b.apply(_a, [_c.sent()]);
                return [2 /*return*/, amountAfterDeduction <= 0 ? 0 : amountAfterDeduction];
        }
    });
}); };
var deductMintFee = function (amount, multiplier) { return __awaiter(void 0, void 0, void 0, function () {
    var gasPrice, amountAfterDeduction, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                amount = ethers.BigNumber.from(amount);
                return [4 /*yield*/, provider.getGasPrice()];
            case 1:
                gasPrice = _c.sent();
                _b = (_a = amount).sub;
                return [4 /*yield*/, applyFee(amount, mintFee, multiplier, gasPrice)];
            case 2:
                amountAfterDeduction = _b.apply(_a, [_c.sent()]);
                return [2 /*return*/, amountAfterDeduction <= 0 ? 0 : amountAfterDeduction];
        }
    });
}); };
var renCrv = new ethers.Contract('0x93054188d876f558f4a66B2EF1d97d16eDf0895B', ['function get_dy(int128, int128, uint256) view returns (uint256)'], provider);
var applyRenVMFee = function (input) {
    input = ethers.BigNumber.from(input);
    return input.mul(ethers.utils.parseEther('0.9985')).div(ethers.utils.parseEther('1'));
};
var applyRenVMMintFee = function (input) {
    input = ethers.BigNumber.from(input);
    return input.mul(ethers.utils.parseEther('0.9985')).div(ethers.utils.parseEther('1')).sub(ethers.utils.parseUnits('0.001', 8));
};
var fromUSDC = function (amount) { return __awaiter(void 0, void 0, void 0, function () {
    var USDC, renBTC, WETH, route, _a, _b, _c, trade, result;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                USDC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.USDC, 6);
                renBTC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.renBTC, 8);
                WETH = UNISWAP.WETH[UNISWAP.ChainId.MAINNET];
                _b = (_a = UNISWAP.Route).bind;
                return [4 /*yield*/, UNISWAP.Fetcher.fetchPairData(USDC, WETH, provider)];
            case 1:
                _c = [_d.sent()];
                return [4 /*yield*/, UNISWAP.Fetcher.fetchPairData(WETH, renBTC, provider)];
            case 2:
                route = new (_b.apply(_a, [void 0, _c.concat([_d.sent()]), USDC]))();
                trade = new UNISWAP.Trade(route, new UNISWAP.TokenAmount(USDC, ethers.BigNumber.from(amount).toString()), UNISWAP.TradeType.EXACT_INPUT);
                result = ethers.BigNumber.from(trade.outputAmount.raw.toString(10));
                return [2 /*return*/, result];
        }
    });
}); };
var toUSDC = function (amount) { return __awaiter(void 0, void 0, void 0, function () {
    var USDC, renBTC, WETH, route, _a, _b, _c, trade, result;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                USDC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.USDC, 6);
                renBTC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.renBTC, 8);
                WETH = UNISWAP.WETH[UNISWAP.ChainId.MAINNET];
                _b = (_a = UNISWAP.Route).bind;
                return [4 /*yield*/, UNISWAP.Fetcher.fetchPairData(renBTC, WETH, provider)];
            case 1:
                _c = [_d.sent()];
                return [4 /*yield*/, UNISWAP.Fetcher.fetchPairData(WETH, USDC, provider)];
            case 2:
                route = new (_b.apply(_a, [void 0, _c.concat([_d.sent()]), renBTC]))();
                trade = new UNISWAP.Trade(route, new UNISWAP.TokenAmount(renBTC, ethers.BigNumber.from(amount).toString()), UNISWAP.TradeType.EXACT_INPUT);
                result = ethers.BigNumber.from(trade.outputAmount.raw.toString(10));
                return [2 /*return*/, result];
        }
    });
}); };
var computeTransferOutput = exports.computeTransferOutput = function (_a) {
    var module = _a.module, amount = _a.amount;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = module;
                    switch (_b) {
                        case fixtures.ETHEREUM.USDC: return [3 /*break*/, 1];
                        case fixtures.ETHEREUM.WBTC: return [3 /*break*/, 4];
                        case fixtures.ETHEREUM.renBTC: return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 1:
                    _c = toUSDC;
                    return [4 /*yield*/, deductMintFee(applyRenVMMintFee(amount))];
                case 2: return [4 /*yield*/, _c.apply(void 0, [_e.sent()])];
                case 3: return [2 /*return*/, _e.sent()];
                case 4:
                    _d = deductMintFee;
                    return [4 /*yield*/, renCrv.get_dy(0, 1, applyRenVMMintFee(amount))];
                case 5: return [4 /*yield*/, _d.apply(void 0, [_e.sent(), 1])];
                case 6: return [2 /*return*/, _e.sent()];
                case 7: return [4 /*yield*/, deductMintFee(applyRenVMMintFee(amount))];
                case 8: return [2 /*return*/, _e.sent()];
                case 9: return [2 /*return*/, ethers.BigNumber.from('0')];
            }
        });
    });
};
var computeOutputBTC = exports.computeOutputBTC = function (burnRequest) { return __awaiter(void 0, void 0, void 0, function () {
    var asset, _a, _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                asset = burnRequest.asset;
                _a = asset;
                switch (_a) {
                    case fixtures.ETHEREUM.WBTC: return [3 /*break*/, 1];
                    case fixtures.ETHEREUM.renBTC: return [3 /*break*/, 4];
                    case fixtures.ETHEREUM.USDC: return [3 /*break*/, 6];
                }
                return [3 /*break*/, 9];
            case 1:
                _b = applyRenVMFee;
                _c = deductBurnFee;
                return [4 /*yield*/, renCrv.get_dy(1, 0, burnRequest.amount)];
            case 2: return [4 /*yield*/, _c.apply(void 0, [_g.sent(), 1])];
            case 3: return [2 /*return*/, _b.apply(void 0, [_g.sent()])];
            case 4:
                _d = applyRenVMFee;
                return [4 /*yield*/, deductBurnFee(burnRequest.amount, 1)];
            case 5: return [2 /*return*/, _d.apply(void 0, [_g.sent()])];
            case 6:
                _e = applyRenVMFee;
                _f = deductBurnFee;
                return [4 /*yield*/, fromUSDC(burnRequest.amount)];
            case 7: return [4 /*yield*/, _f.apply(void 0, [_g.sent(), 1])];
            case 8: return [2 /*return*/, _e.apply(void 0, [_g.sent()])];
            case 9:
                console.log('no asset found for computeOutputBTC:' + asset);
                return [2 /*return*/, burnRequest.amount];
        }
    });
}); };
