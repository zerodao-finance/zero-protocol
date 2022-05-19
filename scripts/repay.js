const hre = require("hardhat");
const { UnderwriterTransferRequest } = require("../dist/lib/zero");
const path = require("path");
const { LevelDBPersistenceAdapter } = require("../lib/persistence/leveldb");

process.env.ZERO_PERSISTENCE_DB = path
  .join(
    process.env.HOME,
    ".keeper.db"
  )(async () => {
    const storage = new LevelDBPersistenceAdapter();
    const length = await storage.length();
    const execute = async (i = length) => {
      const key = await storage.getKeyFromIndex(i);
      const transferRequest = new UnderwriterTransferRequest(
        await storage.get(key)
      );

      console.log(transferRequest);
      // const tx = await transferRequest.repay(
      //   (
      //     await hre.ethers.getSigners()
      //   )[0],
      //   { gasLimit: 800000 }
      // );
      // console.log(await tx.wait());
      // await execute(i - 1)
    };
    await execute();
  })()
  .catch((err) => console.error(err));
