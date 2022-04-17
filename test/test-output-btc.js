'use strict';

const badger = require('../dist/lib/badger');
const ethers = require('ethers');
const fixtures = require('../dist/lib/fixtures');

(async () => {
  console.log(await badger.computeOutputBTC({
    amount: ethers.utils.parseUnits('1000', 6),
    asset: fixtures.ETHEREUM.USDC
  }));
})().catch(console.error);
