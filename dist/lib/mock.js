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
exports.__esModule = true;
exports.enableGlobalMockRuntime = exports.createMockKeeper = exports.TEST_KEEPER_ADDRESS = void 0;
var zero_1 = require("./zero");
var core_1 = require("./p2p/core");
var ethers_1 = require("ethers");
var events_1 = require("events");
var UnderwriterRequest_1 = require("./UnderwriterRequest");
var keepers = [];
exports.TEST_KEEPER_ADDRESS = '0xec5d65739c722a46cd79951e069753c2fc879b27';
var keeperSigner;
function waitForMint(trivial) {
    return __awaiter(this, void 0, void 0, function () {
        var mint;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, trivial.submitToRenVM(true)];
                case 1:
                    mint = _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            return mint.on('deposit', function (deposit) { return __awaiter(_this, void 0, void 0, function () {
                                var hash, _a, _b, confirmed, status;
                                var _this = this;
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
                                                .on('confirmation', function (confs, target) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            console.log(confs + "/" + target + " confirmations");
                                                            if (!(confs == 6)) return [3 /*break*/, 3];
                                                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                                                    setTimeout(resolve, 500);
                                                                })];
                                                        case 1:
                                                            _a.sent();
                                                            return [4 /*yield*/, trivial.repay(keeperSigner)];
                                                        case 2:
                                                            _a.sent();
                                                            _a.label = 3;
                                                        case 3: return [2 /*return*/];
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
                case 2:
                    _a.sent();
                    return [2 /*return*/, mint];
            }
        });
    });
}
var createMockKeeper = function (provider) { return __awaiter(void 0, void 0, void 0, function () {
    var keeper;
    return __generator(this, function (_a) {
        keeper = zero_1.createZeroKeeper({ on: function () { } });
        provider = provider || new ethers_1.ethers.providers.JsonRpcProvider('http://localhost:8545');
        keeperSigner = keeperSigner || provider.getSigner(exports.TEST_KEEPER_ADDRESS);
        console.log(keepers.length);
        keepers.push(keeper);
        keeper.advertiseAsKeeper = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); };
        keeper.setTxDispatcher = function (fn) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                keeper._txDispatcher = fn;
                return [2 /*return*/];
            });
        }); };
        keeper.setTxDispatcher(function (request, requestType) {
            if (requestType === void 0) { requestType = 'TRANSFER'; }
            return __awaiter(void 0, void 0, void 0, function () {
                var _a, trivial, func, loan_result, err_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = (function () {
                                console.log('requestType', requestType);
                                switch (requestType) {
                                    case 'META':
                                        return {
                                            trivial: new UnderwriterRequest_1.UnderwriterMetaRequest(request),
                                            func: 'meta'
                                        };
                                    case 'BURN':
                                        return {
                                            trivial: new UnderwriterRequest_1.UnderwriterBurnRequest(request),
                                            func: 'burn'
                                        };
                                    default:
                                        return {
                                            trivial: new zero_1.UnderwriterTransferRequest(request),
                                            func: 'loan'
                                        };
                                }
                            })(), trivial = _a.trivial, func = _a.func;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            console.log('dry');
                            return [4 /*yield*/, trivial.dry(keeperSigner)];
                        case 2:
                            loan_result = _b.sent();
                            console.log('Loan Result', loan_result);
                            return [3 /*break*/, 4];
                        case 3:
                            err_1 = _b.sent();
                            console.log('ERROR', err_1);
                            return [3 /*break*/, 4];
                        case 4:
                            if (!(requestType == 'TRANSFER')) return [3 /*break*/, 6];
                            return [4 /*yield*/, waitForMint(trivial)];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6:
                            console.log(trivial[func], trivial, func);
                            return [4 /*yield*/, trivial[func](keeperSigner)];
                        case 7:
                            _b.sent();
                            trivial.waitForSignature = function () { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/, {
                                                    amount: requestType == 'TRANSFER' &&
                                                        //@ts-ignore
                                                        ethers_1.ethers.BigNumber.from(trivial.amount).sub(ethers_1.ethers.utils.parseUnits('0.0015', 8)).toString(),
                                                    nHash: ethers_1.ethers.utils.hexlify(ethers_1.ethers.utils.randomBytes(32)),
                                                    signature: ethers_1.ethers.utils.hexlify(ethers_1.ethers.utils.randomBytes(65))
                                                }];
                                    }
                                });
                            }); };
                            return [2 /*return*/];
                    }
                });
            });
        });
        return [2 /*return*/];
    });
}); };
exports.createMockKeeper = createMockKeeper;
var enableGlobalMockRuntime = function () {
    core_1.ZeroUser.prototype.subscribeKeepers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var me;
            return __generator(this, function (_a) {
                me = this;
                if (!this.keepers.includes(exports.TEST_KEEPER_ADDRESS)) {
                    setTimeout(function () {
                        me.keepers.push(exports.TEST_KEEPER_ADDRESS);
                        me.emit('keeper', exports.TEST_KEEPER_ADDRESS);
                    }, 500);
                }
                return [2 /*return*/];
            });
        });
    };
    core_1.ZeroUser.prototype.publishTransferRequest = function (transferRequest) {
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
                                }); }); }))["catch"](console.error);
                            }
                            catch (e) {
                                console.error(e);
                            }
                            return [2 /*return*/];
                        });
                    }); })();
                }, 500);
                return [2 /*return*/];
            });
        });
    };
    core_1.ZeroUser.prototype.publishMetaRequest = function (metaRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all(keepers.map(function (v) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!v._txDispatcher) return [3 /*break*/, 2];
                                            return [4 /*yield*/, v._txDispatcher(metaRequest, 'META')];
                                        case 1: return [2 /*return*/, _a.sent()];
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); }))["catch"](console.error)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        console.error(e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    core_1.ZeroUser.prototype.publishBurnRequest = function (burnRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var e_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log(keepers.length);
                        return [4 /*yield*/, Promise.all(keepers.map(function (v) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!v._txDispatcher) return [3 /*break*/, 2];
                                            return [4 /*yield*/, v._txDispatcher(burnRequest, 'BURN')];
                                        case 1: return [2 /*return*/, _a.sent()];
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); }))["catch"](console.error)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        console.error(e_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    zero_1.UnderwriterTransferRequest.prototype.submitToRenVM = function (flag) {
        return __awaiter(this, void 0, void 0, function () {
            var confirmed, gatewayAddress, _signed, target, timeout, txHash, mint, deposit;
            var _this = this;
            return __generator(this, function (_a) {
                confirmed = new events_1.EventEmitter();
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
                                confirmed.emit('confirmation', 0);
                                i = 1;
                                _a.label = 1;
                            case 1:
                                if (!(i <= 6)) return [3 /*break*/, 4];
                                return [4 /*yield*/, timeout(2000)];
                            case 2:
                                _a.sent();
                                confirmed.emit('confirmation', i, target);
                                _a.label = 3;
                            case 3:
                                i++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); }, 100);
                txHash = ethers_1.ethers.utils.randomBytes(32).toString('base64');
                mint = new events_1.EventEmitter();
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
                                ee = new events_1.EventEmitter();
                                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var result;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, new Promise(function (resolve) {
                                                    if (_signed)
                                                        return resolve('signed');
                                                    confirmed.on('confirmation', function (count) {
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
                    }
                };
                setTimeout(function () {
                    mint.emit('deposit', deposit);
                }, 5000);
                mint.gatewayAddress = gatewayAddress;
                return [2 /*return*/, mint];
            });
        });
    };
    /*
      (ReleaseRequest as any).prototype.submitReleaseRequest = async function (flag) {
          // TODO implement confirmed event listener
          const _confirm = new EventEmitter();
          const target = 6
          const timeout = (n) => new Promise((resolve) => setTimeout(resolve, n))
          const txHash = (ethers.utils.randomBytes(32).toString as any)('base64');
  
          setTimeout(async () => {
              _confirm.emit("target", target)
              _confirm.emit("confirmation", 0)
              _confirm.emit("transactionHash", txHash)
  
              for (let i = 1; 1 <= target; i++) {
                  await timeout(500);
                  _confirm.emit('confirmation', i, target);
              }
          }, 3000)
  
          const _burnAndRelease = {
              async burn(){
                  return _confirm
              },
  
              async release(){
                  const _release = new EventEmitter();
                  _confirm.on("confirmation", (confs, target) => {
                      setTimeout(async () => {
                          const result = await new Promise((resolve) => {
                              if (confs === target) resolve("done")
                              if (confs > 0) resolve("confirming")
                              else resolve("pending")
                          })
                          _release.emit("status", result)
                      }, 100)
                  })
                  _confirm.on("transactionHash", (txHash) => {
                      setTimeout(async () => {
                          _release.emit("txHash", txHash)
                      }, 100)
                  })
                  return _release
              }
          }
  
          return _burnAndRelease
      }
  
      (ReleaseRequest as any).prototype.sign = async function () {
          this.signature = ethers.utils.hexlify(ethers.utils.randomBytes(65))
          return this.signature
      }
  
  
      (ZeroUser as any).prototype.publishReleaseRequest = async function (_releaseRequest) {
          setTimeout(() => {
              (async () => {
                  try {
                      Promise.all(keepers.map(async (v) => v._txDispatch && v._txDispatcher(_releaseRequest))).catch(
                          console.error
                      )
                  } catch (e) {
                      console.error(e)
                  }
              })();
          }, 500)
      }
  
  
      ZeroUser.prototype.publishTransferRequest = async function (transferRequest) {
          setTimeout(() => {
              (async () => {
                  try {
                      Promise.all(keepers.map(async (v) => v._txDispatcher && v._txDispatcher(transferRequest))).catch(
                          console.error,
                      );
                  } catch (e) {
                      console.error(e);
                  }
              })();
          }, 3000);
      };
   */
};
exports.enableGlobalMockRuntime = enableGlobalMockRuntime;
