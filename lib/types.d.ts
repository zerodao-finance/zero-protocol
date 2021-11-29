import { BigNumberish } from '@ethersproject/bignumber';
import { SignerWithAddress } from 'hardhat-deploy-ethers/dist/src/signers';
import { ZeroConnection, ZeroKeeper, ZeroUser } from './p2p';
import { PersistenceAdapter } from './persistence';
import { EIP712TypedData } from '@0x/types';

export declare class TransferRequest {
	constructor(
		module: string,
		to: string,
		underwriter: string,
		asset: string,
		amount: BigNumberish,
		data: string,
		nonce?: BigNumberish,
		pNonce?: BigNumberish,
	);
	public setUnderwriter(underwriter: string): boolean;
	public toEIP712Digest(contractAddress: string, chainId: number): Buffer;
	public toEIP712(contractAddress: string, chainId: number): EIP712TypedData;
	public toGatewayAddress(input: GatewayAddressInput): string;
	public sign(signer: SignerWithAddress, contractAddress: string): Promise<string>;
}

export function createZeroConnection(address: string): Promise<ZeroConnection>;
export function createZeroKeeper(connection: ZeroConnection): ZeroKeeper;
export function createZeroUser(connection: ZeroConnection, persistence?: PersistenceAdapter<any, any>): ZeroUser;

export interface TransferRequest {
	module: string;
	to: string;
	underwriter: string;
	asset: string;
	nonce: BigNumberish;
	pNonce: BigNumberish;
	amount: BigNumberish;
	data: string;
}

export interface PHashInput {
	to: string;
	nonce: BigNumberish;
	module: string;
	data: string;
}

export interface GHashInput {
	to: string;
	tokenAddress: string;
	p: string;
	nonce: string;
}

export interface NHashInput {
	txHash: string;
	vOut: BigNumberish;
	nonce: string;
}

export interface GatewayAddressInput {
	isTest: boolean;
}

export interface DarknodeSignatureInput {
	p: string | PHashInput;
	n: string | NHashInput;
	amount: BigNumberish;
	to: string;
	tokenAddress: string;
}
