var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _a;
import { NETWORK_IDS, SUPPORTED_NETWORKS } from './network';
import { SUPPORTED_TOKENS } from '../tokens';
import { Network } from './network';
var TOKEN_MAP = (_a = {},
    _a[SUPPORTED_TOKENS.ETH] = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    _a[SUPPORTED_TOKENS.DAI] = '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    _a[SUPPORTED_TOKENS.USDC] = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    _a[SUPPORTED_TOKENS.WBTC] = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    _a);
var TOKENS = [
    {
        name: SUPPORTED_TOKENS.ETH,
        symbol: 'ETH',
        address: TOKEN_MAP.ETH,
        decimals: 18,
        route: [TOKEN_MAP.WBTC, TOKEN_MAP.ETH],
    },
    {
        name: SUPPORTED_TOKENS.USDC,
        symbol: 'USDC',
        address: TOKEN_MAP.USDC,
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
        symbol: 'wBTC',
        address: TOKEN_MAP.WBTC,
        decimals: 8,
        route: [TOKEN_MAP.ETH, TOKEN_MAP.WBTC],
    },
];
var EthNetwork = /** @class */ (function (_super) {
    __extends(EthNetwork, _super);
    function EthNetwork() {
        return _super.call(this, SUPPORTED_NETWORKS.ETH, NETWORK_IDS.ETH, 'Ethereum', TOKENS, TOKENS[0]) || this;
    }
    return EthNetwork;
}(Network));
export { EthNetwork };
