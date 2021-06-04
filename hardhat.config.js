require('hardhat-deploy');
require('hardhat-deploy-ethers');
require('hardhat-gas-reporter');

module.exports = {
  solidity: {
    compilers: [{
      version: '0.6.12'
    }, {
      version: '0.7.0',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }]
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/Mqiya0B-TaJ1qWsUKuqBtwEyFIbKGWoX",
        blockNumber: 12555982
      }
    }
  }
};
