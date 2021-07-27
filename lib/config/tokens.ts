export interface ZeroToken {
	name: SUPPORTED_TOKENS;
	symbol: string;
	address: string;
	decimals: number;
	route: string[];
}

export enum SUPPORTED_TOKENS {
	USDC = 'USDC',
	DAI = 'DAI',
	ETH = 'Ethereum',
	WBTC = 'wBTC',
	MATIC = 'Matic',
	BNB = 'BNB',
}

export interface TokenMap {
	[address: string]: string;
}
