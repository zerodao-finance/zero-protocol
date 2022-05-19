const hre = require("hardhat");
const { UnderwriterTransferRequest } = require("../dist/lib/zero");
const path = require("path");
const { LevelDBPersistenceAdapter } = require("../lib/persistence/leveldb");

process.env.ZERO_PERSISTENCE_DB = path.join(process.env.HOME, ".keeper.db");
(async () => {
  const storage = new LevelDBPersistenceAdapter();
  const length = await storage.length();
  const execute = async (i = length - 1) => {
    const key = await storage.getKeyFromIndex(i);
    const request = await storage.get(key);
    const transferRequest = new UnderwriterTransferRequest(request);
    if (request.status !== "succeeded") {
      console.log("currently executing:", i);
      try {
        await transferRequest.repayStatic((await hre.ethers.getSigners())[0]);
        const tx = await transferRequest.repay(
          (
            await hre.ethers.getSigners()
          )[0],
          { gasLimit: 800000 }
        );
        console.log(await tx.wait());
        await storage.setStatus(key, "succeeded");
      } catch (e) {
        console.error(e);
      }
    }
    await execute(i - 1);
  };
  await execute();
})().catch((err) => console.error(err));
