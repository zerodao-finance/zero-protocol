"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.BurnRequest = void 0;
require("@ethersproject/wallet");
require("@ethersproject/abstract-signer");
var bytes_1 = require("@ethersproject/bytes");
var random_1 = require("@ethersproject/random");
require("@ethersproject/hash");
require("./types");
require("@ethersproject/transactions");
require("@ethersproject/basex");
require("buffer");
var ethers_1 = require("ethers");
var utils_1 = require("@0x/utils");
require("@0x/types");
var chains_1 = require("@renproject/chains");
var ren_1 = __importDefault(require("@renproject/ren"));
require("@renproject/interfaces");
var deployment_utils_1 = require("./deployment-utils");
var fixtures_1 = __importDefault(require("./fixtures"));
// @ts-ignore
var BTCHandler_1 = require("send-crypto/build/main/handlers/BTC/BTCHandler");
var bech32 = __importStar(require("bech32"));
var constants_1 = require("./config/constants");
/**
 * Supposed to provide a way to execute other functions while using renBTC to pay for the gas fees
 * what a flow to test would look like:
 * -> underwriter sends request to perform some operation on some contract somewhere
 * -> check if renBTC amount is debited correctly
 */
var BurnRequest = /** @class */ (function () {
    function BurnRequest(params) {
        this.requestType = 'burn';
        this.destination = params.destination;
        this._destination = params.destination;
        this.owner = params.owner;
        this.underwriter = params.underwriter;
        this.asset = params.asset;
        console.log('params.nonce', params.nonce);
        this.nonce = params.nonce ? (0, bytes_1.hexlify)(params.nonce) : (0, bytes_1.hexlify)((0, random_1.randomBytes)(32));
        this.pNonce = params.pNonce ? (0, bytes_1.hexlify)(params.pNonce) : (0, bytes_1.hexlify)((0, random_1.randomBytes)(32));
        this.chainId = params.chainId;
        this.amount = params.amount;
        this.deadline = params.deadline;
        this.contractAddress = params.contractAddress;
        this.signature = params.signature;
        //this._config =
        //
        this.gatewayIface = new ethers_1.ethers.utils.Interface([
            'event LogBurn(bytes _to, uint256 _amount, uint256 indexed _n, bytes indexed _indexedTo)',
        ]);
        this._ren = new ren_1["default"]('mainnet', { loadCompletedDeposits: true });
        this._contractFn = 'burn';
        //TODO: figure out exactly what values go in here
        this._contractParams = [
            {
                name: '_to',
                type: 'bytes',
                value: this.destination
            },
            {
                name: 'amount',
                type: 'uint256',
                value: this.amount
            },
        ];
    }
    BurnRequest.prototype.setProvider = function (provider) {
        this.provider = provider;
        return this;
    };
    BurnRequest.prototype.submitToRenVM = function (isTest) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('submitToRenVM');
                        console.log(this);
                        if (this._burn)
                            return [2 /*return*/, this._burn];
                        _a = this;
                        return [4 /*yield*/, this._ren.burnAndRelease({
                                asset: 'BTC',
                                to: (0, chains_1.Bitcoin)().Address(this.destination),
                                from: (0, deployment_utils_1.getProvider)(this).Contract(function (btcAddress) { return ({
                                    sendTo: _this.contractAddress,
                                    contractFn: _this._contractFn,
                                    contractParams: _this._contractParams
                                }); })
                            })];
                    case 1:
                        result = (_a._burn = _b.sent());
                        //    result.params.nonce = this.nonce;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    BurnRequest.prototype.waitForTxNonce = function (burn) {
        return __awaiter(this, void 0, void 0, function () {
            var burnt, tx, parsed;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._queryTxResult)
                            return [2 /*return*/, this._queryTxResult];
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                burn.on('transactionHash', resolve);
                                burn.on('error', reject);
                            })];
                    case 1:
                        burnt = _a.sent();
                        return [4 /*yield*/, this.provider.waitForTransaction(burnt)];
                    case 2:
                        tx = _a.sent();
                        parsed = tx.logs.reduce(function (v, d) {
                            if (v)
                                return v;
                            try {
                                return _this.gatewayIface.parseLog(d);
                            }
                            catch (e) { }
                        }, null);
                        this.nonce = parsed._n;
                        this._queryTxResult = parsed;
                        return [2 /*return*/, parsed];
                }
            });
        });
    };
    BurnRequest.prototype.setUnderwriter = function (underwriter) {
        if (!ethers_1.ethers.utils.isAddress(underwriter))
            return false;
        this.underwriter = ethers_1.ethers.utils.getAddress(underwriter);
        return true;
    };
    BurnRequest.prototype.toEIP712Digest = function (contractAddress, chainId) {
        return utils_1.signTypedDataUtils.generateTypedDataHash(this.toEIP712(contractAddress || this.contractAddress, Number(chainId || this.chainId)));
    };
    BurnRequest.prototype.getExpiry = function (nonce) {
        nonce = nonce || this.tokenNonce;
        console.log([this.asset, this.amount, this.deadline, nonce, this.destination]);
        return ethers_1.ethers.utils.solidityKeccak256(['address', 'uint256', 'uint256', 'uint256', 'bytes'], [this.asset, this.amount, this.deadline, nonce, this.destination]);
    };
    BurnRequest.prototype.toEIP712 = function (contractAddress, chainId) {
        this.contractAddress = contractAddress || this.contractAddress;
        this.chainId = chainId || this.chainId;
        return {
            types: {
                EIP712Domain: constants_1.EIP712_TYPES.EIP712Domain,
                Permit: [
                    {
                        name: 'holder',
                        type: 'address'
                    },
                    {
                        name: 'spender',
                        type: 'address'
                    },
                    {
                        name: 'nonce',
                        type: 'uint256'
                    },
                    {
                        name: 'expiry',
                        type: 'uint256'
                    },
                    {
                        name: 'allowed',
                        type: 'bool'
                    },
                ]
            },
            primaryType: 'Permit',
            domain: {
                name: this.assetName,
                version: '1',
                chainId: String(this.chainId) || '1',
                verifyingContract: this.asset || ethers_1.ethers.constants.AddressZero
            },
            message: {
                holder: this.owner,
                spender: contractAddress,
                nonce: this.tokenNonce,
                expiry: this.getExpiry(),
                allowed: 'true'
            }
        };
    };
    BurnRequest.prototype.toGatewayAddress = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var burn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.submitToRenVM(false)];
                    case 1:
                        burn = _a.sent();
                        return [2 /*return*/, burn.gatewayAddress];
                }
            });
        });
    };
    BurnRequest.prototype.sign = function (signer, contractAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, chainId, token, _a, _b, _c, _d, _e, _f, _g, payload, sig, e_1, _h, _j, _k, _l;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        provider = signer.provider;
                        return [4 /*yield*/, signer.provider.getNetwork()];
                    case 1:
                        chainId = (_m.sent()).chainId;
                        console.log(chainId);
                        token = new ethers_1.ethers.Contract(this.asset, [
                            'function DOMAIN_SEPARATOR() view returns (bytes32)',
                            'function name() view returns (string)',
                            'function nonces(address) view returns (uint256)',
                        ], signer.provider);
                        _b = (_a = console).log;
                        _c = ['domain'];
                        return [4 /*yield*/, token.DOMAIN_SEPARATOR()];
                    case 2:
                        _b.apply(_a, _c.concat([_m.sent()]));
                        _d = this;
                        return [4 /*yield*/, token.name()];
                    case 3:
                        _d.assetName = _m.sent();
                        _e = this;
                        _g = (_f = token).nonces;
                        return [4 /*yield*/, signer.getAddress()];
                    case 4: return [4 /*yield*/, _g.apply(_f, [_m.sent()])];
                    case 5:
                        _e.tokenNonce = (_m.sent()).toString();
                        console.log(this.assetName, this.tokenNonce);
                        _m.label = 6;
                    case 6:
                        _m.trys.push([6, 8, , 11]);
                        payload = this.toEIP712(contractAddress, chainId);
                        console.log(payload);
                        delete payload.types.EIP712Domain;
                        return [4 /*yield*/, signer._signTypedData(payload.domain, payload.types, payload.message)];
                    case 7:
                        sig = _m.sent();
                        return [2 /*return*/, (this.signature = ethers_1.ethers.utils.joinSignature(ethers_1.ethers.utils.splitSignature(sig)))];
                    case 8:
                        e_1 = _m.sent();
                        console.error(e_1);
                        _h = this;
                        _k = (_j = provider).send;
                        _l = ['eth_signTypedData_v4'];
                        return [4 /*yield*/, signer.getAddress()];
                    case 9: return [4 /*yield*/, _k.apply(_j, _l.concat([[
                                _m.sent(),
                                this.toEIP712(this.contractAddress || contractAddress, chainId)
                            ]]))];
                    case 10: return [2 /*return*/, (_h.signature = _m.sent())];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    BurnRequest.prototype.waitForHostTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var network, provider, renbtc;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        network = (function (v) { return v === 'ethereum' ? 'mainnet' : v; })(deployment_utils_1.CONTROLLER_DEPLOYMENTS[this.contractAddress.toLowerCase()].toLowerCase());
                        provider = new ethers_1.ethers.providers.InfuraProvider(network, '2f1de898efb74331bf933d3ac469b98d');
                        renbtc = new ethers_1.ethers.Contract(fixtures_1["default"][(function (v) { return v === 'mainnet' ? 'ethereum' : v; })(network).toUpperCase()].renBTC, ['event Transfer(address indexed from, address indexed to, uint256 amount)'], provider);
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                var filter = renbtc.filters.Transfer(_this.contractAddress, ethers_1.ethers.constants.AddressZero);
                                var done = function (rcpt) {
                                    renbtc.off(filter, listener);
                                    resolve(rcpt);
                                };
                                var listener = function (from, to, amount, evt) {
                                    (function () { return __awaiter(_this, void 0, void 0, function () {
                                        var tx, _a, receipt, logs, decoded_1, events;
                                        var _this = this;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0:
                                                    console.log('evt', evt);
                                                    if (!(this.asset == ethers_1.ethers.constants.AddressZero)) return [3 /*break*/, 4];
                                                    return [4 /*yield*/, evt.getTransaction()];
                                                case 1:
                                                    tx = _b.sent();
                                                    if (!(tx.from === this.owner && ethers_1.ethers.utils.hexlify(tx.value) === ethers_1.ethers.utils.hexlify(this.amount))) return [3 /*break*/, 3];
                                                    _a = done;
                                                    return [4 /*yield*/, evt.getTransactionReceipt()];
                                                case 2: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                                                case 3: return [3 /*break*/, 7];
                                                case 4: return [4 /*yield*/, evt.getTransactionReceipt()];
                                                case 5:
                                                    receipt = _b.sent();
                                                    console.log('receipt', receipt);
                                                    return [4 /*yield*/, evt.getTransactionReceipt()];
                                                case 6:
                                                    logs = (_b.sent()).logs;
                                                    decoded_1 = logs.map(function (v) { try {
                                                        return renbtc.interface.parseLog(v);
                                                    }
                                                    catch (e) {
                                                        console.error(e);
                                                    } }).filter(Boolean);
                                                    events = logs.map(function (v, i) { return ({ log: v, event: decoded_1[i] }); });
                                                    console.log('events', events);
                                                    if (events.find(function (v) { return v.event.args.from.toLowerCase() === _this.owner.toLowerCase() && ethers_1.ethers.utils.hexlify(_this.amount) === ethers_1.ethers.utils.hexlify(v.event.args && v.event.args.amount || 0); }))
                                                        return [2 /*return*/, done(receipt)];
                                                    _b.label = 7;
                                                case 7: return [2 /*return*/];
                                            }
                                        });
                                    }); })()["catch"](function (err) { return console.error(err); });
                                };
                                renbtc.on(filter, listener);
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    BurnRequest.prototype.waitForRemoteTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var address, arrayed, type, rest, length, utxos, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        arrayed = Array.from(ethers_1.ethers.utils.arrayify(this.destination));
                        type = arrayed[0], rest = arrayed.slice(1);
                        if (arrayed[0] === 0)
                            address = bech32.encode('bc', [type].concat(bech32.toWords(rest)));
                        else
                            address = ethers_1.ethers.utils.base58.encode(this.destination);
                        return [4 /*yield*/, BTCHandler_1.BTCHandler.getUTXOs(false, {
                                address: address,
                                confirmations: 0
                            })];
                    case 1:
                        length = (_a.sent()).length;
                        _a.label = 2;
                    case 2:
                        if (!true) return [3 /*break*/, 8];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, BTCHandler_1.BTCHandler.getUTXOs(false, {
                                address: address,
                                confirmations: 0
                            })];
                    case 4:
                        utxos = _a.sent();
                        if (utxos.length > length)
                            return [2 /*return*/, utxos[utxos.length - 1]];
                        return [3 /*break*/, 6];
                    case 5:
                        e_2 = _a.sent();
                        console.error(e_2);
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 3000); })];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 2];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return BurnRequest;
}());
exports.BurnRequest = BurnRequest;
