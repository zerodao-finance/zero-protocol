import { NETWORK_IDS, SUPPORTED_NETWORKS } from './network';
import { SUPPORTED_TOKENS } from '../tokens';
import { Network } from './network';
const TOKEN_MAP = {
    [SUPPORTED_TOKENS.DAI]: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    [SUPPORTED_TOKENS.USDC]: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    [SUPPORTED_TOKENS.WBTC]: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
    [SUPPORTED_TOKENS.BNB]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
};
export const TOKENS = [
    {
        name: SUPPORTED_TOKENS.BNB,
        symbol: 'BNB',
        address: TOKEN_MAP.BNB,
        decimals: 18,
        route: [TOKEN_MAP.WBTC, TOKEN_MAP.BNB],
    },
    {
        name: SUPPORTED_TOKENS.USDC,
        symbol: 'USDC',
        address: TOKEN_MAP.USDC,
        decimals: 18,
        route: [TOKEN_MAP.WBTC, TOKEN_MAP.BNB, TOKEN_MAP.USDC],
    },
    {
        name: SUPPORTED_TOKENS.DAI,
        symbol: 'DAI',
        address: TOKEN_MAP.DAI,
        decimals: 18,
        route: [TOKEN_MAP.WBTC, TOKEN_MAP.BNB, TOKEN_MAP.DAI],
    },
    {
        name: SUPPORTED_TOKENS.WBTC,
        symbol: 'BTCB',
        address: TOKEN_MAP.WBTC,
        decimals: 18,
        route: [TOKEN_MAP.BNB, TOKEN_MAP.WBTC],
    },
];
export class EthNetwork extends Network {
    constructor() {
        super(SUPPORTED_NETWORKS.ETH, NETWORK_IDS.ETH, 'Ethereum', TOKENS, TOKENS[0]);
    }
}
//# sourceMappingURL=bsc.network.js.map