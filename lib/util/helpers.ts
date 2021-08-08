import { Buffer } from 'safe-buffer';
import { defaultAbiCoder as abi } from '@ethersproject/abi';
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { NULL_PHASH, BYTES_TYPES } from '../config/constants';
import { ethers } from 'ethers';
import { get } from 'lodash';
import { Provider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { ZeroArtifacts, ZeroContracts } from './types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

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
const computePHash = (p: any) => solidityKeccak256(['bytes'], [p]);

export const maybeCoerceToGHash = (input: any) => (typeof input === 'object' ? computeGHash(input) : input);
const computeGHash = ({ to, tokenAddress, p, nonce }: any) =>
	keccakAbiEncoded(['bytes32', 'address', 'address', 'bytes32'], [maybeCoerceToPHash(p), tokenAddress, to, nonce]);

const abiEncode = ([types, params]: any[]) => abi.encode(types, params);
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

export const computeNHash = ({
	txHash, // utxo hash
	vOut,
	nonce,
}: any) => keccakAbiEncoded(['bytes32', 'bytes32', 'uint256'], [nonce, txHash, vOut]);
const maybeCoerceToNHash = (input: any) => (typeof input === 'object' ? computeNHash(input) : input);

export const computeHashForDarknodeSignature = ({ p, n, amount, to, tokenAddress }: any) =>
	keccakAbiEncoded(
		['bytes32', 'uint256', 'address', 'address', 'bytes32'],
		[maybeCoerceToPHash(p), amount, tokenAddress, to, maybeCoerceToNHash(n)],
	);

export const getZeroContracts = async (
	providerOrSigner: Provider | Wallet | SignerWithAddress,
): Promise<ZeroContracts> => {
	const getChainDetails = async (): Promise<[string, string]> => {
		let network: ethers.providers.Network;
		try {
			network = await (providerOrSigner as Provider).getNetwork();
		} catch (e) {
			network = await (providerOrSigner as Wallet).provider.getNetwork();
		}
		const chainId: string = String(network.chainId);
		return [chainId, network.name];
	};
	const deployments = require('./deployments.json');
	const contracts: ZeroContracts = {};
	const [chainId, chainName] = await getChainDetails();
	const artifacts: ZeroArtifacts = get(deployments, `${chainId}.${chainName}.contracts`) || {};
	const keys = Object.keys(artifacts);
	if (keys.length === 0) {
		throw new Error('No contracts were found on this chain. Please check the provider');
	}
	for (const key of keys) {
		const artifact = artifacts[key];
		contracts[key] = new ethers.Contract(artifact.address, artifact.abi, providerOrSigner);
	}
	return contracts;
};
