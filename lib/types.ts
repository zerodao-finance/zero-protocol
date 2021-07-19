import BigNumber from 'bignumber.js';

export interface TransferRequest {
	module: any;
	to: string;
	underwriter: string;
	asset: string;
	nonce: number;
	pNonce: number;
	amount: BigNumber;
	data: any;
}
