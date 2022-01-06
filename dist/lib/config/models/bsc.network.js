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
    _a[SUPPORTED_TOKENS.DAI] = '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    _a[SUPPORTED_TOKENS.USDC] = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    _a[SUPPORTED_TOKENS.WBTC] = '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
    _a[SUPPORTED_TOKENS.BNB] = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    _a);
export var TOKENS = [
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
var EthNetwork = /** @class */ (function (_super) {
    __extends(EthNetwork, _super);
    function EthNetwork() {
        return _super.call(this, SUPPORTED_NETWORKS.ETH, NETWORK_IDS.ETH, 'Ethereum', TOKENS, TOKENS[0]) || this;
    }
    return EthNetwork;
}(Network));
export { EthNetwork };
