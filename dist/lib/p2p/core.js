'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.ZeroConnection = exports.ZeroUser = exports.ZeroKeeper = void 0;
var index_1 = __importDefault(require("libp2p/src/index")); // @ts-ignore
require("path");
var logger_1 = __importDefault(require("../logger"));
//import { MockZeroConnection } from './mocks';
var util_1 = require("./util");
var it_pipe_1 = __importDefault(require("it-pipe"));
var it_length_prefixed_1 = __importDefault(require("it-length-prefixed"));
require("./types");
require("../types");
var persistence_1 = require("../persistence");
require("buffer");
var peerId = require("peer-id");
require("peer-info");
var events_1 = require("events");
var ZeroConnection = /** @class */ (function (_super) {
    __extends(ZeroConnection, _super);
    function ZeroConnection() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ZeroConnection;
}(index_1["default"]));
exports.ZeroConnection = ZeroConnection;
var ZeroUser = /** @class */ (function (_super) {
    __extends(ZeroUser, _super);
    function ZeroUser(connection, persistence) {
        var _this = _super.call(this) || this;
        _this.conn = connection;
        _this.conn.on('peer:discovery', function () { return console.log('discovered!'); });
        _this.keepers = [];
        _this.log = (0, logger_1["default"])('zero.user');
        _this.storage = persistence !== null && persistence !== void 0 ? persistence : new persistence_1.InMemoryPersistenceAdapter();
        return _this;
    }
    ZeroUser.prototype.subscribeKeepers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.conn.pubsub.on('zero.keepers', function (message) { return __awaiter(_this, void 0, void 0, function () {
                    var data, from, address;
                    return __generator(this, function (_a) {
                        data = message.data, from = message.from;
                        address = (0, util_1.fromBufferToJSON)(data).address;
                        if (!this.keepers.includes(from)) {
                            try {
                                this.keepers.push(from);
                                this.emit('keeper', from);
                                this.log.debug("Keeper Details: ", {
                                    from: from
                                });
                                this.log.info("Found keeper: " + from + " with address " + address);
                            }
                            catch (e) {
                                this.log.error("Timed out finding keeper: " + from);
                                this.log.debug(e.message);
                            }
                        }
                        return [2 /*return*/];
                    });
                }); });
                this.conn.pubsub.subscribe('zero.keepers');
                this.log.info('Subscribed to keeper broadcasts');
                return [2 /*return*/];
            });
        });
    };
    ZeroUser.prototype.unsubscribeKeepers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log.debug('Keepers before unsubscription', this.keepers);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.conn.pubsub.unsubscribe('zero.keepers')];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        this.log.error('Could not unsubscribe to keeper broadcasts');
                        this.log.debug(e_1.message);
                        return [3 /*break*/, 4];
                    case 4:
                        this.log.info('Unsubscribed to keeper broadcasts');
                        this.keepers = [];
                        return [2 /*return*/];
                }
            });
        });
    };
    ZeroUser.prototype.publishRequest = function (request, requestTemplate, requestType) {
        if (requestType === void 0) { requestType = 'transfer'; }
        return __awaiter(this, void 0, void 0, function () {
            var requestFromTemplate, key, ackReceived_1, _i, _a, keeper, peer, stream, e_2, e_3;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        requestFromTemplate = requestTemplate
                            ? Object.fromEntries(Object.entries(request).filter(function (_a) {
                                var k = _a[0], v = _a[1];
                                return requestTemplate.includes(k);
                            }))
                            : request;
                        return [4 /*yield*/, this.storage.set(requestFromTemplate)];
                    case 1:
                        key = _b.sent();
                        if (this.keepers.length === 0) {
                            this.log.error("Cannot publish " + requestType + " request if no keepers are found");
                            return [2 /*return*/];
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 13, , 14]);
                        ackReceived_1 = false;
                        // should add handler for rejection
                        return [4 /*yield*/, this.conn.handle('/zero/user/confirmation', function (_a) {
                                var stream = _a.stream;
                                return __awaiter(_this, void 0, void 0, function () {
                                    var _this = this;
                                    return __generator(this, function (_b) {
                                        (0, it_pipe_1["default"])(stream.source, it_length_prefixed_1["default"].decode(), function (rawData) { var rawData_1, rawData_1_1; return __awaiter(_this, void 0, void 0, function () {
                                            var string, msg, e_4_1, txConfirmation;
                                            var e_4, _a;
                                            return __generator(this, function (_b) {
                                                switch (_b.label) {
                                                    case 0:
                                                        string = [];
                                                        _b.label = 1;
                                                    case 1:
                                                        _b.trys.push([1, 6, 7, 12]);
                                                        rawData_1 = __asyncValues(rawData);
                                                        _b.label = 2;
                                                    case 2: return [4 /*yield*/, rawData_1.next()];
                                                    case 3:
                                                        if (!(rawData_1_1 = _b.sent(), !rawData_1_1.done)) return [3 /*break*/, 5];
                                                        msg = rawData_1_1.value;
                                                        string.push(msg.toString());
                                                        _b.label = 4;
                                                    case 4: return [3 /*break*/, 2];
                                                    case 5: return [3 /*break*/, 12];
                                                    case 6:
                                                        e_4_1 = _b.sent();
                                                        e_4 = { error: e_4_1 };
                                                        return [3 /*break*/, 12];
                                                    case 7:
                                                        _b.trys.push([7, , 10, 11]);
                                                        if (!(rawData_1_1 && !rawData_1_1.done && (_a = rawData_1["return"]))) return [3 /*break*/, 9];
                                                        return [4 /*yield*/, _a.call(rawData_1)];
                                                    case 8:
                                                        _b.sent();
                                                        _b.label = 9;
                                                    case 9: return [3 /*break*/, 11];
                                                    case 10:
                                                        if (e_4) throw e_4.error;
                                                        return [7 /*endfinally*/];
                                                    case 11: return [7 /*endfinally*/];
                                                    case 12:
                                                        txConfirmation = JSON.parse(string.join('')).txConfirmation;
                                                        return [4 /*yield*/, this.storage.setStatus(key, 'succeeded')];
                                                    case 13:
                                                        _b.sent();
                                                        ackReceived_1 = true;
                                                        this.log.info("txDispatch confirmed: " + txConfirmation);
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); });
                                        return [2 /*return*/];
                                    });
                                });
                            })];
                    case 3:
                        // should add handler for rejection
                        _b.sent();
                        _i = 0, _a = this.keepers;
                        _b.label = 4;
                    case 4:
                        if (!(_i < _a.length)) return [3 /*break*/, 12];
                        keeper = _a[_i];
                        if (!(ackReceived_1 !== true)) return [3 /*break*/, 10];
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 8, , 9]);
                        return [4 /*yield*/, peerId.createFromB58String(keeper)];
                    case 6:
                        peer = _b.sent();
                        return [4 /*yield*/, this.conn.dialProtocol(peer, '/zero/keeper/dispatch')];
                    case 7:
                        stream = (_b.sent()).stream;
                        (0, it_pipe_1["default"])(JSON.stringify(requestFromTemplate), it_length_prefixed_1["default"].encode(), stream.sink);
                        this.log.info("Published transfer request to " + keeper + ". Waiting for keeper confirmation.");
                        return [3 /*break*/, 9];
                    case 8:
                        e_2 = _b.sent();
                        this.log.error("Failed dialing keeper: " + keeper + " for txDispatch");
                        this.log.error(e_2.stack);
                        return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 11];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        _i++;
                        return [3 /*break*/, 4];
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        e_3 = _b.sent();
                        this.log.error('Could not publish transfer request');
                        this.log.debug(e_3.message);
                        return [2 /*return*/];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    ZeroUser.prototype.publishBurnRequest = function (burnRequest) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.publishRequest(burnRequest, [
                            'asset',
                            'chainId',
                            'contractAddress',
                            'data',
                            'module',
                            'nonce',
                            'pNonce',
                            'signature',
                            'underwriter',
                            'owner',
                            'amount',
                            'deadline',
                            'requestType',
                        ], 'burn')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ZeroUser.prototype.publishMetaRequest = function (metaRequest) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.publishRequest(metaRequest, [
                            'asset',
                            'chainId',
                            'contractAddress',
                            'data',
                            'module',
                            'nonce',
                            'pNonce',
                            'signature',
                            'underwriter',
                            'addressFrom',
                            'requestType',
                        ], 'meta')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ZeroUser.prototype.publishTransferRequest = function (transferRequest) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.publishRequest(transferRequest, [
                            'amount',
                            'asset',
                            'chainId',
                            'contractAddress',
                            'data',
                            'module',
                            'nonce',
                            'pNonce',
                            'signature',
                            'to',
                            'underwriter',
                            'requestType',
                        ])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return ZeroUser;
}(events_1.EventEmitter));
exports.ZeroUser = ZeroUser;
var ZeroKeeper = /** @class */ (function () {
    function ZeroKeeper(connection, persistence) {
        this.conn = connection;
        this.conn.on('peer:discovery', function () { return console.log('discovered from keeper!'); });
        this.dispatches = [];
        this.log = (0, logger_1["default"])('zero.keeper');
        this.storage = persistence !== null && persistence !== void 0 ? persistence : new persistence_1.InMemoryPersistenceAdapter();
    }
    ZeroKeeper.prototype.setPersistence = function (adapter) {
        this.storage = adapter;
    };
    ZeroKeeper.prototype.advertiseAsKeeper = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.active = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                    var e_5;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, this.conn.pubsub.publish('zero.keepers', (0, util_1.fromJSONtoBuffer)({
                                        address: address
                                    }))];
                            case 1:
                                _a.sent();
                                this.log.debug("Made presence known " + this.conn.peerId.toB58String());
                                return [3 /*break*/, 3];
                            case 2:
                                e_5 = _a.sent();
                                console.debug(e_5);
                                this.log.info('Could not make presence known. Retrying in 1s');
                                this.log.debug(e_5.message);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); }, 1000);
                this.log.info('Started to listen for tx dispatch requests');
                return [2 /*return*/];
            });
        });
    };
    ZeroKeeper.prototype.setTxDispatcher = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var handler;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        handler = function (duplex) { return __awaiter(_this, void 0, void 0, function () {
                            var stream;
                            var _this = this;
                            return __generator(this, function (_a) {
                                stream = duplex.stream;
                                (0, it_pipe_1["default"])(stream.source, it_length_prefixed_1["default"].decode(), function (rawData) { var rawData_2, rawData_2_1; return __awaiter(_this, void 0, void 0, function () {
                                    var string, msg, e_6_1, transferRequest;
                                    var e_6, _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                string = [];
                                                _b.label = 1;
                                            case 1:
                                                _b.trys.push([1, 6, 7, 12]);
                                                rawData_2 = __asyncValues(rawData);
                                                _b.label = 2;
                                            case 2: return [4 /*yield*/, rawData_2.next()];
                                            case 3:
                                                if (!(rawData_2_1 = _b.sent(), !rawData_2_1.done)) return [3 /*break*/, 5];
                                                msg = rawData_2_1.value;
                                                string.push(msg.toString());
                                                _b.label = 4;
                                            case 4: return [3 /*break*/, 2];
                                            case 5: return [3 /*break*/, 12];
                                            case 6:
                                                e_6_1 = _b.sent();
                                                e_6 = { error: e_6_1 };
                                                return [3 /*break*/, 12];
                                            case 7:
                                                _b.trys.push([7, , 10, 11]);
                                                if (!(rawData_2_1 && !rawData_2_1.done && (_a = rawData_2["return"]))) return [3 /*break*/, 9];
                                                return [4 /*yield*/, _a.call(rawData_2)];
                                            case 8:
                                                _b.sent();
                                                _b.label = 9;
                                            case 9: return [3 /*break*/, 11];
                                            case 10:
                                                if (e_6) throw e_6.error;
                                                return [7 /*endfinally*/];
                                            case 11: return [7 /*endfinally*/];
                                            case 12:
                                                transferRequest = JSON.parse(string.join(''));
                                                return [4 /*yield*/, (this.storage || {
                                                        set: function () {
                                                            return __awaiter(this, void 0, void 0, function () {
                                                                return __generator(this, function (_a) {
                                                                    return [2 /*return*/, 0];
                                                                });
                                                            });
                                                        }
                                                    }).set(transferRequest)];
                                            case 13:
                                                _b.sent();
                                                callback(transferRequest);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                                return [2 /*return*/];
                            });
                        }); };
                        return [4 /*yield*/, this.conn.handle('/zero/keeper/dispatch', handler)];
                    case 1:
                        _a.sent();
                        this.log.info('Set the tx dispatcher');
                        return [2 /*return*/];
                }
            });
        });
    };
    ZeroKeeper.prototype.destroy = function () {
        clearTimeout(this.active);
    };
    return ZeroKeeper;
}());
exports.ZeroKeeper = ZeroKeeper;
