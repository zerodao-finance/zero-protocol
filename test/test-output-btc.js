"use strict";

const Badger = require("../lib/badger");
const ethers = require("ethers");
const fixtures = require("../lib/fixtures");

(async () => {
  const badger = Badger.makeCompute("1");
  console.log(
    ethers.utils.formatUnits(
      await badger.computeOutputBTC({
        amount: ethers.utils.parseEther("1"),
        asset: ethers.constants.AddressZero,
      }),
      8
    )
  );
})().catch(console.error);
