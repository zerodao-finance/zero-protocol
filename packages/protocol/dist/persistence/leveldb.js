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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.LevelDBPersistenceAdapter = void 0;
require("../types");
var ethers_1 = require("ethers");
require("./types");
require("path");
var memdown_1 = __importDefault(require("memdown"));
var level = require('level');
var levelup = require('levelup');
var getValue = function (level, key) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                    return level.get(key, function (err, result) {
                        if (err) {
                            if (err.notFound)
                                return resolve(null);
                            else
                                return reject(err);
                        }
                        else
                            resolve(result);
                    });
                })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var setValue = function (level, key, value) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, new Promise(function (resolve, reject) { return level.put(key, value, function (err) { return (err ? reject(err) : resolve()); }); })];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
var delValue = function (level, key) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, new Promise(function (resolve, reject) { return level.del(key, function (err) { return (err ? reject(err) : resolve()); }); })];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
var toKey = function (key) { return 'request:' + key; };
var toIndexKey = function (key) { return 'index:' + key; };
var toKeyFromIndexKey = function (index) { return 'key: ' + index; };
var requestToKey = function (request) { return ethers_1.ethers.utils.solidityKeccak256(['bytes'], [request.signature]); };
var requestToPlain = function (request) {
    var to = request.to, underwriter = request.underwriter, contractAddress = request.contractAddress, nonce = request.nonce, pNonce = request.pNonce, data = request.data, module = request.module, amount = request.amount, asset = request.asset, status = request.status, signature = request.signature, chainId = request.chainId, _destination = request._destination, addressFrom = request.addressFrom, requestType = request.requestType;
    return {
        to: to,
        chainId: chainId,
        underwriter: underwriter,
        contractAddress: contractAddress,
        nonce: nonce,
        pNonce: pNonce,
        data: data,
        module: module,
        amount: amount,
        status: status,
        asset: asset,
        signature: signature,
        _destination: _destination,
        addressFrom: addressFrom,
        requestType: requestType
    };
};
var LevelDBPersistenceAdapter = /** @class */ (function () {
    function LevelDBPersistenceAdapter() {
        var db = process.env.ZERO_PERSISTENCE_DB;
        if (db === '::memory')
            this.backend = levelup((0, memdown_1["default"])("./"));
        else
            this.backend = level(db);
    }
    LevelDBPersistenceAdapter.prototype.length = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = Number;
                        return [4 /*yield*/, getValue(this.backend, 'length')];
                    case 1: return [2 /*return*/, _a.apply(void 0, [(_b.sent()) || 0])];
                }
            });
        });
    };
    LevelDBPersistenceAdapter.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, getValue(this.backend, toKey(key))];
                    case 1: return [2 /*return*/, _b.apply(_a, [(_c.sent()) || '0']) || null];
                }
            });
        });
    };
    LevelDBPersistenceAdapter.prototype.getIndex = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = Number;
                        return [4 /*yield*/, getValue(this.backend, toIndexKey(key))];
                    case 1: return [2 /*return*/, _a.apply(void 0, [(_b.sent()) || -1])];
                }
            });
        });
    };
    LevelDBPersistenceAdapter.prototype.getKeyFromIndex = function (index) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getValue(this.backend, toKeyFromIndexKey(index))];
                    case 1: return [2 /*return*/, (_a.sent()) || null];
                }
            });
        });
    };
    LevelDBPersistenceAdapter.prototype.set = function (transferRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var key, index;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = requestToKey(transferRequest);
                        return [4 /*yield*/, this.getIndex(key)];
                    case 1:
                        index = _a.sent();
                        if (!!~index) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.length()];
                    case 2:
                        index = _a.sent();
                        return [4 /*yield*/, setValue(this.backend, 'length', String(index + 1))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, setValue(this.backend, toIndexKey(key), String(index))];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, setValue(this.backend, toKeyFromIndexKey(index), key)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, setValue(this.backend, toKey(key), JSON.stringify(requestToPlain(transferRequest)))];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, key];
                }
            });
        });
    };
    LevelDBPersistenceAdapter.prototype.remove = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var index;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getIndex(key)];
                    case 1:
                        index = _a.sent();
                        if (!~index)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, delValue(this.backend, toKey(key))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    LevelDBPersistenceAdapter.prototype.has = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = Boolean;
                        return [4 /*yield*/, this.get(key)];
                    case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    LevelDBPersistenceAdapter.prototype.getStatus = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var transferRequest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(key)];
                    case 1:
                        transferRequest = _a.sent();
                        if (!transferRequest)
                            return [2 /*return*/, 'pending'];
                        return [2 /*return*/, transferRequest.status || 'pending'];
                }
            });
        });
    };
    LevelDBPersistenceAdapter.prototype.setStatus = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var transferRequest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(key)];
                    case 1:
                        transferRequest = _a.sent();
                        transferRequest.status = value;
                        return [4 /*yield*/, this.set(transferRequest)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LevelDBPersistenceAdapter.prototype.getAllRequests = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var length, result, i, key, request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.length()];
                    case 1:
                        length = _a.sent();
                        result = [];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < length)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getKeyFromIndex(i)];
                    case 3:
                        key = _a.sent();
                        return [4 /*yield*/, this.get(key)];
                    case 4:
                        request = (_a.sent());
                        request.status = request.status || 'pending';
                        if (request && (!filter || request.requestType === filter)) {
                            result.push(request);
                        }
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/, result];
                }
            });
        });
    };
    LevelDBPersistenceAdapter.prototype.getAllTransferRequests = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAllRequests("transfer")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    LevelDBPersistenceAdapter.prototype.getAllBurnRequests = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAllRequests("burn")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return LevelDBPersistenceAdapter;
}());
exports.LevelDBPersistenceAdapter = LevelDBPersistenceAdapter;
