require('@nomiclabs/hardhat-ethers');
require('hardhat-deploy');
require('hardhat-deploy-ethers');
//require('hardhat-gas-reporter');
require('@openzeppelin/hardhat-upgrades');
require('@nomiclabs/hardhat-etherscan');
const ethers = require('ethers');


if (process.env.CHAIN === 'MATIC') require('ethers').providers.BaseProvider.prototype.getGasPrice = require('ethers-polygongastracker').createGetGasPrice('rapid');

var forkingUrl = "https://polygon-mainnet.g.alchemy.com/v2/8_zmSL_WeJCxMIWGNugMkRgphmOCftMm"
switch (process.env.CHAIN) {
  case 'ETHEREUM':
    forkingUrl = "https://eth-mainnet.alchemyapi.io/v2/Mqiya0B-TaJ1qWsUKuqBtwEyFIbKGWoX"
  case 'FORK':
    forkingUrl = "http://127.0.0.1:8545"
}

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
}
