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
require("buffer");
var ethers_1 = require("ethers");
var utils_1 = require("@0x/utils");
require("@0x/types");
var chains_1 = require("@renproject/chains");
var ren_1 = __importDefault(require("@renproject/ren"));
require("@renproject/interfaces");
var deployment_utils_1 = require("./deployment-utils");
require("./config/constants");
/**
 * Supposed to provide a way to execute other functions while using renBTC to pay for the gas fees
 * what a flow to test would look like:
 * -> underwriter sends request to perform some operation on some contract somewhere
 * -> check if renBTC amount is debited correctly
 */
var BurnRequest = /** @class */ (function () {
    function BurnRequest(params) {
        this.destination = params.destination;
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
        this._ren = new ren_1["default"]('mainnet', { loadCompletedDeposits: true });
        this._contractFn = 'zeroCall';
        this._contractParams = [
            {
                name: 'from',
                type: 'address',
                value: this.owner
            },
            {
                name: 'pNonce',
                type: 'uint256',
                value: this.pNonce
            },
            {
                name: 'module',
                type: 'address',
                value: ethers_1.ethers.constants.AddressZero
            },
            {
                name: 'data',
                type: 'bytes',
                value: '0x'
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
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('submitToRenVM this.nonce', this.nonce);
                        if (this._mint)
                            return [2 /*return*/, this._mint];
                        _a = this;
                        return [4 /*yield*/, this._ren.lockAndMint({
                                asset: 'BTC',
                                from: (0, chains_1.Bitcoin)(),
                                nonce: this.nonce,
                                to: (0, deployment_utils_1.getProvider)(this).Contract({
                                    sendTo: this.contractAddress,
                                    contractFn: this._contractFn,
                                    contractParams: this._contractParams
                                })
                            })];
                    case 1:
                        result = (_a._mint = _b.sent());
                        //    result.params.nonce = this.nonce;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    BurnRequest.prototype.waitForSignature = function () {
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
                        result = (this._queryTxResult = {
                            amount: String(amount),
                            nHash: (0, bytes_1.hexlify)(nhash),
                            pHash: (0, bytes_1.hexlify)(phash),
                            signature: (0, bytes_1.hexlify)(signature)
                        });
                        return [2 /*return*/, result];
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
        return ethers_1.ethers.utils.solidityKeccak256(['address', 'uint256', 'uint256', 'uint256', 'bytes'], [this.asset, this.amount, this.deadline, nonce, this.destination]);
    };
    BurnRequest.prototype.toEIP712 = function (contractAddress, chainId) {
        this.contractAddress = contractAddress || this.contractAddress;
        this.chainId = chainId || this.chainId;
        return {
            types: {
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
            },
            primaryType: 'Permit'
        };
    };
    BurnRequest.prototype.toGatewayAddress = function (input) {
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
    BurnRequest.prototype.sign = function (signer, contractAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, chainId, token, _a, _b, _c, _d, payload, _e, e_1, _f, _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        provider = signer.provider;
                        return [4 /*yield*/, signer.provider.getNetwork()];
                    case 1:
                        chainId = (_k.sent()).chainId;
                        token = new ethers_1.ethers.Contract(this.asset, ['function name() view returns (string)', 'function nonces(address) view returns (uint256)'], signer.provider);
                        _a = this;
                        return [4 /*yield*/, token.name()];
                    case 2:
                        _a.assetName = _k.sent();
                        _b = this;
                        _d = (_c = token).nonces;
                        return [4 /*yield*/, signer.getAddress()];
                    case 3: return [4 /*yield*/, _d.apply(_c, [_k.sent()])];
                    case 4:
                        _b.tokenNonce = (_k.sent()).toString();
                        console.log(this.assetName, this.tokenNonce);
                        _k.label = 5;
                    case 5:
                        _k.trys.push([5, 7, , 10]);
                        payload = this.toEIP712(contractAddress, chainId);
                        console.log(payload);
                        _e = this;
                        return [4 /*yield*/, signer._signTypedData(payload.domain, payload.types, payload.message)];
                    case 6: return [2 /*return*/, (_e.signature = _k.sent())];
                    case 7:
                        e_1 = _k.sent();
                        console.error(e_1);
                        _f = this;
                        _h = (_g = provider).send;
                        _j = ['eth_signTypedData_v4'];
                        return [4 /*yield*/, signer.getAddress()];
                    case 8: return [4 /*yield*/, _h.apply(_g, _j.concat([[
                                _k.sent(),
                                this.toEIP712(this.contractAddress || contractAddress, chainId)
                            ]]))];
                    case 9: return [2 /*return*/, (_f.signature = _k.sent())];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    return BurnRequest;
}());
exports.BurnRequest = BurnRequest;
