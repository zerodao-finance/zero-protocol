require('@nomiclabs/hardhat-ethers');
require('hardhat-deploy');
require('hardhat-deploy-ethers');
require('hardhat-gas-reporter');
require('@openzeppelin/hardhat-upgrades');
require('@nomiclabs/hardhat-etherscan');
require("dotenv").config();
const ethers = require('ethers');
const accounts = [
    process.env.WALLET || ethers.Wallet.createRandom().privateKey,
    process.env.UNDERWRITER || ethers.Wallet.createRandom().privateKey,
];
process.env.ETHEREUM_MAINNET_URL = process.env.ETHEREUM_MAINNET_URL || 'https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2';
const RPC_ENDPOINTS = {
    ARBITRUM: 'https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
    MATIC: 'https://polygon-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
    ETHEREUM: 'https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2'
};
module.exports = {
    defaultNetwork: 'hardhat',
    abiExporter: {
        path: "./abi",
        clear: false,
        flat: true,
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    },
    networks: {
        mainnet: {
            url: process.env.ETHEREUM_MAINNET_URL,
            accounts,
            chainId: 1
        },
        localhost: {
            live: false,
            saveDeployments: true,
            tags: ['development']
        },
        hardhat: {
            live: false,
            saveDeployments: true,
            tags: ['development', 'test'],
            forking: {
                enabled: process.env.FORKING === "true",
                url: RPC_ENDPOINTS[process.env.CHAIN || 'ETHEREUM']
            }
        },
        avalanche: {
            url: "https://api.avax.network/ext/bc/C/rpc",
            accounts,
            chainId: 43114,
            live: true,
            saveDeployments: true,
            gasPrice: 470000000000,
        },
        matic: {
            url: "https://rpc-mainnet.maticvigil.com",
            accounts,
            chainId: 137,
            live: true,
            saveDeployments: true,
        },
        arbitrum: {
            url: "https://arb1.arbitrum.io/rpc",
            accounts,
            chainId: 42161,
            live: true,
            saveDeployments: true,
            blockGasLimit: 700000,
        },
    },
    gasReporter: {
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        currency: "USD",
        enabled: process.env.REPORT_GAS === "true",
        excludeContracts: ["contracts/libraries/"],
    },
    solidity: {
        compilers: [{
                version: '0.5.16',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }, {
                version: '0.6.12',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }, {
                version: '0.7.6',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }]
    },
    namedAccounts: {
        deployer: {
            default: 0
        },
        underwriter: {
            default: 1
        }
    },
    mocha: {
        timeout: 0,
        grep: process.env.GREP
    }
};
