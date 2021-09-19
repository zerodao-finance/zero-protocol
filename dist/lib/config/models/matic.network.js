"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaticNetwork = exports.TOKENS = void 0;
const network_1 = require("./network");
const tokens_1 = require("../tokens");
const network_2 = require("./network");
const TOKEN_MAP = {
    [tokens_1.SUPPORTED_TOKENS.DAI]: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    [tokens_1.SUPPORTED_TOKENS.USDC]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    [tokens_1.SUPPORTED_TOKENS.WBTC]: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    [tokens_1.SUPPORTED_TOKENS.MATIC]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    [tokens_1.SUPPORTED_TOKENS.ETH]: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
};
exports.TOKENS = [
    {
        name: tokens_1.SUPPORTED_TOKENS.MATIC,
        symbol: 'MATIC',
        address: TOKEN_MAP.MATIC,
        decimals: 18,
        route: [TOKEN_MAP.WBTC, TOKEN_MAP.ETH, TOKEN_MAP.MATIC],
    },
    {
        name: tokens_1.SUPPORTED_TOKENS.USDC,
        symbol: 'USDC',
        address: tokens_1.SUPPORTED_TOKENS.USDC,
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
    {
        name: tokens_1.SUPPORTED_TOKENS.ETH,
        symbol: 'ETH',
        address: TOKEN_MAP.ETH,
        decimals: 18,
        route: [TOKEN_MAP.WBTC, TOKEN_MAP.ETH],
    },
];
class MaticNetwork extends network_2.Network {
    constructor() {
        super(network_1.SUPPORTED_NETWORKS.ETH, network_1.NETWORK_IDS.ETH, 'Polygon', exports.TOKENS, exports.TOKENS[0]);
    }
}
exports.MaticNetwork = MaticNetwork;
//# sourceMappingURL=matic.network.js.map