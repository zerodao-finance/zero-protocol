import { Wallet } from 'ethers';

export interface GatewayAddressParams {
	from: 'btc';
	signer: Wallet;
	nonce?: string | Buffer;
	asset: string;
	module: string;
	data: string;
	pNonce: string | Buffer;
}
