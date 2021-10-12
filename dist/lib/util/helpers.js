"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeHashForDarknodeSignature = exports.computeNHash = exports.computeShiftInTxHash = exports.encodeInitializationActions = exports.maybeCoerceToGHash = exports.computeP = exports.computePHashFromP = exports.computePHash = exports.fetchData = exports.toHex = exports.fromBase64 = exports.toBase64 = exports.addHexPrefix = exports.stripHexPrefix = void 0;
const safe_buffer_1 = require("safe-buffer");
const abi_1 = require("@ethersproject/abi");
const solidity_1 = require("@ethersproject/solidity");
const constants_1 = require("../config/constants");
/*
===========================================
============= GENERAL HELPERS =============
===========================================
*/
const stripHexPrefix = (s) => (s.substr(0, 2) === '0x' ? s.substr(2) : s);
exports.stripHexPrefix = stripHexPrefix;
const addHexPrefix = (s) => '0x' + (0, exports.stripHexPrefix)(s);
exports.addHexPrefix = addHexPrefix;
const toBase64 = (input) => (safe_buffer_1.Buffer.isBuffer(input) ? input : safe_buffer_1.Buffer.from((0, exports.stripHexPrefix)(input), 'hex')).toString('base64');
exports.toBase64 = toBase64;
const fromBase64 = (input) => safe_buffer_1.Buffer.from(input, 'base64');
exports.fromBase64 = fromBase64;
const toHex = (input) => (0, exports.addHexPrefix)(safe_buffer_1.Buffer.from(input).toString('hex'));
exports.toHex = toHex;
/* General purpose fetch that returns a JSON formatted response or null if there's an error
 * @param request = Promise to await
 * @return JSON formatted response
 */
const fetchData = async (request) => {
    try {
        const response = await request();
        if (!response.ok) {
            return null;
        }
        // purposefully await to use try / catch
        return await response.json();
    }
    catch (err) {
        console.log('error', err);
        return null;
    }
};
exports.fetchData = fetchData;
/*
===========================================
============= SOLIDITY HELPERS ============
===========================================
*/
const computePHash = (input) => {
    const p = (0, exports.computeP)(input.nonce.toString(), input.module, input.data);
    if (!p) {
        throw Error('Error computing P while computing P hash');
    }
    return (0, solidity_1.keccak256)(['bytes'], [p]);
};
exports.computePHash = computePHash;
const computePHashFromP = (p) => (0, solidity_1.keccak256)(['bytes'], [p]);
exports.computePHashFromP = computePHashFromP;
const computeP = (nonce, module, data) => new abi_1.Interface(['function zeroCall(uint256, address, bytes)']).encodeFunctionData('zeroCall', [nonce, module, data]);
exports.computeP = computeP;
const maybeCoerceToGHash = (input) => typeof input === 'string' ? input : computeGHash(input);
exports.maybeCoerceToGHash = maybeCoerceToGHash;
const computeGHash = (input) => keccakAbiEncoded(['bytes32', 'address', 'address', 'bytes32'], [(0, exports.computePHashFromP)(input.p), input.tokenAddress, input.to, input.nonce]);
const keccakAbiEncoded = (types, values) => (0, solidity_1.keccak256)(constants_1.BYTES_TYPES, [abi_1.defaultAbiCoder.encode(types, values)]);
const encodeInitializationActions = (input, InitializationActionsABI) => abi_1.defaultAbiCoder.encode([InitializationActionsABI], [
    input.map((v) => ({
        txData: v.calldata,
        to: v.to,
    })),
]);
exports.encodeInitializationActions = encodeInitializationActions;
const computeShiftInTxHash = ({ renContract, utxo, g }) => (0, exports.toBase64)((0, solidity_1.keccak256)(['string'], [`txHash_${renContract}_${(0, exports.toBase64)((0, exports.maybeCoerceToGHash)(g))}_${(0, exports.toBase64)(utxo.txHash)}_${utxo.vOut}`]));
exports.computeShiftInTxHash = computeShiftInTxHash;
const computeNHash = (input) => keccakAbiEncoded(['bytes32', 'bytes32', 'uint256'], [input.nonce, input.txHash, input.vOut]);
exports.computeNHash = computeNHash;
const maybeCoerceToNHash = (input) => (typeof input === 'object' ? (0, exports.computeNHash)(input) : input);
const computeHashForDarknodeSignature = (input) => keccakAbiEncoded(['bytes32', 'uint256', 'address', 'address', 'bytes32'], [
    typeof input.p === 'string' ? (0, exports.computePHashFromP)(input.p) : (0, exports.computePHash)(input.p),
    input.amount,
    input.tokenAddress,
    input.to,
    maybeCoerceToNHash(input.n),
]);
exports.computeHashForDarknodeSignature = computeHashForDarknodeSignature;
//# sourceMappingURL=helpers.js.map