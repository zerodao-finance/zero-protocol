import { BigNumber } from '@ethersproject/bignumber';
import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import { hexlify } from "@ethersproject/utils";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { recoverAddress } from "@ethersproject/transactions";
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
import RenJS from "@renproject/ren";

const toBuffer = (hex) => Buffer.from(hex.substr(2), 'hex');

type ZeroSigner = Wallet & SignerWithAddress & Signer;

import { use } from 'chai';

export default class TransferRequest {
	public module: string;
	public to: string;
	public underwriter: string;
	public asset: string;
	public nonce: string;
	public pNonce: string;
	public amount: string;
	public data: string;
	public signature: string;
	public contractAddress: string;
	public chainId: number | string;
	private _destination: string;
	constructor(
		module: string,
		to: string,
		underwriter: string,
		asset: string,
		amount: BigNumberish,
		data: string,
		nonce?: BigNumberish,
		pNonce?: BigNumberish,
		contractAddress: string,
		chainId: number | string
	) {
		this.module = module;
		this.to = to;
		this.underwriter = underwriter;
		this.asset = asset;
		this.amount = amount.toString();
		this.data = data;
		this.nonce = nonce
			? ethers.utils.formatBytes32String(nonce.toString())
			: ethers.utils.hexlify(ethers.utils.randomBytes(32));
		this.pNonce = pNonce
			? ethers.utils.formatBytes32String(pNonce.toString())
			: ethers.utils.hexlify(ethers.utils.randomBytes(32));
		this.chainId = chainId;
		this.contractAddress = contractAddress;
	}

	destination(contractAddress, chainId, signature) {
		if (this._destination) return this._destination;
		const payload = this.toEIP712(contractAddress || this.contractAddress, chainId || this.chainId);
		delete payload.types.EIP712Domain;
		const digest = _TypedDataEncoder.hash(payload.domain, payload.types, payload.message);
		return (this._destination = recoverAddress(digest, signature || this.signature));
	}
	async submitToRenVM(isTest) {
		const renvm = new RenJS('mainnet', { useV2TransactionFormat: true });
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
			asset: this.asset,
			fn: 'zeroCall',
			fnAbi: [{
				name: 'zeroCall',
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
		while (true) {
			try {
				if (process.env.NODE_ENV === 'development') console.log('poll ' + gateway);
				const result = await getDefaultBitcoinClient().listReceivedByAddress(gateway);
				if (result) {
					const { txids } = result;
					const tx = txids.find((v) => v.out.find((v) => v.addr === gateway));
					return {
						hash: tx.hash,
						vout: tx.out.findIndex((v) => v.addr === gateway)
					};
				} else {
					await new Promise((resolve) => setTimeout(resolve, 10000));
				}
			} catch (e) {
				if (process.env.NODE_ENV === 'development') console.error(e);
			}
		}
	}
	setUnderwriter(underwriter: string): boolean {
		if (!ethers.utils.isAddress(underwriter)) return false;
		this.underwriter = ethers.utils.getAddress(underwriter);
		return true;
	}

	toEIP712Digest(contractAddress: string, chainId: number = 1): Buffer {
		return signTypedDataUtils.generateTypedDataHash(this.toEIP712(contractAddress || this.contractAddress, chainId || this.chainId));
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
		const renvm = new RenJS('mainnet');
		return hexlify(await renvm.renVM.selectPublicKey('BTC'))
	}
	async toGatewayAddress(input: GatewayAddressInput) {
		const renvm = new RenVM('mainnet', {});
		return renvm.computeGatewayAddress({
			mpkh: hexlify(await renvm.renVM.selectPublicKey('BTC')),
			isTestnet: input.isTest,
			g: {
				p: computeP(this.pNonce, this.module, this.data),
				nonce: this.nonce,
				tokenAddress: this.asset,
				to: this.destination()
			},
		});
	}

	async sign(signer: ZeroSigner, contractAddress: string) {
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
