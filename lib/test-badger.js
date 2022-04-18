'use strict';

const badger = require('./badger');
const ethers = require('ethers');
const fixtures = require('./fixtures');

(async () => {
  console.log(await badger.computeOutputBTC({
    amount: ethers.utils.parseUnits('1000', 6),
    asset: fixtures.ETHEREUM.USDC
  }));
})().catch(console.error);
