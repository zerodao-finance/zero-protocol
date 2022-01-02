var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
require('@nomiclabs/hardhat-ethers');
require('hardhat-deploy');
require('hardhat-deploy-ethers');
require('hardhat-gas-reporter');
require('@openzeppelin/hardhat-upgrades');
require('@nomiclabs/hardhat-etherscan');
require('dotenv').config();
const ethers = require('ethers');
if (!process.env.CHAIN_ID && process.env.CHAIN === 'ARBITRUM')
    process.env.CHAIN_ID = '42161';
const { override } = require('./lib/test/inject-mock');
const RPC_ENDPOINTS = {
    ARBITRUM: 'https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
    MATIC: 'https://polygon-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
    ETHEREUM: 'https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
};
const deployParameters = require('./lib/fixtures');
if (process.argv.slice(1).includes('node')) {
    (() => __awaiter(this, void 0, void 0, function* () {
        const artifact = require('./artifacts/contracts/test/MockGatewayLogicV1.sol/MockGatewayLogicV1');
        const getImplementation = (proxyAddress) => __awaiter(this, void 0, void 0, function* () {
            const provider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINTS[process.env.CHAIN]);
            return ethers.utils.getAddress((yield provider.getStorageAt(proxyAddress, '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc')).substr((yield provider.getNetwork()).chainId === 1337 ? 0 : 26));
        });
        const network = process.env.CHAIN || 'ARBITRUM';
        const implementationAddress = yield getImplementation(deployParameters[network]['btcGateway']);
        override(implementationAddress, artifact.deployedBytecode);
    }))().catch((err) => console.error(err));
}
const accounts = [
    process.env.WALLET || ethers.Wallet.createRandom().privateKey,
    process.env.UNDERWRITER || ethers.Wallet.createRandom().privateKey,
];
process.env.ETHEREUM_MAINNET_URL =
    process.env.ETHEREUM_MAINNET_URL || 'https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2';
const ETHERSCAN_API_KEYS = {
    ARBITRUM: '7PW6SPNBFYV1EM5E5NT36JW7ARMS1FB4HW',
    MATIC: 'I13U9EN9YQ9931GYK9CJYQS9ZF51D5Z1F9'
};
const ETHERSCAN_API_KEY = ETHERSCAN_API_KEYS[process.env.CHAIN || 'ARBITRUM'] || ETHERSCAN_API_KEYS['ARBITRUM'];
module.exports = {
    defaultNetwork: 'hardhat',
    abiExporter: {
        path: './abi',
        clear: false,
        flat: true,
    },
    networks: {
        mainnet: {
            url: process.env.ETHEREUM_MAINNET_URL,
            accounts,
            chainId: 1,
        },
        localhost: {
            live: false,
            saveDeployments: true,
            tags: ['development'],
        },
        hardhat: {
            live: false,
            saveDeployments: true,
            tags: ['development', 'test'],
            chainId: process.env.CHAIN_ID && Number(process.env.CHAIN_ID),
            forking: {
                enabled: process.env.FORKING === 'true',
                url: RPC_ENDPOINTS[process.env.CHAIN || 'ETHEREUM'],
            },
        },
        avalanche: {
            url: 'https://api.avax.network/ext/bc/C/rpc',
            accounts,
            chainId: 43114,
            live: true,
            saveDeployments: true,
            gasPrice: 470000000000,
        },
        matic: {
            url: 'https://rpc-mainnet.maticvigil.com',
            accounts,
            chainId: 137,
            live: true,
            saveDeployments: true,
        },
        arbitrum: {
            url: RPC_ENDPOINTS.ARBITRUM,
            accounts,
            chainId: 42161,
            live: true,
            saveDeployments: true,
            blockGasLimit: 700000,
        },
    },
    gasReporter: {
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        currency: 'USD',
        enabled: process.env.REPORT_GAS === 'true',
        excludeContracts: ['contracts/libraries/'],
    },
    solidity: {
        compilers: [
            {
                version: '0.5.16',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: '0.6.12',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: '0.7.6',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        underwriter: {
            default: 1,
        },
    },
    mocha: {
        timeout: 0,
        grep: process.env.GREP,
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
};
