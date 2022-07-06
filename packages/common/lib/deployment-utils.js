"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.getProvider = exports.getVanillaProvider = exports.RENVM_PROVIDERS = exports.RPC_ENDPOINTS = exports.CONTROLLER_DEPLOYMENTS = void 0;
const ethers_1 = require("ethers");
const chains_1 = require("@renproject/chains");
exports.CONTROLLER_DEPLOYMENTS = {
// [ethers.utils.getAddress(require('../../../../deployments/arbitrum/BadgerBridgeZeroController.json').address)]: 'Arbitrum',
// [ethers.utils.getAddress(require('../../../../deployments/avalanche/BadgerBridgeZeroController.json').address)]: 'Avalanche',
// [ethers.utils.getAddress(require('../../../../deployments/matic/BadgerBridgeZeroController.json').address)]: 'Polygon',
// [ethers.utils.getAddress(require('../../../../deployments/mainnet/BadgerBridgeZeroController.json').address)]: 'Ethereum',
};
exports.RPC_ENDPOINTS = {
    Arbitrum: 'https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
    Avalanche: 'https://api.avax.network/ext/bc/C/rpc',
    Polygon: 'https://polygon-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
    Ethereum: 'https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
};
exports.RENVM_PROVIDERS = {
    Arbitrum: chains_1.Arbitrum,
    Polygon: chains_1.Polygon,
    Ethereum: chains_1.Ethereum,
    Avalanche: chains_1.Avalanche,
};
const getVanillaProvider = (request) => {
    const checkSummedContractAddr = ethers_1.ethers.utils.getAddress(request.contractAddress);
    if (Object.keys(exports.CONTROLLER_DEPLOYMENTS).includes(checkSummedContractAddr)) {
        const chain_key = exports.CONTROLLER_DEPLOYMENTS[checkSummedContractAddr];
        const infuraKey = (() => {
            switch (chain_key) {
                case 'ethereum':
                    return 'mainnet';
                case 'polygon':
                    return 'matic';
                case 'arbitrum':
                    return chain_key;
            }
        })();
        if (infuraKey)
            return new ethers_1.ethers.providers.InfuraProvider(infuraKey, '816df2901a454b18b7df259e61f92cd2');
        return new ethers_1.ethers.providers.JsonRpcProvider(exports.RPC_ENDPOINTS[chain_key]);
    }
    else {
        throw new Error('Not a contract currently deployed: ' + checkSummedContractAddr);
    }
};
exports.getVanillaProvider = getVanillaProvider;
const getProvider = (transferRequest) => {
    const checkSummedContractAddr = ethers_1.ethers.utils.getAddress(transferRequest.contractAddress);
    const ethersProvider = (0, exports.getVanillaProvider)(transferRequest);
    const chain_key = exports.CONTROLLER_DEPLOYMENTS[checkSummedContractAddr];
    return exports.RENVM_PROVIDERS[chain_key](ethersProvider);
};
exports.getProvider = getProvider;
exports.logger = {
    debug(v) {
        console.error(v);
    },
};
//# sourceMappingURL=deployment-utils.js.map