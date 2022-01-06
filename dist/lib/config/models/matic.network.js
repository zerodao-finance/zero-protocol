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
    _a[SUPPORTED_TOKENS.DAI] = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    _a[SUPPORTED_TOKENS.USDC] = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    _a[SUPPORTED_TOKENS.WBTC] = '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    _a[SUPPORTED_TOKENS.MATIC] = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    _a[SUPPORTED_TOKENS.ETH] = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    _a);
export var TOKENS = [
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
        symbol: 'wBTC',
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
var MaticNetwork = /** @class */ (function (_super) {
    __extends(MaticNetwork, _super);
    function MaticNetwork() {
        return _super.call(this, SUPPORTED_NETWORKS.ETH, NETWORK_IDS.ETH, 'Polygon', TOKENS, TOKENS[0]) || this;
    }
    return MaticNetwork;
}(Network));
export { MaticNetwork };
