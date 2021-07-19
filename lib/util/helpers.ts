import { Buffer } from 'safe-buffer';
import { defaultAbiCoder as abi } from '@ethersproject/abi';
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { NULL_PHASH, BYTES_TYPES } from '../config/constants';

/*
===========================================
============= GENERAL HELPERS =============
===========================================
*/
export const stripHexPrefix = (s: string): string => (s.substr(0, 2) === '0x' ? s.substr(2) : s);
export const addHexPrefix = (s: string): string => '0x' + stripHexPrefix(s);
export const toBase64 = (input: string): string =>
	(Buffer.isBuffer(input) ? input : Buffer.from(stripHexPrefix(input), 'hex')).toString('base64');
export const fromBase64 = (input: string): Buffer => Buffer.from(input, 'base64');
export const toHex = (input: string): string => addHexPrefix(Buffer.from(input).toString('hex'));

/*
===========================================
============= SOLIDITY HELPERS ============
===========================================
*/
export const computeP = (nonce: number, data: any): string => abi.encode(['uint256', 'bytes'], [nonce, data]);
// TODO: Remove any typing
export const maybeCoerceToPHash = (params: [any, any]) =>
	Array.isArray(params)
		? params.length <= 1 || params[1].length === 0
			? NULL_PHASH
			: computePHash(abiEncode(params))
		: stripHexPrefix(params).length === 64
		? params
		: computePHash(params);
const computePHash = (p) => solidityKeccak256(['bytes'], [p]);

export const maybeCoerceToGHash = (input) => (typeof input === 'object' ? computeGHash(input) : input);
const computeGHash = ({ to, tokenAddress, p, nonce }) =>
	keccakAbiEncoded(['bytes32', 'address', 'address', 'bytes32'], [maybeCoerceToPHash(p), tokenAddress, to, nonce]);

const abiEncode = ([types, params]) => abi.encode(types, params);
const keccakAbiEncoded = (types, values) => solidityKeccak256(BYTES_TYPES, [abi.encode(types, values)]);

export const encodeInitializationActions = (input, InitializationActionsABI) =>
	abi.encode(
		[InitializationActionsABI],
		[
			input.map((v) => ({
				txData: v.calldata,
				to: v.to,
			})),
		],
	);

export const computeShiftInTxHash = ({ renContract, utxo, g }) =>
	toBase64(
		solidityKeccak256(
			['string'],
			[`txHash_${renContract}_${toBase64(maybeCoerceToGHash(g))}_${toBase64(utxo.txHash)}_${utxo.vOut}`],
		),
	);

export const computeNHash = ({
	txHash, // utxo hash
	vOut,
	nonce,
}) => keccakAbiEncoded(['bytes32', 'bytes32', 'uint256'], [nonce, txHash, vOut]);
const maybeCoerceToNHash = (input) => (typeof input === 'object' ? computeNHash(input) : input);

export const computeHashForDarknodeSignature = ({ p, n, amount, to, tokenAddress }) =>
	keccakAbiEncoded(
		['bytes32', 'uint256', 'address', 'address', 'bytes32'],
		[maybeCoerceToPHash(p), amount, tokenAddress, to, maybeCoerceToNHash(n)],
	);
