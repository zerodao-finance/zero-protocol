import { Wallet } from '@ethersproject/wallet';
import { Signer } from '@ethersproject/abstract-signer';
import { hexlify } from '@ethersproject/bytes';
import { randomBytes } from '@ethersproject/random';
import { _TypedDataEncoder } from '@ethersproject/hash';
import { GatewayAddressInput } from './types';
import { recoverAddress } from '@ethersproject/transactions';
import { Buffer } from 'buffer';
import { BigNumberish, ethers } from 'ethers';
import { signTypedDataUtils } from '@0x/utils';
import { EIP712TypedData } from '@0x/types';
import { EIP712_TYPES } from './config/constants';
import { Bitcoin } from '@renproject/chains';
import RenJS from '@renproject/ren';
import { EthArgs } from '@renproject/interfaces';
import { getProvider } from './deployment-utils';
/**
 * Supposed to provide a way to execute other functions while using renBTC to pay for the gas fees
 * what a flow to test would look like:
 * -> underwriter sends request to perform some operation on some contract somewhere
 * -> check if renBTC amount is debited correctly
 */
export class MetaRequest {
	public module: string;
	public addressFrom: string;
	public underwriter: string;
	public asset: string;
	public nonce: string;
	public pNonce: string;
	public data: string;
	public contractAddress: string;
	public to: string;
	public chainId: number | string;
	public signature: string;
	private _destination: string;
	private _contractFn: string;
	private _contractParams: EthArgs;
	private _ren: RenJS;
	public _queryTxResult: any;
	public provider: any;
	public _mint: any;
	public keeper: any;

	constructor(params: {
		module: string;
		addressFrom: string;
		underwriter: string;
		asset: string;
		data: string;
		to: string;
		nonce?: BigNumberish;
		pNonce?: BigNumberish;
		contractAddress?: string;
		chainId?: number;
		signature?: string;
	}) {
		this.module = params.module;
		this.addressFrom = params.addressFrom;
		this.underwriter = params.underwriter;
		this.asset = params.asset;
		this.data = params.data;
		console.log('params.nonce', params.nonce);
		this.nonce = params.nonce ? hexlify(params.nonce) : hexlify(randomBytes(32));
		this.pNonce = params.pNonce ? hexlify(params.pNonce) : hexlify(randomBytes(32));
		this.chainId = params.chainId;
		this.contractAddress = params.contractAddress;
		this.signature = params.signature;
		this.to = params.to;
		//this._config =
		this._ren = new (RenJS as any)('mainnet', { loadCompletedDeposits: true });
		this._contractFn = 'zeroCall';
		this._contractParams = [
			{
				name: 'from',
				type: 'address',
				value: this.addressFrom,
			},
			{
				name: 'pNonce',
				type: 'uint256',
				value: this.pNonce,
			},
			{
				name: 'module',
				type: 'address',
				value: this.module,
			},
			{
				name: 'data',
				type: 'bytes',
				value: this.data,
			},
		];
	}

	destination(contractAddress?: string, chainId?: number | string, signature?: string) {
		if (this._destination) return this._destination;
		const payload = this.toEIP712(contractAddress || this.contractAddress, Number(chainId || this.chainId));
		delete payload.types.EIP712Domain;
		const digest = _TypedDataEncoder.hash(payload.domain, payload.types, payload.message);
		return (this._destination = recoverAddress(digest, signature || this.signature));
	}
	setProvider(provider) {
		this.provider = provider;
		return this;
	}
	async submitToRenVM(isTest) {
		console.log('submitToRenVM this.nonce', this.nonce);
		if (this._mint) return this._mint;
		const result = (this._mint = await this._ren.lockAndMint({
			asset: 'BTC',
			from: Bitcoin(),
			nonce: this.nonce,
			to: getProvider(this).Contract({
				sendTo: this.contractAddress,
				contractFn: this._contractFn,
				contractParams: this._contractParams,
			}),
		}));
		//    result.params.nonce = this.nonce;
		return result;
	}
	async waitForSignature() {
		if (this._queryTxResult) return this._queryTxResult;
		const mint = await this.submitToRenVM(false);
		const deposit: any = await new Promise((resolve, reject) => {
			mint.on('deposit', resolve);
			(mint as any).on('error', reject);
		});
		await deposit.signed();
		const { signature, nhash, phash, amount } = deposit._state.queryTxResult.out;
		const result = (this._queryTxResult = {
			amount: String(amount),
			nHash: hexlify(nhash),
			pHash: hexlify(phash),
			signature: hexlify(signature),
		});
		return result;
	}
	setUnderwriter(underwriter: string): boolean {
		if (!ethers.utils.isAddress(underwriter)) return false;
		this.underwriter = ethers.utils.getAddress(underwriter);
		return true;
	}

	toEIP712Digest(contractAddress: string, chainId?: number): Buffer {
		return signTypedDataUtils.generateTypedDataHash(
			this.toEIP712(contractAddress || this.contractAddress, Number(chainId || this.chainId)),
		);
	}

	toEIP712(contractAddress: string, chainId?: number): EIP712TypedData {
		this.contractAddress = contractAddress || this.contractAddress;
		this.chainId = chainId || this.chainId;
		console.log(this.underwriter);
		return {
			types: {
				MetaRequest: [
					{
						name: 'asset',
						type: 'address',
					},
					{
						name: 'underwriter',
						type: 'address',
					},
					{
						name: 'module',
						type: 'address',
					},
					{
						name: 'nonce',
						type: 'uint256',
					},
					{
						name: 'data',
						type: 'bytes',
					},
				],
			},
			domain: {
				name: 'ZeroController',
				version: '1',
				chainId: String(this.chainId) || '1',
				verifyingContract: this.contractAddress || ethers.constants.AddressZero,
			},
			message: {
				asset: this.asset,
				module: this.module,
				underwriter: this.underwriter,
				nonce: this.pNonce,
				data: this.data,
			},
			primaryType: 'MetaRequest',
		};
	}
	async toGatewayAddress(input: GatewayAddressInput): Promise<string> {
		const mint = await this.submitToRenVM(false);
		return mint.gatewayAddress;
	}
	async sign(signer: Wallet & Signer, contractAddress?: string): Promise<string> {
		const provider = signer.provider as ethers.providers.JsonRpcProvider;
		const { chainId } = await signer.provider.getNetwork();
		try {
			const payload = this.toEIP712(contractAddress, chainId);
			console.log(payload);
			return (this.signature = await signer._signTypedData(payload.domain, payload.types, payload.message));
		} catch (e) {
			console.error(e);
			return (this.signature = await provider.send('eth_signTypedData_v4', [
				await signer.getAddress(),
				this.toEIP712(this.contractAddress || contractAddress, chainId),
			]));
		}
	}
}
