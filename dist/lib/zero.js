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
exports.createZeroKeeper = exports.createZeroUser = exports.createZeroConnection = exports.TrivialUnderwriterTransferRequest = exports.TransferRequest = exports.ReleaseRequest = void 0;
//import './silence-init';
require("@ethersproject/wallet");
require("@ethersproject/abstract-signer");
var bytes_1 = require("@ethersproject/bytes");
var contracts_1 = require("@ethersproject/contracts");
var random_1 = require("@ethersproject/random");
var hash_1 = require("@ethersproject/hash");
require("./types");
require("@ethersproject/bignumber");
var transactions_1 = require("@ethersproject/transactions");
require("@renproject/utils");
require("@ethersproject/strings");
require("./rpc/btc");
require("buffer");
var ethers_1 = require("ethers");
var utils_1 = require("@0x/utils");
require("@0x/types");
var constants_1 = require("./config/constants");
require("./util/renvm");
require("./util/helpers");
var p2p_1 = require("./p2p");
var chains_1 = require("@renproject/chains");
require("@renproject/chains");
var ren_1 = __importDefault(require("@renproject/ren"));
require("@renproject/interfaces");
require("./persistence");
var CONTROLLER_DEPLOYMENTS = {
    Arbitrum: require('../deployments/arbitrum/ZeroController').address,
    Polygon: require('../deployments/matic/ZeroController').address,
    Ethereum: ethers_1.ethers.constants.AddressZero
};
var RPC_ENDPOINTS = {
    Arbitrum: 'https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
    Polygon: 'https://polygon-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
    Ethereum: 'https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2'
};
var RENVM_PROVIDERS = {
    Arbitrum: chains_1.Arbitrum,
    Polygon: chains_1.Polygon,
    Ethereum: chains_1.Ethereum,
    Bitcoin: chains_1.Bitcoin,
    Fantom: chains_1.Fantom
};
var getProvider = function (transferRequest, to) {
    var chain = Object.entries(CONTROLLER_DEPLOYMENTS).find(function (_a) {
        var k = _a[0], v = _a[1];
        return to ? transferRequest.to : transferRequest.contractAddress === v;
    });
    var chain_key = chain[0];
    return (RENVM_PROVIDERS[chain_key])(new ethers_1.ethers.providers.JsonRpcProvider(RPC_ENDPOINTS[chain_key]), 'mainnet');
};
/*
Steps to identify chains.

1. Lookup `asset` by address to identify origin chain id.
2. Get the ticker for the asset. Lookup in chains to find matching chain to send to.
*/
var logger = { debug: function (v) { console.error(v); } };
var ReleaseRequest = /** @class */ (function () {
    function ReleaseRequest(params) {
        this.to = params.to;
        this.underwriter = params.underwriter;
        this.asset = params.asset;
        this.amount = ethers_1.ethers.utils.hexlify(typeof params.amount === 'number' ? params.amount : typeof params.amount === 'string' ? ethers_1.ethers.BigNumber.from(params.amount) : params.amount);
        this.nonce = params.nonce
            ? (0, bytes_1.hexlify)(params.nonce)
            : (0, bytes_1.hexlify)((0, random_1.randomBytes)(32));
        this.chainId = params.chainId;
        this.contractAddress = params.contractAddress;
        this.signature = params.signature;
        this._ren = new ren_1["default"]('mainnet', { loadCompletedDeposits: true });
    }
    ReleaseRequest.prototype.setProvider = function (provider) {
        this.provider = provider;
        return this;
    };
    ReleaseRequest.prototype.toEIP712 = function (contractAddress, chainId) {
        this.contractAddress = contractAddress || this.contractAddress;
        this.chainId = chainId || this.chainId;
        return {
            types: constants_1.ERC20PERMIT_TYPES,
            domain: {
                name: 'ZeroController',
                version: '1',
                chainId: String(this.chainId) || '1',
                verifyingContract: this.contractAddress || ethers_1.ethers.constants.AddressZero
            },
            message: {
                owner: this.to,
                spender: this.contractAddress,
                value: this.amount,
                nonce: this.underwriter,
                deadline: "-1"
            },
            primaryType: 'ReleaseRequest'
        };
    };
    ReleaseRequest.prototype.sign = function (signer, contractAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, chainId, payload, _a, e_1, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        provider = signer.provider;
                        return [4 /*yield*/, signer.provider.getNetwork()];
                    case 1:
                        chainId = (_f.sent()).chainId;
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 4, , 7]);
                        payload = this.toEIP712(contractAddress, chainId);
                        delete payload.types.EIP712Domain;
                        _a = this;
                        return [4 /*yield*/, signer._signTypedData(payload.domain, payload.types, payload.message)];
                    case 3: return [2 /*return*/, (_a.signature = _f.sent())];
                    case 4:
                        e_1 = _f.sent();
                        _b = this;
                        _d = (_c = provider).send;
                        _e = ['eth_signTypedData_v4'];
                        return [4 /*yield*/, signer.getAddress()];
                    case 5: return [4 /*yield*/, _d.apply(_c, _e.concat([[
                                _f.sent(),
                                this.toEIP712(contractAddress, chainId)
                            ]]))];
                    case 6: return [2 /*return*/, (_b.signature = _f.sent())];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ReleaseRequest.prototype.submitToRenVM = function (isTest) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('submitToRenVM this.nonce', this.nonce);
                        if (this._burn)
                            return [2 /*return*/, this._burn];
                        _a = this;
                        return [4 /*yield*/, this._ren.burnAndRelease({
                                asset: getProvider(this, true).asset,
                                to: getProvider(this, true).Address(this.to),
                                nonce: this.nonce,
                                from: (getProvider(this)).Contract({
                                    sendTo: this.contractAddress,
                                    contractFn: this._contractFn,
                                    contractParams: this._contractParams
                                })
                            })];
                    case 1:
                        result = _a._burn = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return ReleaseRequest;
}());
exports.ReleaseRequest = ReleaseRequest;
var TransferRequest = /** @class */ (function () {
    function TransferRequest(params) {
        this.module = params.module;
        this.to = params.to;
        this.underwriter = params.underwriter;
        this.asset = params.asset;
        this.amount = ethers_1.ethers.utils.hexlify(typeof params.amount === 'number' ? params.amount : typeof params.amount === 'string' ? ethers_1.ethers.BigNumber.from(params.amount) : params.amount);
        this.data = params.data;
        console.log('params.nonce', params.nonce);
        this.nonce = params.nonce
            ? (0, bytes_1.hexlify)(params.nonce)
            : (0, bytes_1.hexlify)((0, random_1.randomBytes)(32));
        this.pNonce = params.pNonce
            ? (0, bytes_1.hexlify)(params.pNonce)
            : (0, bytes_1.hexlify)((0, random_1.randomBytes)(32));
        this.chainId = params.chainId;
        this.contractAddress = params.contractAddress;
        this.signature = params.signature;
        //this._config = 
        this._ren = new ren_1["default"]('mainnet', { loadCompletedDeposits: true });
        this._contractFn = "zeroCall";
        this._contractParams = [
            {
                name: 'to',
                type: 'address',
                value: this.to
            },
            {
                name: "pNonce",
                type: "uint256",
                value: this.pNonce
            },
            {
                name: "module",
                type: "address",
                value: this.module
            },
            {
                name: "data",
                type: "bytes",
                value: this.data
            }
        ];
    }
    TransferRequest.prototype.destination = function (contractAddress, chainId, signature) {
        if (this._destination)
            return this._destination;
        var payload = this.toEIP712(contractAddress || this.contractAddress, Number(chainId || this.chainId));
        delete payload.types.EIP712Domain;
        var digest = hash_1._TypedDataEncoder.hash(payload.domain, payload.types, payload.message);
        return (this._destination = (0, transactions_1.recoverAddress)(digest, signature || this.signature));
    };
    TransferRequest.prototype.setProvider = function (provider) {
        this.provider = provider;
        return this;
    };
    TransferRequest.prototype.submitToRenVM = function (isTest) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('submitToRenVM this.nonce', this.nonce);
                        if (this._mint)
                            return [2 /*return*/, this._mint];
                        _a = this;
                        return [4 /*yield*/, this._ren.lockAndMint({
                                asset: "BTC",
                                from: (0, chains_1.Bitcoin)(),
                                nonce: this.nonce,
                                to: (getProvider(this)).Contract({
                                    sendTo: this.contractAddress,
                                    contractFn: this._contractFn,
                                    contractParams: this._contractParams
                                })
                            })];
                    case 1:
                        result = _a._mint = _b.sent();
                        //    result.params.nonce = this.nonce;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    TransferRequest.prototype.waitForSignature = function () {
        return __awaiter(this, void 0, void 0, function () {
            var mint, deposit, _a, signature, nhash, phash, amount, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this._queryTxResult)
                            return [2 /*return*/, this._queryTxResult];
                        return [4 /*yield*/, this.submitToRenVM(false)];
                    case 1:
                        mint = _b.sent();
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                mint.on('deposit', resolve);
                                mint.on('error', reject);
                            })];
                    case 2:
                        deposit = _b.sent();
                        return [4 /*yield*/, deposit.signed()];
                    case 3:
                        _b.sent();
                        _a = deposit._state.queryTxResult.out, signature = _a.signature, nhash = _a.nhash, phash = _a.phash, amount = _a.amount;
                        result = this._queryTxResult = {
                            amount: String(amount),
                            nHash: (0, bytes_1.hexlify)(nhash),
                            pHash: (0, bytes_1.hexlify)(phash),
                            signature: (0, bytes_1.hexlify)(signature)
                        };
                        return [2 /*return*/, result];
                }
            });
        });
    };
    TransferRequest.prototype.setUnderwriter = function (underwriter) {
        if (!ethers_1.ethers.utils.isAddress(underwriter))
            return false;
        this.underwriter = ethers_1.ethers.utils.getAddress(underwriter);
        return true;
    };
    TransferRequest.prototype.toEIP712Digest = function (contractAddress, chainId) {
        return utils_1.signTypedDataUtils.generateTypedDataHash(this.toEIP712(contractAddress || this.contractAddress, Number(chainId || this.chainId)));
    };
    TransferRequest.prototype.toEIP712 = function (contractAddress, chainId) {
        this.contractAddress = contractAddress || this.contractAddress;
        this.chainId = chainId || this.chainId;
        return {
            types: constants_1.EIP712_TYPES,
            domain: {
                name: 'ZeroController',
                version: '1',
                chainId: String(this.chainId) || '1',
                verifyingContract: this.contractAddress || ethers_1.ethers.constants.AddressZero
            },
            message: {
                module: this.module,
                asset: this.asset,
                amount: this.amount,
                data: this.data,
                underwriter: this.underwriter,
                nonce: this.pNonce
            },
            primaryType: 'TransferRequest'
        };
    };
    TransferRequest.prototype.toGatewayAddress = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var mint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.submitToRenVM(false)];
                    case 1:
                        mint = _a.sent();
                        return [2 /*return*/, mint.gatewayAddress];
                }
            });
        });
    };
    TransferRequest.prototype.sign = function (signer, contractAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, chainId, payload, _a, e_2, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        provider = signer.provider;
                        return [4 /*yield*/, signer.provider.getNetwork()];
                    case 1:
                        chainId = (_f.sent()).chainId;
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 4, , 7]);
                        payload = this.toEIP712(contractAddress, chainId);
                        delete payload.types.EIP712Domain;
                        _a = this;
                        return [4 /*yield*/, signer._signTypedData(payload.domain, payload.types, payload.message)];
                    case 3: return [2 /*return*/, (_a.signature = _f.sent())];
                    case 4:
                        e_2 = _f.sent();
                        _b = this;
                        _d = (_c = provider).send;
                        _e = ['eth_signTypedData_v4'];
                        return [4 /*yield*/, signer.getAddress()];
                    case 5: return [4 /*yield*/, _d.apply(_c, _e.concat([[
                                _f.sent(),
                                this.toEIP712(contractAddress, chainId)
                            ]]))];
                    case 6: return [2 /*return*/, (_b.signature = _f.sent())];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return TransferRequest;
}());
exports.TransferRequest = TransferRequest;
var TrivialUnderwriterTransferRequest = /** @class */ (function (_super) {
    __extends(TrivialUnderwriterTransferRequest, _super);
    function TrivialUnderwriterTransferRequest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TrivialUnderwriterTransferRequest.prototype.getController = function (signer) {
        return __awaiter(this, void 0, void 0, function () {
            var underwriter, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        underwriter = this.getTrivialUnderwriter(signer);
                        _a = contracts_1.Contract.bind;
                        return [4 /*yield*/, underwriter.controller()];
                    case 1: return [2 /*return*/, new (_a.apply(contracts_1.Contract, [void 0, _b.sent(), ['function fallbackMint(address underwriter, address to, address asset, uint256 amount, uint256 actualAmount, uint256 nonce, address module, bytes32 nHash, bytes data, bytes signature)'], signer]))()];
                }
            });
        });
    };
    TrivialUnderwriterTransferRequest.prototype.fallbackMint = function (signer, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var controller, queryTxResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getController(signer)];
                    case 1:
                        controller = _a.sent();
                        return [4 /*yield*/, this.waitForSignature()];
                    case 2:
                        queryTxResult = _a.sent();
                        console.log(this.destination());
                        return [4 /*yield*/, controller.fallbackMint(this.underwriter, this.destination(), this.asset, this.amount, queryTxResult.amount, this.pNonce, this.module, queryTxResult.nHash, this.data, queryTxResult.signature, params)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    TrivialUnderwriterTransferRequest.prototype.getTrivialUnderwriter = function (signer) {
        return new contracts_1.Contract(this.underwriter, ['function controller() view returns (address)', 'function repay(address, address, address, uint256, uint256, uint256, address, bytes32, bytes, bytes)', 'function loan(address, address, uint256, uint256, address, bytes, bytes)'], signer);
    };
    TrivialUnderwriterTransferRequest.prototype.loan = function (signer, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var underwriter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        underwriter = this.getTrivialUnderwriter(signer);
                        return [4 /*yield*/, underwriter.loan(this.destination(), this.asset, this.amount, this.pNonce, this.module, this.data, this.signature, params)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    TrivialUnderwriterTransferRequest.prototype.dry = function (signer, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var underwriter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        underwriter = this.getTrivialUnderwriter(signer);
                        return [4 /*yield*/, underwriter.callStatic.loan(this.destination(), this.asset, this.amount, this.pNonce, this.module, this.data, this.signature, params)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    TrivialUnderwriterTransferRequest.prototype.repay = function (signer, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var underwriter, _a, actualAmount, nHash, signature;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        underwriter = this.getTrivialUnderwriter(signer);
                        return [4 /*yield*/, this.waitForSignature()];
                    case 1:
                        _a = _b.sent(), actualAmount = _a.amount, nHash = _a.nHash, signature = _a.signature;
                        return [4 /*yield*/, underwriter.repay(this.underwriter, this.destination(), this.asset, this.amount, actualAmount, this.pNonce, this.module, nHash, this.data, signature, params)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    return TrivialUnderwriterTransferRequest;
}(TransferRequest));
exports.TrivialUnderwriterTransferRequest = TrivialUnderwriterTransferRequest;
function createZeroConnection(address) {
    return __awaiter(this, void 0, void 0, function () {
        var connOptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    connOptions = {
                        multiaddr: address
                    };
                    return [4 /*yield*/, (0, p2p_1.createNode)(connOptions)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.createZeroConnection = createZeroConnection;
function createZeroUser(connection, persistence) {
    return new p2p_1.ZeroUser(connection, persistence);
}
exports.createZeroUser = createZeroUser;
function createZeroKeeper(connection) {
    return new p2p_1.ZeroKeeper(connection);
}
exports.createZeroKeeper = createZeroKeeper;
