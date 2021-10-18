import { BigNumber } from '@ethersproject/bignumber';
import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import { hexlify } from "@ethersproject/bytes";
import { randomBytes } from "@ethersproject/random";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { recoverAddress } from "@ethersproject/transactions";
import { formatBytes32String } from "@ethersproject/strings";
import { BitcoinClient, getDefaultBitcoinClient } from "./rpc/btc";
import { Buffer } from "buffer";
import type { SignerWithAddress } from 'hardhat-deploy-ethers/dist/src/signers';
import { BigNumberish, ethers, utils } from 'ethers';
import { signTypedDataUtils } from '@0x/utils';
import { EIP712TypedData } from '@0x/types';
import { EIP712_TYPES } from './config/constants';
import RenVM from './util/renvm';
import { computeP, computeNHash, maybeCoerceToGHash } from './util/helpers';
import { createNode, ZeroConnection, ZeroKeeper, ZeroUser } from './p2p';
import { PersistenceAdapter } from './persistence';
import { GatewayAddressInput } from './types';

const toBuffer = (hex) => Buffer.from(hex.substr(2), 'hex');

type ZeroSigner = Wallet & SignerWithAddress & Signer;
import RenSDK = require("@renproject/ren");


import { use } from 'chai';

const RenJS = (RenSDK as any).RenJS;

export class TransferRequest {
	public module: string;
	public to: string;
	public underwriter: string;
	public asset: string;
	public nonce: string;
	public pNonce: string;
	public amount: string;
	public data: string;
	public contractAddress: string;
	public chainId: number | string;
	public signature: string;
	private _destination: string;
	constructor(params: {
		module: string,
		to: string,
		underwriter: string,
		asset: string,
		amount: BigNumberish,
		data: string,
		nonce?: BigNumberish,
		pNonce?: BigNumberish,
		contractAddress?: string,
		chainId?: number,
		signature?: string
	}) {
		this.module = params.module;
		this.to = params.to;
		this.underwriter = params.underwriter;
		this.asset = params.asset;
		this.amount = params.amount.toString();
		this.data = params.data;
		this.nonce = params.nonce
			? hexlify(params.nonce)
			: hexlify(randomBytes(32));
		this.pNonce = params.pNonce
			? hexlify(params.pNonce.toString())
			: hexlify(randomBytes(32));
		this.chainId = params.chainId;
		this.contractAddress = params.contractAddress;
		this.signature = params.signature;
	}

	destination(contractAddress?: string, chainId?: number | string, signature?: string) {
		if (this._destination) return this._destination;
		const payload = this.toEIP712(contractAddress || this.contractAddress, Number(chainId || this.chainId));
		delete payload.types.EIP712Domain;
		const digest = _TypedDataEncoder.hash(payload.domain, payload.types, payload.message);
		return (this._destination = recoverAddress(digest, signature || this.signature));
	}
	async waitForSignature(isTest) {
		const txHash = await this.computeMintTxHash(isTest);
		const renvm = new (RenJS as any)('mainnet', { useV2TransactionFormat: true });
		while (true) {
			console.log('poll RenVM ...');
			const result = await (renvm.renVM as any).queryTx(txHash);
			if (!result) {
				await new Promise((resolve) => setTimeout(resolve, 10000));
			} else {
				return result;
			}
		}
	}
	async computeMintTxHash(isTest) {
		const renvm = new (RenJS as any)('mainnet', { useV2TransactionFormat: true });
		const { hash, vout } = await this.pollForFromChainTx(isTest || false);
		const nHash = toBuffer(computeNHash({
			txHash: hash,
			vOut: vout,
			nonce: this.nonce
		}));
		return renvm.renVM.mintTxHash({
			selector: 'BTC/toEthereum',
			gHash: toBuffer(this._computeGHash()),
			gPubKey: toBuffer(await this.getGPubKey()),
			nHash,
			nonce: toBuffer(this.nonce),
			output: {
				txid: toBuffer(hash),
				txindex: hexlify(vout)
			},
			amount: hexlify(this.amount),
			payload: toBuffer('0x' + computeP(this.pNonce, this.module, this.data).substr(10)),
			pHash: toBuffer(utils.solidityKeccak256(['bytes'], [computeP(this.pNonce, this.module, this.data)])),
			to: this.contractAddress,
			outputHashFormat: 'b64'
		});
	}
	async submitToRenVM(isTest) {
		const renvm = new (RenJS as any)('mainnet', { useV2TransactionFormat: true });
		const { hash, vout } = await this.pollForFromChainTx(isTest || false);
		const nHash = toBuffer(computeNHash({
			txHash: hash,
			vOut: vout,
			nonce: this.nonce
		}));
		return await renvm.renVM.submitMint({
			selector: 'BTC/toEthereum',
			gHash: toBuffer(this._computeGHash()),
			gPubKey: toBuffer(await this.getGPubKey()),
			nHash,
			nonce: toBuffer(this.nonce),
			output: {
				txid: toBuffer(hash),
				txindex: hexlify(vout)
			},
			amount: hexlify(this.amount),
			payload: toBuffer('0x' + computeP(this.pNonce, this.module, this.data).substr(10)),
			pHash: toBuffer(utils.solidityKeccak256(['bytes'], [computeP(this.pNonce, this.module, this.data)])),
			to: this.contractAddress,
			token: this.asset,
			fn: 'zeroCall',
			fnABI: [{
				name: 'zeroCall',
				type: 'function',
				stateMutability: 'nonpayable',
				inputs: [{
					type: 'uint256',
					name: 'pNonce'
				}, {
					type: 'address',
					name: 'module'
				}, {
					type: 'bytes',
					name: 'data'
				}]
			}],
			tags: []
		});
	}
	async pollForFromChainTx(isTest: boolean) {
		const gateway = await this.toGatewayAddress({ isTest: isTest || false });
		await (getDefaultBitcoinClient() as any).importAddress(gateway);
		console.log('imported');
		console.log(gateway);
		while (true) {
			try {
				if (process.env.NODE_ENV === 'development') console.log('poll ' + gateway);
				const result = await (getDefaultBitcoinClient() as any).listReceivedByAddress(1, false, true, gateway);
				if (result && result.length) {
					console.log(result)
					console.log(require('util').inspect(result, { depth: 15, colors: true }));
					const { txids } = result;
					const tx = txids.find((v) => v.out.find((v) => v.addr === gateway));
					if (tx) return {
						hash: tx.hash,
						vout: tx.out.findIndex((v) => v.addr === gateway)
					};
				} else {
					await new Promise((resolve) => setTimeout(resolve, 20000));
				}
			} catch (e) {
				if (process.env.NODE_ENV === 'development') console.error(e);
				await new Promise((resolve) => setTimeout(resolve, 20000));
			}
		}
	}
	setUnderwriter(underwriter: string): boolean {
		if (!ethers.utils.isAddress(underwriter)) return false;
		this.underwriter = ethers.utils.getAddress(underwriter);
		return true;
	}

