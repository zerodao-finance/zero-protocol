"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseTokenMapping = exports.tokenMapping = exports.selectFixture = void 0;
const fixtures_1 = __importDefault(require("./fixtures"));
const address_1 = require("@ethersproject/address");
const constants_1 = require("@ethersproject/constants");
const lodash_1 = __importDefault(require("lodash"));
function selectFixture(chainId) {
    switch (chainId) {
        case "42161":
            return fixtures_1.default.ARBITRUM;
        case "43114":
            return fixtures_1.default.AVALANCHE;
        case "137":
            return fixtures_1.default.MATIC;
        default:
            return fixtures_1.default.ETHEREUM;
    }
}
exports.selectFixture = selectFixture;
function tokenMapping({ tokenName, chainId }) {
    const fixture = selectFixture(chainId);
    switch (tokenName.toLowerCase()) {
        case "avax":
            return constants_1.AddressZero;
        case "eth":
            return constants_1.AddressZero;
        case "renbtc":
            return fixture.renBTC;
        case "wbtc":
            return fixture.WBTC;
        case "ibbtc":
            return fixture.ibBTC;
        case "usdc":
            return fixture.USDC;
    }
}
exports.tokenMapping = tokenMapping;
function reverseTokenMapping({ tokenAddress, chainId }) {
    const checksummedAddress = (0, address_1.isAddress)(tokenAddress)
        ? (0, address_1.getAddress)(String(tokenAddress))
        : "";
    const fixture = selectFixture(chainId);
    if (checksummedAddress == constants_1.AddressZero)
        return "ETH";
    let tokenName = lodash_1.default.findKey(fixture, function (v) { return (0, address_1.getAddress)(v) == checksummedAddress; });
    return tokenName;
}
exports.reverseTokenMapping = reverseTokenMapping;
//# sourceMappingURL=token.js.map