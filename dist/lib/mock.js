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
import { TrivialUnderwriterTransferRequest, createZeroKeeper, TransferRequest } from './zero';
import { ZeroUser } from './p2p/core';
import { ethers } from 'ethers';
import { EventEmitter } from 'events';
var keepers = [];
export var TEST_KEEPER_ADDRESS = '0x12fBc372dc2f433392CC6caB29CFBcD5082EF494';
var keeperSigner;
export var createMockKeeper = function (provider) { return __awaiter(void 0, void 0, void 0, function () {
    var keeper;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                keeper = createZeroKeeper({ on: function () { } });
                provider = provider || new ethers.providers.JsonRpcProvider('http://localhost:8545');
                keepers.push(keeper);
                if (!!keeperSigner) return [3 /*break*/, 2];
                return [4 /*yield*/, provider.send('hardhat_impersonateAccount', [TEST_KEEPER_ADDRESS])];
            case 1:
                _a.sent();
                keeperSigner = provider.getSigner(TEST_KEEPER_ADDRESS);
                _a.label = 2;
            case 2:
                keeper.advertiseAsKeeper = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/];
                }); }); };
                keeper.setTxDispatcher = function (fn) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        keeper._txDispatcher = fn;
                        return [2 /*return*/];
                    });
                }); };
                keeper.setTxDispatcher(function (transferRequest) { return __awaiter(void 0, void 0, void 0, function () {
                    var trivial, loan_result, _a, _b, _c, err_1, mint;
                    var _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                trivial = new TrivialUnderwriterTransferRequest(transferRequest);
                                _e.label = 1;
                            case 1:
                                _e.trys.push([1, 4, , 5]);
                                _b = (_a = trivial).dry;
                                _c = [keeperSigner];
                                _d = {};
                                return [4 /*yield*/, keeperSigner.getAddress()];
                            case 2: return [4 /*yield*/, _b.apply(_a, _c.concat([(_d.from = _e.sent(), _d)]))];
                            case 3:
                                loan_result = _e.sent();
                                console.log('Loan Result', loan_result);
                                return [3 /*break*/, 5];
                            case 4:
                                err_1 = _e.sent();
                                console.log('ERROR', err_1);
                                return [3 /*break*/, 5];
                            case 5: return [4 /*yield*/, trivial.submitToRenVM(true)];
                            case 6:
                                mint = _e.sent();
                                return [4 /*yield*/, new Promise(function (resolve, reject) {
                                        return mint.on('deposit', function (deposit) { return __awaiter(void 0, void 0, void 0, function () {
                                            var hash, _a, _b, confirmed, status;
                                            return __generator(this, function (_c) {
                                                switch (_c.label) {
                                                    case 0: return [4 /*yield*/, resolve(deposit)];
                                                    case 1:
                                                        _c.sent();
                                                        return [4 /*yield*/, deposit.txHash()];
                                                    case 2:
                                                        hash = _c.sent();
                                                        console.log('hash', hash);
                                                        _b = (_a = console).log;
                                                        return [4 /*yield*/, deposit];
                                                    case 3:
                                                        _b.apply(_a, [_c.sent()]);
                                                        return [4 /*yield*/, deposit.confirmed()];
                                                    case 4:
                                                        confirmed = _c.sent();
                                                        confirmed
                                                            .on('target', function (target) {
                                                            console.log("0/" + target + " confirmations");
                                                        })
                                                            .on('deposit', function (confs, target) { return __awaiter(void 0, void 0, void 0, function () {
                                                            return __generator(this, function (_a) {
                                                                switch (_a.label) {
                                                                    case 0:
                                                                        console.log(confs + "/" + target + " confirmations");
                                                                        if (!(confs == 6)) return [3 /*break*/, 2];
                                                                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                                                                setTimeout(resolve, 3000);
                                                                            })];
                                                                    case 1:
                                                                        _a.sent();
                                                                        _a.label = 2;
                                                                    case 2: return [2 /*return*/];
                                                                }
                                                            });
                                                        }); });
                                                        return [4 /*yield*/, deposit.signed()];
                                                    case 5:
                                                        status = _c.sent();
                                                        status.on('status', function (status) { return console.log('status', status); });
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); });
                                    })];
                            case 7:
                                _e.sent();
                                trivial.waitForSignature = function () { return __awaiter(void 0, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/, {
                                                        amount: ethers.BigNumber.from(trivial.amount).sub(ethers.utils.parseUnits('0.0015', 8)).toString(),
                                                        nHash: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
                                                        signature: ethers.utils.hexlify(ethers.utils.randomBytes(65)),
                                                    }];
                                        }
                                    });
                                }); };
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); };
export var enableGlobalMockRuntime = function () {
    ZeroUser.prototype.subscribeKeepers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.keepers.includes(TEST_KEEPER_ADDRESS)) {
                    setTimeout(function () {
                        this.keepers.push(TEST_KEEPER_ADDRESS);
                        this.emit('keeper', TEST_KEEPER_ADDRESS);
                    }, 500);
                }
                return [2 /*return*/];
            });
        });
    };
    TransferRequest.prototype.submitToRenVM = function (flag) {
        return __awaiter(this, void 0, void 0, function () {
            var confirmed, gatewayAddress, _signed, target, timeout, txHash, mint, deposit;
            var _this = this;
            return __generator(this, function (_a) {
                confirmed = new EventEmitter();
                gatewayAddress = '39WeCoGbNNk5gVNPx9j4mSrw3tvf1WfRz7';
                confirmed.on('deposit', function (count) {
                    if (count === target)
                        _signed = true;
                });
                target = 6;
                timeout = function (n) { return new Promise(function (resolve) { return setTimeout(resolve, n); }); };
                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                    var i;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                confirmed.emit('target', target);
                                confirmed.emit('deposit', 0);
                                i = 1;
                                _a.label = 1;
                            case 1:
                                if (!(i <= 6)) return [3 /*break*/, 4];
                                return [4 /*yield*/, timeout(2000)];
                            case 2:
                                _a.sent();
                                confirmed.emit('deposit', i, target);
                                _a.label = 3;
                            case 3:
                                i++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); }, 100);
                txHash = ethers.utils.randomBytes(32).toString('base64');
                mint = new EventEmitter();
                deposit = {
                    txHash: function () {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, txHash];
                            });
                        });
                    },
                    confirmed: function () {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, confirmed];
                            });
                        });
                    },
                    signed: function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var ee;
                            var _this = this;
                            return __generator(this, function (_a) {
                                ee = new EventEmitter();
                                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var result;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, new Promise(function (resolve) {
                                                    if (_signed)
                                                        return resolve('signed');
                                                    confirmed.on('deposit', function (count) {
                                                        if (count === target)
                                                            resolve('signed');
                                                    });
                                                })];
                                            case 1:
                                                result = _a.sent();
                                                ee.emit('status', result);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }, 100);
                                return [2 /*return*/, ee];
                            });
                        });
                    },
                };
                setTimeout(function () {
                    mint.emit('deposit', deposit);
                }, 50);
                mint.gatewayAddress = gatewayAddress;
                return [2 /*return*/, mint];
            });
        });
    };
    ZeroUser.prototype.publishTransferRequest = function (transferRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                setTimeout(function () {
                    (function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            try {
                                Promise.all(keepers.map(function (v) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    return [2 /*return*/, v._txDispatcher && v._txDispatcher(transferRequest)];
                                }); }); })).catch(console.error);
                            }
                            catch (e) {
                                console.error(e);
                            }
                            return [2 /*return*/];
                        });
                    }); })();
                }, 3000);
                return [2 /*return*/];
            });
        });
    };
};
