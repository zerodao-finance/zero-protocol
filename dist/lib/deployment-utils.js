"use strict";
var _a;
exports.__esModule = true;
exports.logger = exports.getProvider = exports.RENVM_PROVIDERS = exports.RPC_ENDPOINTS = exports.CONTROLLER_DEPLOYMENTS = void 0;
//import './silence-init';
require("@ethersproject/wallet");
require("@ethersproject/abstract-signer");
require("@ethersproject/hash");
var ethers_1 = require("ethers");
var chains_1 = require("@renproject/chains");
exports.CONTROLLER_DEPLOYMENTS = (_a = {},
    _a[require('../deployments/arbitrum/ZeroController').address] = 'Arbitrum',
    _a[require('../deployments/matic/ZeroController').address] = 'Polygon',
    _a[require('../deployments/mainnet/BadgerBridgeZeroController.json').address] = 'Ethereum',
    _a);
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
var getProvider = function (transferRequest) {
    if (Object.keys(exports.CONTROLLER_DEPLOYMENTS).includes(transferRequest.contractAddress)) {
        var chain_key = exports.CONTROLLER_DEPLOYMENTS[transferRequest.contractAddress];
        return exports.RENVM_PROVIDERS[chain_key](new ethers_1.ethers.providers.JsonRpcProvider(exports.RPC_ENDPOINTS[chain_key]), 'mainnet');
    }
    else {
        throw new Error('Not a contract currently deployed');
    }
};
exports.getProvider = getProvider;
exports.logger = {
    debug: function (v) {
        console.error(v);
    }
};
