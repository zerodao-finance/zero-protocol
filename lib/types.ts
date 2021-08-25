import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

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
	mpkh: string;
	destination: string;
	isTest: boolean;
}

export interface DarknodeSignatureInput {
	p: string | PHashInput;
	n: string | NHashInput;
	amount: BigNumberish;
	to: string;
	tokenAddress: string;
}
