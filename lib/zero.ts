import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import { hexlify } from "@ethersproject/bytes";
import { Contract } from "@ethersproject/contracts";
import { randomBytes } from "@ethersproject/random";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { BigNumber } from "@ethersproject/bignumber";
import { recoverAddress } from "@ethersproject/transactions";
import { generateNHash, generatePHash, generateGHash, fromHex, toURLBase64 } from "@renproject/utils";
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
import { Bitcoin, Polygon, Ethereum } from "@renproject/chains"
import RenJS from "@renproject/ren";
import { EthArgs } from "@renproject/interfaces";


type ZeroSigner = Wallet & SignerWithAddress & Signer;

const logger = { debug(v) { console.error(v); } };

const providers = {
	MATIC: Polygon(new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/8_zmSL_WeJCxMIWGNugMkRgphmOCftMm"), 'mainnet'),
	ETHEREUM: Ethereum(new ethers.providers.JsonRpcProvider("https://eth-mainnet.alchemyapi.io/v2/Mqiya0B-TaJ1qWsUKuqBtwEyFIbKGWoX"), 'mainnet')
}
const provider = providers[process.env.CHAIN || "MATIC"]


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
	private _contractFn: string;
	private _contractParams: EthArgs;
	private _ren: RenJS;
	public _queryTxResult: any;
	public _mint: any;

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
		console.log('params.nonce', params.nonce);
		this.nonce = params.nonce
			? hexlify(params.nonce)
			: hexlify(randomBytes(32));
		this.pNonce = params.pNonce
			? hexlify(params.pNonce.toString())
			: hexlify(randomBytes(32));
		this.chainId = params.chainId;
		this.contractAddress = params.contractAddress;
		this.signature = params.signature;
		//this._config = 
		this._ren = new (RenJS as any)('mainnet', { loadCompletedDeposits: true });
		this._contractFn = "zeroCall";
		this._contractParams = [
			{
				name: "pNonce",
				type: "uint256",
				value: this.pNonce
			},
			{
				name: "module",
				type: "address",
				value: this.module
			},
			{
				name: "data",
				type: "bytes",
				value: this.data
			},
			{
				name: "to",
				type: "address",
				value: this.to
			}
		]
	}

	destination(contractAddress?: string, chainId?: number | string, signature?: string) {
		if (this._destination) return this._destination;
		const payload = this.toEIP712(contractAddress || this.contractAddress, Number(chainId || this.chainId));
		delete payload.types.EIP712Domain;
		const digest = _TypedDataEncoder.hash(payload.domain, payload.types, payload.message);
		return (this._destination = recoverAddress(digest, signature || this.signature));
	}
	async submitToRenVM(isTest) {
		console.log('submitToRenVM this.nonce', this.nonce);
		if (this._mint) return this._mint;
		const result = this._mint = await this._ren.lockAndMint({
			asset: "BTC",
			from: Bitcoin(),
			nonce: this.nonce,
			to: provider.Contract({
				sendTo: this.contractAddress,
				contractFn: this._contractFn,
				contractParams: this._contractParams
			})
		});
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
		const result = this._queryTxResult = {
			amount: String(amount),
			nHash: hexlify(nhash),
			pHash: hexlify(phash),
			signature: hexlify(signature)
		};
		return result;
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
	async toGatewayAddress(input: GatewayAddressInput): Promise<string> {
		const mint = await this.submitToRenVM(false);
		return mint.gatewayAddress;
	}
	async sign(signer: Wallet & Signer, contractAddress: string): Promise<string> {
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

export class TrivialUnderwriterTransferRequest extends TransferRequest {
	async getController(signer) {
		const underwriter = this.getTrivialUnderwriter(signer);
		return new Contract(await underwriter.controller(), ['function fallbackMint(address underwriter, address to, address asset, uint256 amount, uint256 actualAmount, uint256 nonce, address module, bytes32 nHash, bytes data, bytes signature)'], signer);
	}
	async fallbackMint(signer, params = {}) {
		const controller = await this.getController(signer);
		const queryTxResult = await this.waitForSignature();
		return await controller.fallbackMint(this.underwriter, this.destination(), this.asset, this.amount, queryTxResult.amount, this.pNonce, this.module, queryTxResult.nHash, this.data, queryTxResult.signature, params);
	}
	getTrivialUnderwriter(signer) {
		return new Contract(this.underwriter, ['function controller() view returns (address)', 'function repay(address, address, address, uint256, uint256, uint256, address, bytes32, bytes, bytes)', 'function loan(address, address, uint256, uint256, address, bytes, bytes)'], signer);
	}
	async loan(signer) {
		const underwriter = this.getTrivialUnderwriter(signer);
		return await underwriter.loan(this.destination(), this.asset, this.amount, this.pNonce, this.module, this.data, this.signature);
	}
	async repay(signer, params = {}) {
		const underwriter = this.getTrivialUnderwriter(signer);
		const { amount: actualAmount, nHash, signature } = await this.waitForSignature();
		return await underwriter.repay(this.underwriter, this.destination(), this.asset, this.amount, actualAmount, this.pNonce, this.module, nHash, this.data, signature, params);
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
