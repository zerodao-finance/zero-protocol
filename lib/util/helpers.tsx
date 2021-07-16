import { Buffer } from 'safe-buffer';
import { defaultAbiCoder as abi } from '@ethersproject/abi';
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { NULL_PHASH, BYTES_TYPES } from '../config/constants';

/*
===========================================
============= GENERAL HELPERS =============
===========================================
*/
export const stripHexPrefix = (s) => (s.substr(0, 2) === '0x' ? s.substr(2) : s);
export const addHexPrefix = (s) => '0x' + stripHexPrefix(s);
export const toBase64 = (input) =>
	(Buffer.isBuffer(input) ? input : Buffer.from(stripHexPrefix(input), 'hex')).toString('base64');
export const fromBase64 = (input) => Buffer.from(input, 'base64');
export const toHex = (input) => addHexPrefix(Buffer.from(input).toString('hex'));

/*
===========================================
============= SOLIDITY HELPERS ============
===========================================
*/
export const computeP = (nonce, data) => abi.encode(['uint256', 'bytes'], [nonce, data]);
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
