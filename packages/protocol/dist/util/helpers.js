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
exports.computeHashForDarknodeSignature = exports.computeNHash = exports.computeShiftInTxHash = exports.encodeInitializationActions = exports.maybeCoerceToGHash = exports.computeP = exports.computePHashFromP = exports.computePHash = exports.fetchData = exports.toHex = exports.fromBase64 = exports.toBase64 = exports.addHexPrefix = exports.stripHexPrefix = void 0;
var safe_buffer_1 = require("safe-buffer");
var abi_1 = require("@ethersproject/abi");
var solidity_1 = require("@ethersproject/solidity");
var constants_1 = require("../config/constants");
var utils_1 = require("@renproject/utils");
require("../types");
/*
===========================================
============= GENERAL HELPERS =============
===========================================
*/
var stripHexPrefix = function (s) { return (s.substr(0, 2) === '0x' ? s.substr(2) : s); };
exports.stripHexPrefix = stripHexPrefix;
var addHexPrefix = function (s) { return '0x' + (0, exports.stripHexPrefix)(s); };
exports.addHexPrefix = addHexPrefix;
var toBase64 = function (input) {
    return (safe_buffer_1.Buffer.isBuffer(input) ? input : safe_buffer_1.Buffer.from((0, exports.stripHexPrefix)(input), 'hex')).toString('base64');
};
exports.toBase64 = toBase64;
var fromBase64 = function (input) { return safe_buffer_1.Buffer.from(input, 'base64'); };
exports.fromBase64 = fromBase64;
var toHex = function (input) { return (0, exports.addHexPrefix)(safe_buffer_1.Buffer.from(input).toString('hex')); };
exports.toHex = toHex;
/* General purpose fetch that returns a JSON formatted response or null if there's an error
 * @param request = Promise to await
 * @return JSON formatted response
 */
var fetchData = function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, request()];
            case 1:
                response = _a.sent();
                if (!response.ok) {
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, response.json()];
            case 2: 
            // purposefully await to use try / catch
            return [2 /*return*/, _a.sent()];
            case 3:
                err_1 = _a.sent();
                console.log('error', err_1);
                return [2 /*return*/, null];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.fetchData = fetchData;
/*
===========================================
============= SOLIDITY HELPERS ============
===========================================
*/
var computePHash = function (input) {
    var p = (0, exports.computeP)(input.to, input.nonce.toString(), input.module, input.data);
    if (!p) {
        throw Error('Error computing P while computing P hash');
    }
    return (0, solidity_1.keccak256)(['bytes'], [p]);
};
exports.computePHash = computePHash;
var computePHashFromP = function (p) { return (0, solidity_1.keccak256)(['bytes'], [p]); };
exports.computePHashFromP = computePHashFromP;
var computeP = function (to, nonce, module, data) {
    return new abi_1.Interface(['function zeroCall(address,uint256,address,bytes)']).encodeFunctionData('zeroCall', [to, nonce, module, data]);
};
exports.computeP = computeP;
var maybeCoerceToGHash = function (input) {
    return typeof input === 'string' ? input : computeGHash(input);
};
exports.maybeCoerceToGHash = maybeCoerceToGHash;
var computeGHash = function (input) {
    return keccakAbiEncoded(['bytes32', 'address', 'address', 'bytes32'], [(0, exports.computePHashFromP)(input.p), input.tokenAddress, input.to, input.nonce]);
};
var keccakAbiEncoded = function (types, values) { return (0, solidity_1.keccak256)(constants_1.BYTES_TYPES, [abi_1.defaultAbiCoder.encode(types, values)]); };
var encodeInitializationActions = function (input, InitializationActionsABI) {
    return abi_1.defaultAbiCoder.encode([InitializationActionsABI], [
        input.map(function (v) { return ({
            txData: v.calldata,
            to: v.to
        }); }),
    ]);
};
exports.encodeInitializationActions = encodeInitializationActions;
var computeShiftInTxHash = function (_a) {
    var renContract = _a.renContract, utxo = _a.utxo, g = _a.g;
    return (0, exports.toBase64)((0, solidity_1.keccak256)(['string'], ["txHash_" + renContract + "_" + (0, exports.toBase64)((0, exports.maybeCoerceToGHash)(g)) + "_" + (0, exports.toBase64)(utxo.txHash) + "_" + utxo.vOut]));
};
exports.computeShiftInTxHash = computeShiftInTxHash;
var computeNHash = function (input) { return utils_1.generateNHash((0, utils_1.fromHex)(input.nonce), (0, utils_1.fromHex)(input.txHash), input.vOut, true); };
exports.computeNHash = computeNHash;
var maybeCoerceToNHash = function (input) { return (typeof input === 'object' ? (0, exports.computeNHash)(input) : input); };
var computeHashForDarknodeSignature = function (input) {
    return keccakAbiEncoded(['bytes32', 'uint256', 'address', 'address', 'bytes32'], [
        typeof input.p === 'string' ? (0, exports.computePHashFromP)(input.p) : (0, exports.computePHash)(input.p),
        input.amount,
        input.tokenAddress,
        input.to,
        maybeCoerceToNHash(input.n),
    ]);
};
exports.computeHashForDarknodeSignature = computeHashForDarknodeSignature;
