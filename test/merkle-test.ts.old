import hre from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";
import GatewayLogicV1 from "../artifacts/contracts/test/GatewayLogicV1.sol/GatewayLogicV1.json";
import MerkleTree from "../lib/merkle/merkle-tree";
import { Buffer } from "buffer";
import BalanceTree from "../lib/merkle/balance-tree";

const deployParameters = require("../lib/fixtures");
const network = process.env.CHAIN || "ETHEREUM";

// @ts-expect-error
const { ethers, deployments } = hre;

// Step 1: validate deployment of all contracts
// Step 2: mint zBTC and test balance of all contracts
// Step 3: test adding address to merkle sdk and creating Merkle Contract
// Step 4: mint to all Merkle valid addresses
// Step 5: check balances of merkle valid addresses

const getContract = async (...args: any[]) => {
  try {
    return await ethers.getContract(...args);
  } catch (e) {
    console.error(e);
    return new ethers.Contract(
      ethers.constants.AddressZero,
      [],
      (await ethers.getSigners())[0]
    );
  }
};

const getContractFactory = async (...args: any[]) => {
  try {
    return await ethers.getContractFactory(...args);
  } catch (e) {
    return new ethers.ContractFactory("0x", [], (await ethers.getSigners())[0]);
  }
};

const getFixtures = async () => {
  const [signer, treasury, add1, add2, add3] = await ethers.getSigners();

  return {
    owner: signer,
    treasury: treasury,
    adrresses: [add1, add2, add3],
    signerAddress: await signer.getAddress(),
    zeroToken: await getContract("ZERO", signer),
    zeroDistributor: await getContractFactory("ZeroDistributor", signer),
    renBTC: new Contract(
      deployParameters[network]["renBTC"],
      GatewayLogicV1.abi,
      signer
    ),
    //@ts-ignore
    gateway: new Contract(
      deployParameters[network]["btcGateway"],
      GatewayLogicV1.abi,
      signer
    ),
  };
};

/**
 * Merkle Airdrop Client Functions
 */
function genLeaf(address, value) {
  console.log(typeof address, typeof value);
  console.log(
    ethers.utils.solidityKeccak256(["address", "uint256"], [address, value])
  );
  return Buffer.from(
    ethers.utils
      .solidityKeccak256(["address", "uint256"], [address, value])
      .slice(2),
    "hex"
  );
}

function balanceTreeFriendly(airdropList: Object, decimals: number) {
  const list = [];
  Object.entries(airdropList).map(([address, tokens]) => {
    list.push({
      account: address,
      amount: ethers.utils.parseUnits(tokens, decimals),
    });
  });
  return list;
}

/**
 * Testing ZERO airdrop
 */
