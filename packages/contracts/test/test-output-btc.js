'use strict';

const badger = require('../dist/lib/badger');
const ethers = require('ethers');
const fixtures = require('../dist/lib/fixtures');

(async () => {
  console.log(await badger.computeOutputBTC({
    amount: ethers.utils.parseEther('1'),
    asset: ethers.constants.AddressZero
  }));
})().catch(console.error);
