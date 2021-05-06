require('hardhat-deploy');
require('hardhat-deploy-ethers');
require('hardhat-gas-reporter');

module.exports = {
  solidity: {
    version: '0.6.12',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
