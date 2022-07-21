"use strict";
var _a;
exports.__esModule = true;
exports.logger = exports.getProvider = exports.getVanillaProvider = exports.RENVM_PROVIDERS = exports.RPC_ENDPOINTS = exports.CONTROLLER_DEPLOYMENTS = void 0;
//import './silence-init';
require("@ethersproject/wallet");
require("@ethersproject/abstract-signer");
require("@ethersproject/hash");
var ethers_1 = require("ethers");
var chains_1 = require("@renproject/chains");
exports.CONTROLLER_DEPLOYMENTS = (_a = {},
    _a[ethers_1.ethers.utils.getAddress(require("../deployments/arbitrum/BadgerBridgeZeroController.json").address)] = "Arbitrum",
    _a[ethers_1.ethers.utils.getAddress(require("../deployments/avalanche/BadgerBridgeZeroController.json").address)] = "Avalanche",
    _a[ethers_1.ethers.utils.getAddress(require("../deployments/matic/BadgerBridgeZeroController.json").address)] = "Polygon",
    _a[ethers_1.ethers.utils.getAddress(require("../deployments/mainnet/BadgerBridgeZeroController.json").address)] = "Ethereum",
    _a[ethers_1.ethers.utils.getAddress(require("../deployments/optimism/BadgerBridgeZeroController.json").address)] = "Optimism",
    _a);
exports.RPC_ENDPOINTS = {
    Arbitrum: "https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2",
    Avalanche: "https://api.avax.network/ext/bc/C/rpc",
    Polygon: "https://polygon-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2",
    Ethereum: "https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2",
    Optimism: "https://optimism-mainnet.infura.io/v3/ca0da016dedf4c5a9ee90bfdbafee233",
    localhost: "http://localhost:8545"
};
exports.RENVM_PROVIDERS = {
    Arbitrum: chains_1.Arbitrum,
    Polygon: chains_1.Polygon,
    Ethereum: chains_1.Ethereum,
    Avalanche: chains_1.Avalanche,
    Optimism: chains_1.Optimism
};
var getVanillaProvider = function (request) {
    var checkSummedContractAddr = ethers_1.ethers.utils.getAddress(request.contractAddress);
    if (Object.keys(exports.CONTROLLER_DEPLOYMENTS).includes(checkSummedContractAddr)) {
        var chain_key_1 = exports.CONTROLLER_DEPLOYMENTS[checkSummedContractAddr];
        var infuraKey = (function () {
            switch (chain_key_1) {
                case "ethereum":
                    return "mainnet";
                case "polygon":
                    return "matic";
                case "arbitrum":
                    return chain_key_1;
            }
        })();
        if (infuraKey)
            return new ethers_1.ethers.providers.InfuraProvider(infuraKey, "816df2901a454b18b7df259e61f92cd2");
        return new ethers_1.ethers.providers.JsonRpcProvider(exports.RPC_ENDPOINTS[chain_key_1]);
    }
    else {
        if (process.env.HARDHAT_TEST) {
            exports.CONTROLLER_DEPLOYMENTS[checkSummedContractAddr] = "localhost";
            return new ethers_1.ethers.providers.JsonRpcProvider(exports.RPC_ENDPOINTS.localhost);
        }
        throw new Error("Not a contract currently deployed: " + checkSummedContractAddr);
    }
};
exports.getVanillaProvider = getVanillaProvider;
var getProvider = function (transferRequest) {
    var checkSummedContractAddr = ethers_1.ethers.utils.getAddress(transferRequest.contractAddress);
    var ethersProvider = (0, exports.getVanillaProvider)(transferRequest);
    var chain_key = exports.CONTROLLER_DEPLOYMENTS[checkSummedContractAddr];
    if (chain_key == "localhost")
        return new exports.RENVM_PROVIDERS.Ethereum({
            network: "mainnet",
            provider: ethersProvider
        });
    return new exports.RENVM_PROVIDERS[chain_key]({
        provider: ethersProvider,
        network: "mainnet"
    });
};
exports.getProvider = getProvider;
exports.logger = {
    debug: function (v) {
        console.error(v);
    }
};
