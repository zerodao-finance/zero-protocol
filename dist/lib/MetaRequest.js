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
exports.MetaRequest = void 0;
require("@ethersproject/wallet");
require("@ethersproject/abstract-signer");
var bytes_1 = require("@ethersproject/bytes");
var random_1 = require("@ethersproject/random");
var hash_1 = require("@ethersproject/hash");
require("./types");
var transactions_1 = require("@ethersproject/transactions");
require("buffer");
var ethers_1 = require("ethers");
var utils_1 = require("@0x/utils");
require("@0x/types");
require("./config/constants");
require("@renproject/chains");
var ren_1 = __importDefault(require("@renproject/ren"));
require("@renproject/interfaces");
require("./deployment-utils");
/**
 * Supposed to provide a way to execute other functions while using renBTC to pay for the gas fees
 * what a flow to test would look like:
 * -> underwriter sends request to perform some operation on some contract somewhere
 * -> check if renBTC amount is debited correctly
 */
var MetaRequest = /** @class */ (function () {
    function MetaRequest(params) {
        this.requestType = "meta";
        this.module = params.module;
        this.addressFrom = params.addressFrom;
        this.underwriter = params.underwriter;
        this.asset = params.asset;
        this.data = params.data;
        console.log("params.nonce", params.nonce);
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
        this._ren = new ren_1["default"]("mainnet", { loadCompletedDeposits: true });
        this._contractFn = "zeroCall";
        this._contractParams = [
            {
                name: "from",
                type: "address",
                value: this.addressFrom
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
            },
        ];
    }
    MetaRequest.prototype.destination = function (contractAddress, chainId, signature) {
        if (this._destination)
            return this._destination;
        var payload = this.toEIP712(contractAddress || this.contractAddress, Number(chainId || this.chainId));
        delete payload.types.EIP712Domain;
        var digest = hash_1._TypedDataEncoder.hash(payload.domain, payload.types, payload.message);
        return (this._destination = (0, transactions_1.recoverAddress)(digest, signature || this.signature));
    };
    MetaRequest.prototype.setProvider = function (provider) {
        this.provider = provider;
        return this;
    };
    MetaRequest.prototype.setUnderwriter = function (underwriter) {
        if (!ethers_1.ethers.utils.isAddress(underwriter))
            return false;
        this.underwriter = ethers_1.ethers.utils.getAddress(underwriter);
        return true;
    };
    MetaRequest.prototype.toEIP712Digest = function (contractAddress, chainId) {
        return utils_1.signTypedDataUtils.generateTypedDataHash(this.toEIP712(contractAddress || this.contractAddress, Number(chainId || this.chainId)));
    };
    MetaRequest.prototype.toEIP712 = function (contractAddress, chainId) {
        this.contractAddress = contractAddress || this.contractAddress;
        this.chainId = chainId || this.chainId;
        console.log(this.underwriter);
        return {
            types: {
                MetaRequest: [
                    {
                        name: "asset",
                        type: "address"
                    },
                    {
                        name: "underwriter",
                        type: "address"
                    },
                    {
                        name: "module",
                        type: "address"
                    },
                    {
                        name: "nonce",
                        type: "uint256"
                    },
                    {
                        name: "data",
                        type: "bytes"
                    },
                ]
            },
            domain: {
                name: "ZeroController",
                version: "1",
                chainId: String(this.chainId) || "1",
                verifyingContract: this.contractAddress || ethers_1.ethers.constants.AddressZero
            },
            message: {
                asset: this.asset,
                module: this.module,
                underwriter: this.underwriter,
                nonce: this.pNonce,
                data: this.data
            },
            primaryType: "MetaRequest"
        };
    };
    MetaRequest.prototype.sign = function (signer, contractAddress) {
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
                        console.log(payload);
                        _a = this;
                        return [4 /*yield*/, signer._signTypedData(payload.domain, payload.types, payload.message)];
                    case 3: return [2 /*return*/, (_a.signature = _f.sent())];
                    case 4:
                        e_1 = _f.sent();
                        console.error(e_1);
                        _b = this;
                        _d = (_c = provider).send;
                        _e = ["eth_signTypedData_v4"];
                        return [4 /*yield*/, signer.getAddress()];
                    case 5: return [4 /*yield*/, _d.apply(_c, _e.concat([[
                                _f.sent(),
                                this.toEIP712(this.contractAddress || contractAddress, chainId)
                            ]]))];
                    case 6: return [2 /*return*/, (_b.signature = _f.sent())];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return MetaRequest;
}());
exports.MetaRequest = MetaRequest;
