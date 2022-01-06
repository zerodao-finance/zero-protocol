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
import { Script, Networks } from 'bitcore-lib';
import { stripHexPrefix, maybeCoerceToGHash, encodeInitializationActions } from './helpers';
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { getCreate2Address } from '@ethersproject/address';
import assembleCloneCode from './assembleCloneCode';
var RenVM = /** @class */ (function () {
    function RenVM(cachedProxyCodeHash, shifterBorrowProxy) {
        var _this = this;
        this.InitializationActionsABI = [];
        this.computeGatewayAddress = function (_a) {
            var isTestnet = _a.isTestnet, g = _a.g, mpkh = _a.mpkh;
            return new Script()
                .add(Buffer.from(stripHexPrefix(maybeCoerceToGHash(g)), 'hex'))
                .add('OP_DROP')
                .add('OP_DUP')
                .add('OP_HASH160')
                .add(Buffer.from(stripHexPrefix(mpkh), 'hex'))
                .add('OP_EQUALVERIFY')
                .add('OP_CHECKSIG')
                .toScriptHashOut()
                .toAddress(isTestnet ? Networks.testnet : Networks.mainnet)
                .toString();
        };
        this.initializeCodeHash = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.cachedProxyCodeHash];
            });
        }); };
        this.computeLiquidityRequestHash = function (_a) {
            var shifterPool = _a.shifterPool, token = _a.token, nonce = _a.nonce, amount = _a.amount, gasRequested = _a.gasRequested, _b = _a.forbidLoan, forbidLoan = _b === void 0 ? false : _b, _c = _a.actions, actions = _c === void 0 ? [] : _c;
            return solidityKeccak256(['address', 'address', 'bytes32', 'uint256', 'uint256', 'bool', 'bytes'], [
                shifterPool,
                token,
                nonce,
                amount,
                gasRequested,
                forbidLoan,
                encodeInitializationActions(actions, _this.InitializationActionsABI),
            ]);
        };
        this.computeBorrowProxyAddress = function (_a) {
            var shifterPool = _a.shifterPool, borrower = _a.borrower, token = _a.token, nonce = _a.nonce, amount = _a.amount, forbidLoan = _a.forbidLoan, actions = _a.actions;
            var salt = solidityKeccak256(['address', 'address', 'bytes32', 'uint256', 'bool', 'bytes'], [
                borrower,
                token,
                nonce,
                amount,
                forbidLoan,
                encodeInitializationActions(actions, _this.InitializationActionsABI),
            ]);
            var implementation = getCreate2Address(shifterPool, solidityKeccak256(['string'], ['borrow-proxy-implementation']), solidityKeccak256(['bytes'], [_this.shifterBorrowProxyBytecode]));
            return getCreate2Address(shifterPool, salt, solidityKeccak256(['bytes'], [assembleCloneCode(shifterPool.toLowerCase(), implementation.toLowerCase())]));
        };
        this.cachedProxyCodeHash = cachedProxyCodeHash;
        this.shifterBorrowProxyBytecode = shifterBorrowProxy;
    }
    return RenVM;
}());
export default RenVM;