	toEIP712Digest(contractAddress: string, chainId: number = 1): Buffer {
		return signTypedDataUtils.generateTypedDataHash(this.toEIP712(contractAddress || this.contractAddress, Number(chainId || this.chainId)));
	}

	toEIP712(contractAddress: string, chainId: number = 1): EIP712TypedData {
		this.contractAddress = contractAddress || this.contractAddress;
		this.chainId = chainId || this.chainId;
		return {
			types: EIP712_TYPES,
			domain: {
				name: 'ZeroController',
				version: '1',
				chainId: this.chainId.toString() || '1',
				verifyingContract: this.contractAddress || ethers.constants.AddressZero,
			},
			message: {
				module: this.module,
				asset: this.asset,
				amount: this.amount.toString(),
				data: this.data,
				underwriter: this.underwriter,
				nonce: this.pNonce.toString(),
			},
			primaryType: 'TransferRequest',
		};
	}
	_computeGHash() {
		return maybeCoerceToGHash({
			p: computeP(this.pNonce, this.module, this.data),
			nonce: this.nonce,
			to: this.destination(),
			tokenAddress: this.asset
		});
	}
	async getGPubKey() {
		const renvm = new (RenJS as any)('mainnet');
		return hexlify(await renvm.renVM.selectPublicKey('BTC', ''))
	}
	async toGatewayAddress(input: GatewayAddressInput): Promise<string> {
		const renvm = new (RenJS as any)('mainnet', {});
		input = input || { isTest: false };
		return (new RenVM(null, null)).computeGatewayAddress({
			mpkh: hexlify((await (renvm as any).renVM.selectPublicKey('BTC', ''))),
			isTestnet: input.isTest,
			g: {
				p: computeP(this.pNonce, this.module, this.data),
				nonce: this.nonce,
				tokenAddress: this.asset,
				to: this.destination()
			},
		});
	}
	async sign(signer: ZeroSigner, contractAddress: string): Promise<string> {
		const provider = signer.provider as ethers.providers.JsonRpcProvider;
		const { chainId } = await signer.provider.getNetwork();
		try {
			const payload = this.toEIP712(contractAddress, chainId);
			delete payload.types.EIP712Domain;
			return (this.signature = await signer._signTypedData(payload.domain, payload.types, payload.message))
		} catch (e) {
			return (this.signature = await provider.send('eth_signTypedData_v4', [
				await signer.getAddress(),
				this.toEIP712(contractAddress, chainId),
			]));
		}
	}
}

export async function createZeroConnection(address: string): Promise<ZeroConnection> {
	const connOptions = {
		multiaddr: address,
	};
	return await createNode(connOptions);
}

export function createZeroUser(connection: ZeroConnection, persistence?: PersistenceAdapter<any, any>) {
	return new ZeroUser(connection, persistence);
}

export function createZeroKeeper(connection: ZeroConnection) {
	return new ZeroKeeper(connection);
}
