"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthNetwork = void 0;
const network_1 = require("./network");
const tokens_1 = require("../tokens");
const network_2 = require("./network");
const TOKEN_MAP = {
    [tokens_1.SUPPORTED_TOKENS.ETH]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    [tokens_1.SUPPORTED_TOKENS.DAI]: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    [tokens_1.SUPPORTED_TOKENS.USDC]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    [tokens_1.SUPPORTED_TOKENS.WBTC]: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
};
const TOKENS = [
    {
        name: tokens_1.SUPPORTED_TOKENS.ETH,
        symbol: 'ETH',
        address: TOKEN_MAP.ETH,
        decimals: 18,
        route: [TOKEN_MAP.WBTC, TOKEN_MAP.ETH],
    },
    {
        name: tokens_1.SUPPORTED_TOKENS.USDC,
        symbol: 'USDC',
        address: TOKEN_MAP.USDC,
        decimals: 6,
        route: [TOKEN_MAP.WBTC, TOKEN_MAP.ETH, TOKEN_MAP.USDC],
    },
    {
        name: tokens_1.SUPPORTED_TOKENS.DAI,
        symbol: 'DAI',
        address: TOKEN_MAP.DAI,
        decimals: 18,
        route: [TOKEN_MAP.WBTC, TOKEN_MAP.ETH, TOKEN_MAP.DAI],
    },
    {
        name: tokens_1.SUPPORTED_TOKENS.WBTC,
        symbol: 'wBTC',
        address: TOKEN_MAP.WBTC,
        decimals: 8,
        route: [TOKEN_MAP.ETH, TOKEN_MAP.WBTC],
    },
];
class EthNetwork extends network_2.Network {
    constructor() {
        super(network_1.SUPPORTED_NETWORKS.ETH, network_1.NETWORK_IDS.ETH, 'Ethereum', TOKENS, TOKENS[0]);
    }
}
exports.EthNetwork = EthNetwork;
