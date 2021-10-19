require('@nomiclabs/hardhat-ethers');
require('hardhat-deploy');
require('hardhat-deploy-ethers');
//require('hardhat-gas-reporter');
require('@openzeppelin/hardhat-upgrades');
//if (process.env.CHAIN === 'MATIC') require('ethers').providers.BaseProvider.prototype.getGasPrice = require('ethers-polygongastracker').createGetGasPrice('rapid');
const forks = {
    MATIC: "https://polygon-mainnet.g.alchemy.com/v2/8_zmSL_WeJCxMIWGNugMkRgphmOCftMm",
    ETHEREUM: "https://eth-mainnet.alchemyapi.io/v2/Mqiya0B-TaJ1qWsUKuqBtwEyFIbKGWoX"
};
const ethers = require('ethers');
const forkingUrl = forks[process.env.CHAIN || "MATIC"];
module.exports = {
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
    namedAccounts: { deployer: 0 },
    networks: {
        hardhat: {
            forking: {
                url: forkingUrl
            }
        },
        matic: {
            url: "https://polygon-mainnet.g.alchemy.com/v2/8_zmSL_WeJCxMIWGNugMkRgphmOCftMm",
            accounts: [process.env.WALLET || ethers.Wallet.createRandom().privateKey],
            gas: 10000000
        },
        localhost: {
            url: 'http://localhost:8545',
            chainId: 1337
        }
    },
    mocha: {
        timeout: 0,
        grep: process.env.GREP
    },
    etherscan: {
        url: 'https://api.polygonscan.com/',
        apiKey: 'I13U9EN9YQ9931GYK9CJYQS9ZF51D5Z1F9'
    }
};
//# sourceMappingURL=hardhat.config.js.map