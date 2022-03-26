"use strict";
exports.__esModule = true;
exports.logger = exports.getProvider = exports.getChainKey = exports.RENVM_PROVIDERS = exports.RPC_ENDPOINTS = exports.CONTROLLER_DEPLOYMENTS = void 0;
//import './silence-init';
require("@ethersproject/wallet");
require("@ethersproject/abstract-signer");
require("@ethersproject/hash");
var ethers_1 = require("ethers");
var chains_1 = require("@renproject/chains");
exports.CONTROLLER_DEPLOYMENTS = {
    Arbitrum: require('../deployments/arbitrum/ZeroController').address,
    Polygon: require('../deployments/matic/ZeroController').address,
    Ethereum: ethers_1.ethers.constants.AddressZero
};
exports.RPC_ENDPOINTS = {
    Arbitrum: 'https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
    Polygon: 'https://polygon-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
    Ethereum: 'https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2'
};
exports.RENVM_PROVIDERS = {
    Arbitrum: chains_1.Arbitrum,
    Polygon: chains_1.Polygon,
    Ethereum: chains_1.Ethereum
};
// very band-aid solution - needs to be changed later
function getChainKey(chain) {
    switch (chain) {
        case 'MATIC':
            return 'Polygon';
        case 'MAINNET':
            return 'Ethereum';
        case 'ARBITRUM':
            return 'Arbitrum';
    }
}
exports.getChainKey = getChainKey;
var getProvider = function (transferRequest) {
    var chain = process.env.CHAIN
        ? Object.entries(exports.CONTROLLER_DEPLOYMENTS).find(function (_a) {
            var k = _a[0], v = _a[1];
            return transferRequest.contractAddress.toLowerCase() === v.toLowerCase();
        })
        : 'none';
    var chain_key = process.env.CHAIN ? getChainKey(process.env.CHAIN) : chain[0];
    return exports.RENVM_PROVIDERS[chain_key](new ethers_1.ethers.providers.JsonRpcProvider(exports.RPC_ENDPOINTS[chain_key]), 'mainnet');
};
exports.getProvider = getProvider;
exports.logger = {
    debug: function (v) {
        console.error(v);
    }
};
