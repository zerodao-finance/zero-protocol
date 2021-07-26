export interface ZeroToken {
	name: SUPPORTED_TOKENS;
	symbol: string;
	address: string;
	decimals: number;
}

export enum SUPPORTED_TOKENS {
	USDC = 'USDC',
	DAI = 'DAI',
	ETH = 'Ethereum',
	WBTC = 'wBTC',
	MATIC = 'Matic',
	BNB = 'BNB',
}

export const ETH_TOKENS: ZeroToken[] = [
	{
		name: SUPPORTED_TOKENS.USDC,
		symbol: 'USDC',
		address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
		decimals: 6,
	},
	{
		name: SUPPORTED_TOKENS.DAI,
		symbol: 'DAI',
		address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
		decimals: 18,
	},
	{
		name: SUPPORTED_TOKENS.ETH,
		symbol: 'ETH',
		address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
		decimals: 18,
	},
	{
		name: SUPPORTED_TOKENS.WBTC,
		symbol: 'wBTC',
		address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
		decimals: 8,
	},
];

export const BSC_TOKENS: ZeroToken[] = [
	{
		name: SUPPORTED_TOKENS.USDC,
		symbol: 'USDC',
		address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
		decimals: 18,
	},
	{
		name: SUPPORTED_TOKENS.DAI,
		symbol: 'DAI',
		address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
		decimals: 18,
	},
	{
		name: SUPPORTED_TOKENS.BNB,
		symbol: 'BNB',
		address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
		decimals: 18,
	},
	{
		name: SUPPORTED_TOKENS.WBTC,
		symbol: 'BTCB',
		address: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
		decimals: 18,
	},
];

export const MATIC_TOKENS: ZeroToken[] = [
	{
		name: SUPPORTED_TOKENS.USDC,
		symbol: 'USDC',
		address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
		decimals: 6,
	},
	{
		name: SUPPORTED_TOKENS.DAI,
		symbol: 'DAI',
		address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
		decimals: 18,
	},
	{
		name: SUPPORTED_TOKENS.WBTC,
		symbol: 'wBTC',
		address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
		decimals: 8,
	},
	{
		name: SUPPORTED_TOKENS.ETH,
		symbol: 'ETH',
		address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
		decimals: 18,
	},
	{
		name: SUPPORTED_TOKENS.MATIC,
		symbol: 'MATIC',
		address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
		decimals: 18,
	},
];
