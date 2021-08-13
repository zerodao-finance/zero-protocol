import { Contract, Wallet } from 'ethers';

export interface GatewayAddressParams {
	from: 'btc';
	to: string;
	signer: Wallet;
	nonce?: string | Buffer;
	asset: string;
	module: string;
	data: string;
	pNonce: string | Buffer;
}

export interface ZeroContracts {
	[index: string]: Contract;
}

export interface ZeroArtifacts {
	[index: string]:
		| {
				address: string;
				abi: any[];
		  }
		| undefined;
}
