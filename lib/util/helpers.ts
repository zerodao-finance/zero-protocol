import { Buffer } from 'safe-buffer';
import { defaultAbiCoder as abi, Interface } from '@ethersproject/abi';
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { BYTES_TYPES } from '../config/constants';
import { DarknodeSignatureInput, GHashInput, NHashInput, PHashInput } from '../types';
import { fromHex, generateNHash } from "@renproject/utils";

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

/* General purpose fetch that returns a JSON formatted response or null if there's an error
 * @param request = Promise to await
 * @return JSON formatted response
 */
export const fetchData = async <T>(request: () => Promise<Response>): Promise<T | null> => {
	try {
		const response = await request();
		if (!response.ok) {
			return null;
		}
		// purposefully await to use try / catch
		return await response.json();
	} catch (err) {
		console.log('error', err);
		return null;
	}
};

/*
===========================================
============= SOLIDITY HELPERS ============
===========================================
*/
export const computePHash = (input: PHashInput): string => {
	const p = computeP(input.to, input.nonce.toString(), input.module, input.data);
	if (!p) {
		throw Error('Error computing P while computing P hash');
	}
	return solidityKeccak256(['bytes'], [p]);
};

export const computePHashFromP = (p: string) => solidityKeccak256(['bytes'], [p]);

export const computeP = (to: string, nonce: string, module: string, data: string): string =>
	new Interface(['function zeroCall(address,uint256,address,bytes)']).encodeFunctionData('zeroCall', [to, nonce, module, data]);

export const maybeCoerceToGHash = (input: GHashInput | string) =>
	typeof input === 'string' ? input : computeGHash(input);
const computeGHash = (input: GHashInput) =>
	keccakAbiEncoded(
		['bytes32', 'address', 'address', 'bytes32'],
		[computePHashFromP(input.p), input.tokenAddress, input.to, input.nonce],
	);

const keccakAbiEncoded = (types: any, values: any) => solidityKeccak256(BYTES_TYPES, [abi.encode(types, values)]);

export const encodeInitializationActions = (input: any, InitializationActionsABI: any) =>
	abi.encode(
		[InitializationActionsABI],
		[
			input.map((v: any) => ({
				txData: v.calldata,
				to: v.to,
			})),
		],
	);

export const computeShiftInTxHash = ({ renContract, utxo, g }: any) =>
	toBase64(
		solidityKeccak256(
			['string'],
			[`txHash_${renContract}_${toBase64(maybeCoerceToGHash(g))}_${toBase64(utxo.txHash)}_${utxo.vOut}`],
		),
	);

export const computeNHash = (input: NHashInput) => (generateNHash as any)(fromHex(input.nonce), fromHex(input.txHash), input.vOut, true);
const maybeCoerceToNHash = (input: NHashInput | string) => (typeof input === 'object' ? computeNHash(input) : input);

export const computeHashForDarknodeSignature = (input: DarknodeSignatureInput) =>
	keccakAbiEncoded(
		['bytes32', 'uint256', 'address', 'address', 'bytes32'],
		[
			typeof input.p === 'string' ? computePHashFromP(input.p) : computePHash(input.p),
			input.amount,
			input.tokenAddress,
			input.to,
			maybeCoerceToNHash(input.n),
		],
	);
