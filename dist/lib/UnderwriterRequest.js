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
exports.__esModule = true;
exports.UnderwriterBurnRequest = exports.UnderwriterMetaRequest = exports.UnderwriterTransferRequest = void 0;
var TransferRequest_1 = require("./TransferRequest");
require("@ethersproject/bytes");
var BurnRequest_1 = require("./BurnRequest");
var MetaRequest_1 = require("./MetaRequest");
var contracts_1 = require("@ethersproject/contracts");
var mock_1 = require("./mock");
var UnderwriterTransferRequest = /** @class */ (function (_super) {
    __extends(UnderwriterTransferRequest, _super);
    function UnderwriterTransferRequest(o) {
        var _this = _super.call(this, o) || this;
        var self = _this;
        _this.callStatic = {
            repay: function (signer) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, self.repay.apply(Object.setPrototypeOf(__assign(__assign({}, self), { getUnderwriter: function (o) {
                                        return self.getUnderwriter(o).callStatic;
                                    } }), Object.getPrototypeOf(self)), [signer])];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
            }
        };
        return _this;
    }
    UnderwriterTransferRequest.prototype.repayAbi = function () { return 'function repay(address, address, address, uint256, uint256, uint256, address, bytes32, bytes, bytes)'; };
    ;
    UnderwriterTransferRequest.prototype.getController = function (signer) {
        return __awaiter(this, void 0, void 0, function () {
            var underwriter, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('getting controller');
                        underwriter = this.getUnderwriter(signer);
                        console.log('got underwriter');
                        _a = contracts_1.Contract.bind;
                        return [4 /*yield*/, underwriter.controller()];
                    case 1: return [2 /*return*/, new (_a.apply(contracts_1.Contract, [void 0, _b.sent(), [
                                'function fallbackMint(address underwriter, address to, address asset, uint256 amount, uint256 actualAmount, uint256 nonce, address module, bytes32 nHash, bytes data, bytes signature)',
                            ],
                            signer]))()];
                }
            });
        });
    };
    UnderwriterTransferRequest.prototype.fallbackMint = function (signer, params) {
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
    UnderwriterTransferRequest.prototype.getUnderwriter = function (signer) {
        return new contracts_1.Contract(this.underwriter, [
            'function controller() view returns (address)',
            (this.repayAbi && this.repayAbi()),
            'function loan(address, address, uint256, uint256, address, bytes, bytes)',
            'function meta(address, address, address, uint256, bytes, bytes)',
            'function burn(address, address, uint256, uint256, bytes, bytes)'
        ].filter(Boolean), signer);
    };
    UnderwriterTransferRequest.prototype.loan = function (signer, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var underwriter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        underwriter = this.getUnderwriter(signer);
                        return [4 /*yield*/, underwriter.loan.apply(underwriter, __spreadArray(__spreadArray([], this.getParams(), false), [params], false))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    UnderwriterTransferRequest.prototype.getParams = function () {
        return [
            this.destination(),
            this.asset,
            this.amount,
            this.pNonce,
            this.module,
            this.data,
            this.signature,
        ];
    };
    /*
        switch (func) {
            case 'loan':
            case 'meta':
                //@ts-ignore
            case 'burn':
                const sign = splitSignature(this.signature)
                //@ts-ignore
        }
    }
       */
    UnderwriterTransferRequest.prototype.getExecutionFunction = function () { return 'loan'; };
    UnderwriterTransferRequest.prototype.dry = function (signer, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var underwriter;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        underwriter = this.getUnderwriter(signer);
                        console.log('about to callstatic');
                        return [4 /*yield*/, (_a = underwriter.connect(signer.provider).callStatic)[this.getExecutionFunction()].apply(_a, __spreadArray(__spreadArray([], this.getParams(), false), [Object.assign({}, params, { from: mock_1.TEST_KEEPER_ADDRESS })], false))];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    UnderwriterTransferRequest.prototype.repay = function (signer, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var underwriter, _a, actualAmount, nHash, signature;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        underwriter = this.getUnderwriter(signer);
                        return [4 /*yield*/, this.waitForSignature()];
                    case 1:
                        _a = _b.sent(), actualAmount = _a.amount, nHash = _a.nHash, signature = _a.signature;
                        return [4 /*yield*/, underwriter.repay.apply(underwriter, (function (v) { console.log(v); return v; })([
                                this.underwriter,
                                this.destination(),
                                this.asset,
                                this.amount,
                                actualAmount,
                                this.pNonce,
                                this.module,
                                nHash,
                                this.data,
                                signature,
                                params,
                            ]))];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    return UnderwriterTransferRequest;
}(TransferRequest_1.TransferRequest));
exports.UnderwriterTransferRequest = UnderwriterTransferRequest;
var UnderwriterMetaRequest = /** @class */ (function (_super) {
    __extends(UnderwriterMetaRequest, _super);
    function UnderwriterMetaRequest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UnderwriterMetaRequest.prototype.getExecutionFunction = function () { return 'meta'; };
    UnderwriterMetaRequest.prototype.getParams = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return [this.addressFrom, this.asset, this.module, this.pNonce, this.data, this.signature];
    };
    UnderwriterMetaRequest.prototype.dry = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return []; //		return UnderwriterTransferRequest.prototype.dry.call(this, ...params);
    };
    UnderwriterMetaRequest.prototype.getController = function () {
        var _a;
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return (_a = UnderwriterTransferRequest.prototype.getController).call.apply(_a, __spreadArray([this], params, false));
    };
    UnderwriterMetaRequest.prototype.getUnderwriter = function () {
        var _a;
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return (_a = UnderwriterTransferRequest.prototype.getUnderwriter).call.apply(_a, __spreadArray([this], params, false));
    };
    UnderwriterMetaRequest.prototype.meta = function (signer, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var underwriter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        underwriter = this.getUnderwriter(signer);
                        return [4 /*yield*/, underwriter.meta.apply(underwriter, __spreadArray(__spreadArray([], this.getParams(), false), [params], false))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return UnderwriterMetaRequest;
}(MetaRequest_1.MetaRequest));
exports.UnderwriterMetaRequest = UnderwriterMetaRequest;
var UnderwriterBurnRequest = /** @class */ (function (_super) {
    __extends(UnderwriterBurnRequest, _super);
    function UnderwriterBurnRequest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UnderwriterBurnRequest.prototype.getExecutionFunction = function () { return 'burn'; };
    UnderwriterBurnRequest.prototype.getParams = function () {
        return [this.owner, this.asset, this.amount, this.deadline, this.destination, this.signature];
    };
    UnderwriterBurnRequest.prototype.dry = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return []; //return UnderwriterTransferRequest.prototype.dry.call(this, ...params);
    };
    UnderwriterBurnRequest.prototype.getController = function () {
        var _a;
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return (_a = UnderwriterTransferRequest.prototype.getController).call.apply(_a, __spreadArray([this], params, false));
    };
    UnderwriterBurnRequest.prototype.getUnderwriter = function () {
        var _a;
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return (_a = UnderwriterTransferRequest.prototype.getUnderwriter).call.apply(_a, __spreadArray([this], params, false));
    };
    UnderwriterBurnRequest.prototype.burn = function (signer, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var underwriter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        underwriter = this.getUnderwriter(signer);
                        return [4 /*yield*/, underwriter[this.getExecutionFunction()].apply(underwriter, __spreadArray(__spreadArray([], this.getParams(), false), [params], false))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return UnderwriterBurnRequest;
}(BurnRequest_1.BurnRequest));
exports.UnderwriterBurnRequest = UnderwriterBurnRequest;
