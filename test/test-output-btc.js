"use strict";

const Badger = require("../lib/badger");
const ethers = require("ethers");
const fixtures = require("../lib/fixtures");

(async () => {
  const badger = Badger.makeCompute("1");
  const f = fixtures.ETHEREUM;
  console.log(
    ethers.utils.formatUnits(
      await badger.computeTransferOutput({
        amount: ethers.utils.parseUnits("0.1", 8),
        module: f.USDT,
      }),
      6
    )
  );
})().catch(console.error);
