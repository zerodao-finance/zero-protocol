import { Buffer } from 'safe-buffer';
import { defaultAbiCoder as abi } from '@ethersproject/abi';
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { BYTES_TYPES } from '../config/constants';
/*
===========================================
============= GENERAL HELPERS =============
===========================================
*/
export const stripHexPrefix = (s) => (s.substr(0, 2) === '0x' ? s.substr(2) : s);
export const addHexPrefix = (s) => '0x' + stripHexPrefix(s);
export const toBase64 = (input) => (Buffer.isBuffer(input) ? input : Buffer.from(stripHexPrefix(input), 'hex')).toString('base64');
export const fromBase64 = (input) => Buffer.from(input, 'base64');
export const toHex = (input) => addHexPrefix(Buffer.from(input).toString('hex'));
/* General purpose fetch that returns a JSON formatted response or null if there's an error
 * @param request = Promise to await
 * @return JSON formatted response
 */
export const fetchData = async (request) => {
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
/*
===========================================
============= SOLIDITY HELPERS ============
===========================================
*/
export const computePHash = (input) => {
    const p = computeP(input.nonce.toString(), input.module, input.data);
    if (!p) {
        throw Error('Error computing P while computing P hash');
    }
    return solidityKeccak256(['bytes'], [p]);
};
export const computePHashFromP = (p) => solidityKeccak256(['bytes'], [p]);
export const computeP = (nonce, module, data) => abi.encode(['uint256', 'address', 'bytes'], [nonce, module, data]);
export const maybeCoerceToGHash = (input) => typeof input === 'string' ? input : computeGHash(input);
const computeGHash = (input) => keccakAbiEncoded(['bytes32', 'address', 'address', 'bytes32'], [computePHashFromP(input.p), input.tokenAddress, input.to, input.nonce]);
const keccakAbiEncoded = (types, values) => solidityKeccak256(BYTES_TYPES, [abi.encode(types, values)]);
export const encodeInitializationActions = (input, InitializationActionsABI) => abi.encode([InitializationActionsABI], [
    input.map((v) => ({
        txData: v.calldata,
        to: v.to,
    })),
]);
export const computeShiftInTxHash = ({ renContract, utxo, g }) => toBase64(solidityKeccak256(['string'], [`txHash_${renContract}_${toBase64(maybeCoerceToGHash(g))}_${toBase64(utxo.txHash)}_${utxo.vOut}`]));
export const computeNHash = (input) => keccakAbiEncoded(['bytes32', 'bytes32', 'uint256'], [input.nonce, input.txHash, input.vOut]);
const maybeCoerceToNHash = (input) => (typeof input === 'object' ? computeNHash(input) : input);
export const computeHashForDarknodeSignature = (input) => keccakAbiEncoded(['bytes32', 'uint256', 'address', 'address', 'bytes32'], [
    typeof input.p === 'string' ? computePHashFromP(input.p) : computePHash(input.p),
    input.amount,
    input.tokenAddress,
    input.to,
    maybeCoerceToNHash(input.n),
]);
//# sourceMappingURL=helpers.js.map