describe("ZERO", () => {
  if (process.env.CHAIN !== "ETHEREUM") return;
  const config = {
    decimals: 18,
    airdrop: {
      "0xe32d9D1F1484f57F8b5198f90bcdaBC914de0B5A": "100",
      "0x7f78Da15E8298e7afe6404c54D93cb5269D97570": "100",
      "0xdd2fd4581271e230360230f9337d5c0430bf44c0": "100",
    },
  };

  const merkleTree = new MerkleTree(
    Object.entries(config.airdrop).map(([address, tokens]) =>
      genLeaf(
        ethers.utils.getAddress(address),
        ethers.utils.parseUnits(tokens.toString(), config.decimals)
      )
    )
  );

  before(async () => {
    await deployments.fixture();
    const { treasury, zeroDistributor, zeroToken } = await getFixtures();

    // Create Merkle
    const tree = new BalanceTree(
      balanceTreeFriendly(config.airdrop, config.decimals)
    );
    const hexRoot = tree.getHexRoot();

    // Mint and Deploy
    await zeroToken.mint(
      treasury.address,
      ethers.utils.parseUnits("88000000", config.decimals)
    );
    await zeroDistributor.deploy(zeroToken.address, treasury.address, hexRoot);
  });

  beforeEach(async function () {
    console.log("\n");
    const { zeroToken, treasury } = await getFixtures();
    //@ts-ignore
    console.log("=".repeat(32), "Beginning Test", "=".repeat(32));
    console.log("Test:", this.currentTest.title);
    console.log("\nTreasury Balance:");
    console.log(
      ethers.utils.formatUnits(
        await zeroToken.balanceOf(treasury.address),
        config.decimals
      )
    );
    console.log("\nAccount Balances:");
    console.log(
      "Account 1:",
      ethers.utils.formatUnits(
        await zeroToken.balanceOf(Object.keys(config.airdrop)[0]),
        config.decimals
      )
    );
    console.log(
      "Account 2:",
      ethers.utils.formatUnits(
        await zeroToken.balanceOf(Object.keys(config.airdrop)[1]),
        config.decimals
      )
    );
    console.log(
      "Account 3:",
      ethers.utils.formatUnits(
        await zeroToken.balanceOf(Object.keys(config.airdrop)[2]),
        config.decimals
      )
    );
  });

  it("should confirm the basic config", async () => {
    const [owner, treasury] = await ethers.getSigners();
    const { zeroDistributor, zeroToken } = await getFixtures();
    const distributor = await zeroDistributor.deploy(
      zeroToken.address,
      treasury.address,
      merkleTree.getHexRoot()
    );
    expect(await zeroToken.owner()).to.equal(owner.address);
    expect(
      Number(
        ethers.utils.formatUnits(
          await zeroToken.balanceOf(treasury.address),
          config.decimals
        )
      )
    ).to.equal(88000000);
    expect(
      await distributor.treasury(),
      "zero treasury is equal to the treasury"
    ).is.equal(treasury.address);
  });

  it("should get the merkle root and tree", async () => {
    console.log("\nMerkle Root:", merkleTree.getHexRoot());

    const tree = Object.entries(config.airdrop).map(([address, tokens]) =>
      genLeaf(
        ethers.utils.getAddress(address),
        ethers.utils.parseUnits(tokens.toString(), config.decimals).toString()
      )
    );

    console.log("\nTree:", tree);
  });

  it("should let a white listed address claim zero tokens", async () => {
    const [treasury] = await ethers.getSigners();
    const { zeroDistributor } = await getFixtures();
    const zeroToken = await ethers.getContract("ZERO", treasury);

    const tree = new BalanceTree(
      balanceTreeFriendly(config.airdrop, config.decimals)
    );
    const hexRoot = tree.getHexRoot();
    const distributor = await zeroDistributor.deploy(
      zeroToken.address,
      treasury.address,
      hexRoot
    );

    await ethers.getSigner(treasury.address);
    await zeroToken.approve(
      distributor.address,
      await zeroToken.balanceOf(treasury.address)
    );
    console.log(
      "\nAllowance",
      ethers.utils.formatUnits(
        await zeroToken.allowance(treasury.address, distributor.address),
        config.decimals
      )
    );

    let counter = 0;
    for (const key in config.airdrop) {
      console.log(`\n=== Account ${counter + 1} ===`);
      console.log("Key: ", key);
      console.log("Value: ", config.airdrop[key]);
      console.log(
        "\nCheck if claimed, pre-claim",
        await distributor.isClaimed(counter)
      );

      await zeroToken.approve(key, ethers.constants.MaxUint256);

      let leaf = genLeaf(
        ethers.utils.getAddress(key),
        ethers.utils.parseUnits(config.airdrop[key], config.decimals)
      );
      console.log("\nLeaf", leaf);

      let proof = tree.getProof(
        counter,
        key,
        ethers.utils.parseUnits(config.airdrop[key], config.decimals)
      );
      console.log("\nProof", proof);

      await distributor.claim(
        counter,
        key,
        ethers.utils
          .parseUnits(config.airdrop[key], config.decimals)
          .toString(),
        proof
      );

      console.log(
        "\nCheck if claimed, post-claim",
        await distributor.isClaimed(counter)
      );
      console.log(
        `Post-Claim Balance:`,
        ethers.utils.formatUnits(
          await zeroToken.balanceOf(key),
          config.decimals
        )
      );

      counter++;
    }
    console.log(
      "\nTreasury Post-Claim Balance:",
      ethers.utils.formatUnits(
        await zeroToken.balanceOf(treasury.address),
        config.decimals
      )
    );
  });
});
