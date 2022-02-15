'use strict';

const hre = require('hardhat');

module.exports = async () => {
  const [ signer ] = await hre.ethers.getSigners();
};
