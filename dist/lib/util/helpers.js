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
import { Buffer } from 'safe-buffer';
import { defaultAbiCoder as abi, Interface } from '@ethersproject/abi';
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { BYTES_TYPES } from '../config/constants';
import { fromHex, generateNHash } from "@renproject/utils";
/*
===========================================
============= GENERAL HELPERS =============
===========================================
*/
export var stripHexPrefix = function (s) { return (s.substr(0, 2) === '0x' ? s.substr(2) : s); };
export var addHexPrefix = function (s) { return '0x' + stripHexPrefix(s); };
export var toBase64 = function (input) {
    return (Buffer.isBuffer(input) ? input : Buffer.from(stripHexPrefix(input), 'hex')).toString('base64');
};
export var fromBase64 = function (input) { return Buffer.from(input, 'base64'); };
export var toHex = function (input) { return addHexPrefix(Buffer.from(input).toString('hex')); };
/* General purpose fetch that returns a JSON formatted response or null if there's an error
 * @param request = Promise to await
 * @return JSON formatted response
 */
export var fetchData = function (request) { return __awaiter(void 0, void 0, void 0, function () {
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
/*
===========================================
============= SOLIDITY HELPERS ============
===========================================
*/
export var computePHash = function (input) {
    var p = computeP(input.to, input.nonce.toString(), input.module, input.data);
    if (!p) {
        throw Error('Error computing P while computing P hash');
    }
    return solidityKeccak256(['bytes'], [p]);
};
export var computePHashFromP = function (p) { return solidityKeccak256(['bytes'], [p]); };
export var computeP = function (to, nonce, module, data) {
    return new Interface(['function zeroCall(address,uint256,address,bytes)']).encodeFunctionData('zeroCall', [to, nonce, module, data]);
};
export var maybeCoerceToGHash = function (input) {
    return typeof input === 'string' ? input : computeGHash(input);
};
var computeGHash = function (input) {
    return keccakAbiEncoded(['bytes32', 'address', 'address', 'bytes32'], [computePHashFromP(input.p), input.tokenAddress, input.to, input.nonce]);
};
var keccakAbiEncoded = function (types, values) { return solidityKeccak256(BYTES_TYPES, [abi.encode(types, values)]); };
export var encodeInitializationActions = function (input, InitializationActionsABI) {
    return abi.encode([InitializationActionsABI], [
        input.map(function (v) { return ({
            txData: v.calldata,
            to: v.to,
        }); }),
    ]);
};
export var computeShiftInTxHash = function (_a) {
    var renContract = _a.renContract, utxo = _a.utxo, g = _a.g;
    return toBase64(solidityKeccak256(['string'], ["txHash_" + renContract + "_" + toBase64(maybeCoerceToGHash(g)) + "_" + toBase64(utxo.txHash) + "_" + utxo.vOut]));
};
export var computeNHash = function (input) { return generateNHash(fromHex(input.nonce), fromHex(input.txHash), input.vOut, true); };
var maybeCoerceToNHash = function (input) { return (typeof input === 'object' ? computeNHash(input) : input); };
export var computeHashForDarknodeSignature = function (input) {
    return keccakAbiEncoded(['bytes32', 'uint256', 'address', 'address', 'bytes32'], [
        typeof input.p === 'string' ? computePHashFromP(input.p) : computePHash(input.p),
        input.amount,
        input.tokenAddress,
        input.to,
        maybeCoerceToNHash(input.n),
    ]);
};
