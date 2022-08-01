"use strict";
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.getDefaultBitcoinClient = exports.BitcoinClient = exports.fetchAverageBitcoinConfirmationTime = exports.fetchBitcoinPriceHistory = void 0;
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var helpers_1 = require("../util/helpers");
// @ts-ignore
var bitcoin_core_1 = __importDefault(require("bitcoin-core"));
var axios_1 = __importDefault(require("axios"));
var BTCHandler_1 = require("send-crypto/build/main/handlers/BTC/BTCHandler");
var fetchBitcoinPriceHistory = function (confirmationTime) { return __awaiter(void 0, void 0, void 0, function () {
    var numConfTime, oldPriceIndex, cgResponse, prices;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                numConfTime = parseFloat(confirmationTime);
                if (isNaN(numConfTime))
                    return [2 /*return*/, undefined];
                oldPriceIndex = Math.ceil(numConfTime / 5) + 1;
                return [4 /*yield*/, (0, helpers_1.fetchData)(function () {
                        return fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=.1&interval=minute');
                    })];
            case 1:
                cgResponse = _a.sent();
                prices = cgResponse ? cgResponse['prices'] : undefined;
                // Coingecko returns data in oldest -> newest format so we pull data from the end
                return [2 /*return*/, prices
                        ? {
                            currentPrice: new bignumber_js_1["default"](prices[prices.length - 1][1]),
                            oldPrice: new bignumber_js_1["default"](prices[prices.length - oldPriceIndex][1])
                        }
                        : undefined];
        }
    });
}); };
exports.fetchBitcoinPriceHistory = fetchBitcoinPriceHistory;
var fetchAverageBitcoinConfirmationTime = function () { return __awaiter(void 0, void 0, void 0, function () {
    var stats, blockLengthMinutes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, helpers_1.fetchData)(function () {
                    return fetch("https://blockchain.info/stats?format=json&cors=true");
                })];
            case 1:
                stats = _a.sent();
                blockLengthMinutes = stats ? parseFloat(stats['minutes_between_blocks']) : 60;
                return [2 /*return*/, (blockLengthMinutes * 6).toFixed(1)];
        }
    });
}); };
exports.fetchAverageBitcoinConfirmationTime = fetchAverageBitcoinConfirmationTime;
var BitcoinClient = /** @class */ (function (_super) {
    __extends(BitcoinClient, _super);
    function BitcoinClient(o) {
        var _this = _super.call(this, o) || this;
        _this.addHeaders = o.addHeaders || {};
        _this.request.$getAsync = _this.request.getAsync;
        _this.request.$postAsync = _this.request.postAsync;
        var self = _this;
        _this.request.getAsync = function (o) {
            return self.request.$getAsync.call(self.request, __assign(__assign({}, o), { headers: self.addHeaders }));
        };
        _this.request.postAsync = function (o) {
            return self.request.$postAsync.call(self.request, __assign(__assign({}, o), { headers: self.addHeaders }));
        };
        return _this;
    }
    return BitcoinClient;
}(bitcoin_core_1["default"]));
exports.BitcoinClient = BitcoinClient;
var resultToJsonRpc = function (id, fn) { return __awaiter(void 0, void 0, void 0, function () {
    var e_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = {
                    jsonrpc: '2.0',
                    id: id
                };
                return [4 /*yield*/, fn()];
            case 1: return [2 /*return*/, (_a.result = _b.sent(),
                    _a)];
            case 2:
                e_1 = _b.sent();
                return [2 /*return*/, {
                        jsonrpc: '2.0',
                        id: id,
                        error: e_1
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
var BTCBackend = /** @class */ (function () {
    function BTCBackend(options) {
        this.testnet = options.network && options.network === 'testnet';
        this.handler = BTCHandler_1.BTCHandler;
        this.name = 'btc';
        this.prefixes = ['btc'];
        this.id = 0;
    }
    BTCBackend.prototype.sendPromise = function (_a) {
        var id = _a.id, method = _a.method, params = _a.params;
        return __awaiter(this, void 0, void 0, function () {
            var _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = method;
                        switch (_b) {
                            case 'btc_getUTXOs': return [3 /*break*/, 1];
                        }
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, resultToJsonRpc(id, function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, (_a = this.handler).getUTXOs.apply(_a, __spreadArray([this.testnet], params, false))];
                                    case 1: return [2 /*return*/, _b.sent()];
                                }
                            });
                        }); })];
                    case 2: return [2 /*return*/, _c.sent()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BTCBackend.prototype.send = function (o, cb) {
        this.sendPromise(o).then(function (result) { return cb(null, result); })["catch"](function (err) { return cb(err); });
    };
    BTCBackend.prototype.sendWrapped = function (method, params) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve, reject) { return _this.send({
                            id: _this.id++,
                            method: method,
                            params: params,
                            jsonrpc: '2.0'
                        }, function (err, result) { return err ? reject(err) : resolve(result); }); })];
                    case 1:
                        response = _a.sent();
                        if (response.error)
                            throw response.error;
                        return [2 /*return*/, response.result];
                }
            });
        });
    };
    BTCBackend.prototype.listReceivedByAddress = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendWrapped('btc_getUTXOs', [{
                                confirmations: params.confirmations || 1,
                                address: params.address
                            }])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return BTCBackend;
}());
var getDefaultBitcoinClient = function () {
    var network = process.env.CHAIN;
    return new BTCBackend({ network: network });
};
exports.getDefaultBitcoinClient = getDefaultBitcoinClient;
var getSingleAddressBlockchainInfo = function (address) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, status;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, axios_1["default"].get('https://blockchain.info/rawaddr/' + address + '?cors=true')];
            case 1:
                _a = _b.sent(), data = _a.data, status = _a.status;
                if (status !== 200)
                    throw Error('status code - ' + String(status));
                return [2 /*return*/, data];
        }
    });
}); };
var getListReceivedByAddressBlockchainInfo = function (address) { return __awaiter(void 0, void 0, void 0, function () {
    var singleAddress, txs, total_received, addressResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getSingleAddressBlockchainInfo(address)];
            case 1:
                singleAddress = _a.sent();
                txs = singleAddress.txs, total_received = singleAddress.total_received, addressResult = singleAddress.address;
                return [2 /*return*/, {
                        txids: txs,
                        amount: total_received,
                        address: addressResult
                    }];
        }
    });
}); };
/*
export const getDefaultBitcoinClient = () => {
              const client = new BitcoinClient({
        network: 'mainnet',
        host: 'btccore-main.bdnodes.net',
        port: 443,
        ssl: {
            enabled: true,
            strict: true,
        },
        username: 'blockdaemon',
        password: 'blockdaemon',
        addHeaders: {
            'X-Auth-Token': 'vm9Li06gY2hCWXuPt-y9s5nEUVQpzUC6TfC7XTdgphg',
            'Content-Type': 'application/json'
        },
    });
    (client as any).listReceivedByAddress = getListReceivedByAddressBlockchainInfo;
    return client;
};
*/
/*export const getDefaultBitcoinClient = () => {
    const client = new BitcoinClient({
        network: 'mainnet',
        host: 'buupdvmqajdr42o18i2g.bdnodes.net',
        port: 443,
        ssl: {
            enabled: true,
            strict: true,
        },
        username: 'blockdaemon',
        password: 'blockdaemon',
        addHeaders: {
            'X-Auth-Token': 'EhpzhOruGOdC9wyMG5mERa5o_So4TlZfSO2yzsdjEac',
            'Content-Type': 'application/json'
        },
    });
    return client;
};
*/ 
