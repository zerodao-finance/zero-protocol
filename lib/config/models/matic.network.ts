import { NETWORK_IDS, SUPPORTED_NETWORKS } from './network';
import { SUPPORTED_TOKENS, TokenMap, ZeroToken } from '../tokens';
import { Network } from './network';

const TOKEN_MAP: TokenMap = {
	[SUPPORTED_TOKENS.DAI]: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
	[SUPPORTED_TOKENS.USDC]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
	[SUPPORTED_TOKENS.WBTC]: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
	[SUPPORTED_TOKENS.MATIC]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
	[SUPPORTED_TOKENS.ETH]: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
};

export const TOKENS: ZeroToken[] = [
	{
		name: SUPPORTED_TOKENS.MATIC,
		symbol: 'MATIC',
		address: TOKEN_MAP.MATIC,
		decimals: 18,
		route: [TOKEN_MAP.WBTC, TOKEN_MAP.ETH, TOKEN_MAP.MATIC],
	},
	{
		name: SUPPORTED_TOKENS.USDC,
		symbol: 'USDC',
		address: SUPPORTED_TOKENS.USDC,
		decimals: 6,
		route: [TOKEN_MAP.WBTC, TOKEN_MAP.ETH, TOKEN_MAP.USDC],
	},
	{
		name: SUPPORTED_TOKENS.DAI,
		symbol: 'DAI',
		address: TOKEN_MAP.DAI,
		decimals: 18,
		route: [TOKEN_MAP.WBTC, TOKEN_MAP.ETH, TOKEN_MAP.DAI],
	},
	{
		name: SUPPORTED_TOKENS.WBTC,
		symbol: 'WBTC',
		address: TOKEN_MAP.WBTC,
		decimals: 8,
		route: [TOKEN_MAP.ETH, TOKEN_MAP.WBTC],
	},
	{
		name: SUPPORTED_TOKENS.ETH,
		symbol: 'ETH',
		address: TOKEN_MAP.ETH,
		decimals: 18,
		route: [TOKEN_MAP.WBTC, TOKEN_MAP.ETH],
	},
];

export class MaticNetwork extends Network {
	constructor() {
		super(SUPPORTED_NETWORKS.ETH, NETWORK_IDS.ETH, 'Polygon', TOKENS, TOKENS[0]);
	}
}
