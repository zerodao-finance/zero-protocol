"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthNetwork = exports.TOKENS = void 0;
const network_1 = require("./network");
const tokens_1 = require("../tokens");
const network_2 = require("./network");
const TOKEN_MAP = {
    [tokens_1.SUPPORTED_TOKENS.DAI]: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    [tokens_1.SUPPORTED_TOKENS.USDC]: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    [tokens_1.SUPPORTED_TOKENS.WBTC]: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
    [tokens_1.SUPPORTED_TOKENS.BNB]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
};
exports.TOKENS = [
    {
        name: tokens_1.SUPPORTED_TOKENS.BNB,
        symbol: 'BNB',
        address: TOKEN_MAP.BNB,
        decimals: 18,
        route: [TOKEN_MAP.WBTC, TOKEN_MAP.BNB],
    },
    {
        name: tokens_1.SUPPORTED_TOKENS.USDC,
        symbol: 'USDC',
        address: TOKEN_MAP.USDC,
        decimals: 18,
        route: [TOKEN_MAP.WBTC, TOKEN_MAP.BNB, TOKEN_MAP.USDC],
    },
    {
        name: tokens_1.SUPPORTED_TOKENS.DAI,
        symbol: 'DAI',
        address: TOKEN_MAP.DAI,
        decimals: 18,
        route: [TOKEN_MAP.WBTC, TOKEN_MAP.BNB, TOKEN_MAP.DAI],
    },
    {
        name: tokens_1.SUPPORTED_TOKENS.WBTC,
        symbol: 'BTCB',
        address: TOKEN_MAP.WBTC,
        decimals: 18,
        route: [TOKEN_MAP.BNB, TOKEN_MAP.WBTC],
    },
];
class EthNetwork extends network_2.Network {
    constructor() {
        super(network_1.SUPPORTED_NETWORKS.ETH, network_1.NETWORK_IDS.ETH, 'Ethereum', exports.TOKENS, exports.TOKENS[0]);
    }
}
exports.EthNetwork = EthNetwork;
//# sourceMappingURL=bsc.network.js.map