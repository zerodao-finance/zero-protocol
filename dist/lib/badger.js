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
var UNISWAP = require("@uniswap/sdk");
var Route = require("@uniswap/sdk").Route;
var provider = new ethers.providers.InfuraProvider("mainnet", "816df2901a454b18b7df259e61f92cd2");
var quoter = new ethers.Contract("0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6", [
    "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) public view returns (uint256 amountOut)",
    "function quoteExactInput(bytes path, uint256 amountIn) public view returns (uint256 amountOut)",
], provider);
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
                _b = (_a = gasCost
                    .mul(gasPrice))
                    .mul;
                return [4 /*yield*/, getRenBTCForOneETHPrice()];
            case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])
                    .div(ethers.utils.parseEther("1"))];
        }
    });
}); };
var GAS_COST = ethers.BigNumber.from("370000");
var keeperReward = ethers.utils.parseEther("0.001");
var applyRatio = function (amount, ratio) {
    return ethers.BigNumber.from(amount)
        .mul(ratio)
        .div(ethers.utils.parseEther("1"));
};
var applyFee = (exports.applyFee = function (amountIn, fee, multiplier) { return __awaiter(void 0, void 0, void 0, function () {
    var gasPrice, gasFee, opFee, totalFees;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, provider.getGasPrice()];
            case 1:
                gasPrice = _a.sent();
                return [4 /*yield*/, computeRenBTCGasFee(GAS_COST.add(keeperReward.div(gasPrice)), gasPrice)];
            case 2:
                gasFee = _a.sent();
                opFee = applyRatio(amountIn, fee);
                totalFees = gasFee.add(opFee);
                return [2 /*return*/, { gasFee: gasFee, opFee: opFee, totalFees: totalFees }];
        }
    });
}); });
var burnFee = (exports.burnFee = ethers.utils.parseEther("0.004"));
var mintFee = (exports.mintFee = ethers.utils.parseEther("0.0025"));
var deductBurnFee = function (amount, multiplier) { return __awaiter(void 0, void 0, void 0, function () {
    var feeAmounts, amountAfterDeduction;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                amount = ethers.BigNumber.from(amount);
                return [4 /*yield*/, applyFee(amount, burnFee, multiplier)];
            case 1:
                feeAmounts = _a.sent();
                amountAfterDeduction = amount.sub(feeAmounts.totalFees);
                return [2 /*return*/, amountAfterDeduction <= 0 ? 0 : amountAfterDeduction];
        }
    });
}); };
var deductMintFee = function (amount, multiplier) { return __awaiter(void 0, void 0, void 0, function () {
    var feeAmounts, amountAfterDeduction;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                amount = ethers.BigNumber.from(amount);
                return [4 /*yield*/, applyFee(amount, mintFee, multiplier)];
            case 1:
                feeAmounts = _a.sent();
                amountAfterDeduction = amount.sub(feeAmounts.totalFees);
                return [2 /*return*/, amountAfterDeduction <= 0 ? 0 : amountAfterDeduction];
        }
    });
}); };
var renCrv = (exports.renCrv = new ethers.Contract("0x93054188d876f558f4a66B2EF1d97d16eDf0895B", ["function get_dy(int128, int128, uint256) view returns (uint256)"], provider));
var applyRenVMFee = (exports.applyRenVMFee = function (input) {
    input = ethers.BigNumber.from(input);
    return input
        .mul(ethers.utils.parseEther("0.9985"))
        .div(ethers.utils.parseEther("1"));
});
var applyRenVMMintFee = (exports.applyRenVMMintFee = function (input) {
    input = ethers.BigNumber.from(input);
    var result = input
        .mul(ethers.utils.parseEther("0.9985"))
        .div(ethers.utils.parseEther("1"))
        .sub(ethers.utils.parseUnits("0.001", 8));
    return result;
});
var fromUSDC = function (amount) { return __awaiter(void 0, void 0, void 0, function () {
    var WETH, output, e_1, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                WETH = UNISWAP.WETH["1"];
                output = null;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, quoter.quoteExactInput(ethers.utils.solidityPack(["address", "uint24", "address", "uint24", "address"], [fixtures.ETHEREUM.USDC, 500, WETH.address, 500, fixtures.ETHEREUM.WBTC]), amount)];
            case 2:
                output = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.error(e_1);
                console.error("Insufficient USDC amount for price fetch");
                return [2 /*return*/, 0];
            case 4: return [4 /*yield*/, renBTCFromWBTC(output)];
            case 5:
                result = _a.sent();
                return [2 /*return*/, result];
        }
    });
}); };
var toUSDC = (exports.toUSDC = function (amount) { return __awaiter(void 0, void 0, void 0, function () {
    var wbtcOut, WETH, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, WBTCFromRenBTC(amount)];
            case 1:
                wbtcOut = _a.sent();
                WETH = UNISWAP.WETH["1"];
                return [4 /*yield*/, quoter.quoteExactInput(ethers.utils.solidityPack(["address", "uint24", "address", "uint24", "address"], [fixtures.ETHEREUM.WBTC, 500, WETH.address, 500, fixtures.ETHEREUM.USDC]), wbtcOut)];
            case 2: return [2 /*return*/, _a.sent()];
            case 3:
                e_2 = _a.sent();
                console.error(e_2);
                return [2 /*return*/, 0];
            case 4: return [2 /*return*/];
        }
    });
}); });
var computeTransferOutput = (exports.computeTransferOutput = function (_a) {
    var module = _a.module, amount = _a.amount;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _b = module;
                    switch (_b) {
                        case fixtures.ETHEREUM.USDC: return [3 /*break*/, 1];
                        case fixtures.ETHEREUM.WBTC: return [3 /*break*/, 4];
                        case fixtures.ETHEREUM.renBTC: return [3 /*break*/, 7];
                        case ethers.constants.AddressZero: return [3 /*break*/, 9];
                    }
                    return [3 /*break*/, 12];
                case 1:
                    _c = toUSDC;
                    return [4 /*yield*/, deductMintFee(applyRenVMMintFee(amount))];
                case 2: return [4 /*yield*/, _c.apply(void 0, [_f.sent()])];
                case 3: return [2 /*return*/, _f.sent()];
                case 4:
                    _d = deductMintFee;
                    return [4 /*yield*/, renCrv.get_dy(0, 1, applyRenVMMintFee(amount))];
                case 5: return [4 /*yield*/, _d.apply(void 0, [_f.sent(), 1])];
                case 6: return [2 /*return*/, _f.sent()];
                case 7: return [4 /*yield*/, deductMintFee(applyRenVMMintFee(amount))];
                case 8: return [2 /*return*/, _f.sent()];
                case 9:
                    _e = renBTCToETH;
                    return [4 /*yield*/, deductMintFee(applyRenVMMintFee(amount))];
                case 10: return [4 /*yield*/, _e.apply(void 0, [_f.sent()])];
                case 11: return [2 /*return*/, _f.sent()];
                case 12: return [2 /*return*/, ethers.BigNumber.from("0")];
            }
        });
    });
});
var renBTCFromWBTC = function (amount) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, renCrv.get_dy(1, 0, amount)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var WBTCFromRenBTC = function (amount) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, renCrv.get_dy(0, 1, amount)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var WBTCFromETH = function (amount) { return __awaiter(void 0, void 0, void 0, function () {
    var WETH, output, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                WETH = UNISWAP.WETH[UNISWAP.ChainId.MAINNET];
                return [4 /*yield*/, quoter.quoteExactInputSingle(WETH.address, fixtures.ETHEREUM.WBTC, 500, amount, 0)];
            case 1:
                output = _a.sent();
                return [4 /*yield*/, renBTCFromWBTC(output)];
            case 2:
                result = _a.sent();
                return [2 /*return*/, result];
        }
    });
}); };
var renBTCToETH = (exports.renBTCToETH = function (amount) { return __awaiter(void 0, void 0, void 0, function () {
    var wbtcOut, WETH;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, WBTCFromRenBTC(amount)];
            case 1:
                wbtcOut = _a.sent();
                WETH = UNISWAP.WETH[UNISWAP.ChainId.MAINNET];
                return [4 /*yield*/, quoter.quoteExactInputSingle(fixtures.ETHEREUM.WBTC, WETH.address, 500, wbtcOut, 0)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); });
var getConvertedAmount = (exports.getConvertedAmount = function (asset, amount) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = asset;
                switch (_a) {
                    case fixtures.ETHEREUM.WBTC: return [3 /*break*/, 1];
                    case fixtures.ETHEREUM.renBTC: return [3 /*break*/, 3];
                    case fixtures.ETHEREUM.USDC: return [3 /*break*/, 4];
                    case ethers.constants.AddressZero: return [3 /*break*/, 6];
                }
                return [3 /*break*/, 9];
            case 1: return [4 /*yield*/, renBTCFromWBTC(amount)];
            case 2: return [2 /*return*/, _c.sent()];
            case 3: return [2 /*return*/, amount];
            case 4: return [4 /*yield*/, fromUSDC(amount)];
            case 5: return [2 /*return*/, _c.sent()];
            case 6:
                _b = renBTCFromWBTC;
                return [4 /*yield*/, WBTCFromETH(amount)];
            case 7: return [4 /*yield*/, _b.apply(void 0, [_c.sent()])];
            case 8: return [2 /*return*/, _c.sent()];
            case 9:
                console.error("no asset found for getConvertedAmount:" + asset);
                return [2 /*return*/, amount];
        }
    });
}); });
var computeOutputBTC = (exports.computeOutputBTC = function (burnRequest) { return __awaiter(void 0, void 0, void 0, function () {
    var asset, amount, convertedAmount, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                asset = burnRequest.asset, amount = burnRequest.amount;
                return [4 /*yield*/, getConvertedAmount(asset, amount)];
            case 1:
                convertedAmount = _b.sent();
                _a = asset;
                switch (_a) {
                    case fixtures.ETHEREUM.WBTC: return [3 /*break*/, 2];
                    case fixtures.ETHEREUM.renBTC: return [3 /*break*/, 4];
                    case fixtures.ETHEREUM.USDC: return [3 /*break*/, 6];
                    case ethers.constants.AddressZero: return [3 /*break*/, 8];
                }
                return [3 /*break*/, 10];
            case 2: return [4 /*yield*/, deductBurnFee(applyRenVMFee(convertedAmount))];
            case 3: return [2 /*return*/, _b.sent()];
            case 4: return [4 /*yield*/, deductBurnFee(applyRenVMFee(convertedAmount))];
            case 5: return [2 /*return*/, _b.sent()];
            case 6: return [4 /*yield*/, deductBurnFee(applyRenVMFee(convertedAmount))];
            case 7: return [2 /*return*/, _b.sent()];
            case 8: return [4 /*yield*/, deductBurnFee(applyRenVMFee(convertedAmount))];
            case 9: return [2 /*return*/, _b.sent()];
            case 10:
                console.error("no asset found for computeOutputBTC:" + asset);
                return [2 /*return*/, burnRequest.amount];
        }
    });
}); });
