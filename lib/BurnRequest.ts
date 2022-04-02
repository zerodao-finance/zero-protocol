import { Wallet } from '@ethersproject/wallet';
import { Signer } from '@ethersproject/abstract-signer';
import { hexlify } from '@ethersproject/bytes';
import { randomBytes } from '@ethersproject/random';
import { _TypedDataEncoder } from '@ethersproject/hash';
import { GatewayAddressInput } from './types';
import { recoverAddress } from '@ethersproject/transactions';
import { Base58 } from '@ethersproject/basex';
import { Buffer } from 'buffer';
import { BigNumberish, ethers } from 'ethers';
import { signTypedDataUtils } from '@0x/utils';
import { EIP712TypedData } from '@0x/types';
import { Bitcoin } from '@renproject/chains';
import RenJS, { BurnAndRelease } from '@renproject/ren';
import { EthArgs } from '@renproject/interfaces';
import { getProvider } from './deployment-utils';
import { EIP712_TYPES } from './config/constants';
/**
 * Supposed to provide a way to execute other functions while using renBTC to pay for the gas fees
 * what a flow to test would look like:
 * -> underwriter sends request to perform some operation on some contract somewhere
 * -> check if renBTC amount is debited correctly
 */
export class BurnRequest {
	public amount: string;
	public underwriter: string;
	public deadline: number;
	public asset: string;
	public nonce: string;
	public pNonce: string;
	public data: string;
	public contractAddress: string;
	public btcTo: string;
	public chainId: number | string;
	public signature: string;
	public _destination: string;
	private _contractFn: string;
	private _contractParams: EthArgs;
	private _ren: RenJS;
	private gatewayIface: ethers.utils.Interface;
	public _queryTxResult: any;
	public provider: any;
	public _burn: any;
	public owner: string;
	public keeper: any;
	public assetName: string;
	public tokenNonce: string;
	public destination: any;
	public requestType = 'burn';

	constructor(params: {
		owner: string;
		underwriter: string;
		asset: string;
		amount: string;
		deadline: number;
		destination: string;
		nonce?: BigNumberish;
		pNonce?: BigNumberish;
		contractAddress?: string;
		chainId?: number;
		signature?: string;
	}) {
		this.destination = (params.destination);
		this._destination = params.destination;
		this.owner = params.owner;
		this.underwriter = params.underwriter;
		this.asset = params.asset;
		console.log('params.nonce', params.nonce);
		this.nonce = params.nonce ? hexlify(params.nonce) : hexlify(randomBytes(32));
		this.pNonce = params.pNonce ? hexlify(params.pNonce) : hexlify(randomBytes(32));
		this.chainId = params.chainId;
		this.amount = params.amount;
		this.deadline = params.deadline;
		this.contractAddress = params.contractAddress;
		this.signature = params.signature;
		//this._config =
		//
		this.gatewayIface = new ethers.utils.Interface([
			'event LogBurn(bytes _to, uint256 _amount, uint256 indexed _n, bytes indexed _indexedTo)',
		]);
		this._ren = new (RenJS as any)('mainnet', { loadCompletedDeposits: true });
		this._contractFn = 'burn';
		//TODO: figure out exactly what values go in here
		this._contractParams = [
			{
				name: '_to',
				type: 'bytes',
				value: this.destination,
			},
			{
				name: 'amount',
				type: 'uint256',
				value: this.amount,
			},
		];
	}

	setProvider(provider) {
		this.provider = provider;
		return this;
	}
	async submitToRenVM(isTest) {
		console.log('submitToRenVM');
		console.log(this);
		if (this._burn) return this._burn;
		const result = (this._burn = await this._ren.burnAndRelease({
			asset: 'BTC',
			to: Bitcoin().Address(this.destination),
			from: getProvider(this).Contract((btcAddress) => ({
				sendTo: this.contractAddress,
				contractFn: this._contractFn,
				contractParams: this._contractParams,
			})),
		}));
		//    result.params.nonce = this.nonce;
		return result;
	}
	async waitForTxNonce(burn: ReturnType<BurnAndRelease['burn']>) {
		if (this._queryTxResult) return this._queryTxResult;
		const burnt: any = await new Promise((resolve, reject) => {
			burn.on('transactionHash', resolve);
			(burn as any).on('error', reject);
		});
		const tx = await this.provider.waitForTransaction(burnt);
		const parsed = tx.logs.reduce((v, d) => {
			if (v) return v;
			try {
				return this.gatewayIface.parseLog(d);
			} catch (e) {}
		}, null);
		this.nonce = parsed._n;
		this._queryTxResult = parsed;
		return parsed;
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
	getExpiry(nonce?: string | number) {
		nonce = nonce || this.tokenNonce;
		return ethers.utils.solidityKeccak256(
			['address', 'uint256', 'uint256', 'uint256', 'bytes'],
			[this.asset, this.amount, this.deadline, nonce, this.destination],
		);
	}
	toEIP712(contractAddress: string, chainId?: number): EIP712TypedData {
		this.contractAddress = contractAddress || this.contractAddress;
		this.chainId = chainId || this.chainId;
		return {
			types: {
				Permit: [
					{
						name: 'holder',
						type: 'address',
					},
					{
						name: 'spender',
						type: 'address',
					},
					{
						name: 'nonce',
						type: 'uint256',
					},
					{
						name: 'expiry',
						type: 'uint256',
					},
					{
						name: 'allowed',
						type: 'bool',
					},
				],
			},
			domain: {
				name: this.assetName,
				version: '1',
				chainId: String(this.chainId) || '1',
				verifyingContract: this.asset || ethers.constants.AddressZero,
			},
			message: {
				holder: this.owner,
				spender: contractAddress,
				nonce: this.tokenNonce,
				expiry: this.getExpiry(),
				allowed: 'true',
			},
			primaryType: 'Permit',
		};
	}
	async toGatewayAddress(input: GatewayAddressInput): Promise<string> {
		const burn = await this.submitToRenVM(false);
		return burn.gatewayAddress;
	}
	async sign(signer: Wallet & Signer, contractAddress?: string): Promise<string> {
		const provider = signer.provider as ethers.providers.JsonRpcProvider;
		const { chainId } = await signer.provider.getNetwork();
		const token = new ethers.Contract(
			this.asset,
			['function name() view returns (string)', 'function nonces(address) view returns (uint256)'],
			signer.provider,
		);
		this.assetName = await token.name();
		this.tokenNonce = (await token.nonces(await signer.getAddress())).toString();
		console.log(this.assetName, this.tokenNonce);
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
