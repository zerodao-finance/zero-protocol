import { BigNumberish } from '@ethersproject/bignumber';
//import { SignerWithAddress } from 'hardhat-deploy-ethers/dist/src/signer-with-address';
import { EIP712TypedData } from '@0x/types';

export interface GatewayAddressInput {
	isTest: boolean;
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

export interface DarknodeSignatureInput {
	p: string | PHashInput;
	n: string | NHashInput;
	amount: BigNumberish;
	to: string;
	tokenAddress: string;
}

// export type ConnectionTypes = ZeroConnection;

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
	public sign(signer: any, contractAddress: string): Promise<string>;
}

// export declare function createZeroConnection(address: string): Promise<ZeroConnection>;
// export declare function createZeroKeeper(connection: ZeroConnection): ZeroKeeper;
// export declare function createZeroUser(connection: ZeroConnection): ZeroUser;

export interface Request {
	requestType: "burn" | "transfer" | "meta"
	signature: string
	contractAddress: string
	[property: string]: any
}

export interface TransferRequest extends Request {
	module: string;
	to: string;
	underwriter: string;
	asset: string;
	nonce: BigNumberish;
	pNonce: BigNumberish;
	amount: BigNumberish;
	data: string;
}

export interface BurnRequest extends Request {
	asset: string;
	underwriter: string;
	owner: string
	deadline: string
	destination: any
	nonce: BigNumberish
	pNonce: BigNumberish

}

export interface MetaRequest extends Request {

}

export type RequestStates = "pending" | "failed" | "succeeded"

export type RequestWithStatus<T = Record<string, any>> = T & {
	status: RequestStates
}
