"use strict";

const Badger = require("../lib/badger");
const ethers = require("ethers");
const fixtures = require("../lib/fixtures");

(async () => {
  const badger = Badger.makeCompute("137");
  const f = fixtures.AVALANCHE;
  console.log(
    ethers.utils.formatUnits(
      await badger.computeTransferOutput({
        amount: ethers.utils.parseUnits("0.1", 8),
        module: ethers.constants.AddressZero,
      }),
      18
    )
  );
})().catch(console.error);
