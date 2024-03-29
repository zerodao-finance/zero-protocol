import { ethers, BigNumber, utils } from "ethers";
const hre = require("hardhat");
const { deployments } = hre;
const { UnderwriterTransferRequest, UnderwriterBurnRequest } = require("../");
const { enableGlobalMockRuntime } = require("../dist/lib/mock");
import { signTypedDataUtils } from "@0x/utils";
const badger = require("../lib/badger");
var deployParameters = require("../lib/fixtures");
var deploymentUtils = require("../dist/lib/deployment-utils");

enableGlobalMockRuntime();

const produceTestSignature = async () => {
  return await ethers.Wallet.createRandom().signMessage("test");
};
UnderwriterTransferRequest.prototype.waitForSignature = async function () {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    //@ts-ignore
    amount: ethers.BigNumber.from(this.amount)
      .sub(ethers.utils.parseUnits("0.0015", 8))
      .toString(),
    //@ts-ignore
    nHash: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
    //@ts-ignore
    signature: await produceTestSignature(),
  };
};

const getRepl = async (o) => {
  const r = require("repl").start("> ");
  Object.assign(r.context, o || {});
  await new Promise(() => {});
};

const getContractName = () => {
  switch (process.env.CHAIN) {
    default:
      return "RenZECController";
  }
};

const getController: () => Promise<ethers.Contract> = async () => {
  return await hre.ethers.getContract(getContractName());
};

const signETH = async function (signer, params = {}) {
  const { data, contractAddress, amount, destination } = this;
  let minOut = "1";
  if (data && data.length > 2)
    minOut = ethers.utils.defaultAbiCoder.decode(["uint256"], data)[0];
  const contract = new ethers.Contract(
    contractAddress,
    ["function burnETH(uint256, bytes) payable"],
    signer
  );
  return await contract.burnETH(minOut, destination, {
    value: amount,
    ...params,
  });
};

describe("ZEC Controller", () => {
  before(async () => {
    await deployments.fixture();
    const [signer] = await hre.ethers.getSigners();
    const artifact = await deployments.getArtifact("MockGatewayLogicV1");
    //@ts-ignore
    await hre.network.provider.send("hardhat_setCode", [
      //@ts-ignore
      utils.getAddress(deployParameters[process.env.CHAIN].zecGateway),
      artifact.deployedBytecode,
    ]);
    const gateway = new hre.ethers.Contract(
      deployParameters[process.env.CHAIN].zecGateway,
      [
        "function mint(bytes32, uint256, bytes32, bytes) returns (uint256)",
        "function mintFee() view returns (uint256)",
      ],
      signer
    );
    await gateway.mint(
      utils.randomBytes(32),
      utils.parseUnits("50", 8),
      utils.randomBytes(32),
      await produceTestSignature()
    ); //mint renBTC to signer
    const renbtc = new hre.ethers.Contract(
      deployParameters[process.env.CHAIN].renZEC,
      ["function approve(address, uint256)"],
      signer
    );
    console.log("minted renZEC to signer");
    await hre.network.provider.send("hardhat_impersonateAccount", [
      "0xcf7346a5e41b0821b80d5b3fdc385eeb6dc59f44",
    ]);
  });
  it("should do a transfer of renzec", async () => {
    const contractAddress = (await getController()).address;
    deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
    const [signer] = await hre.ethers.getSigners();
    const { chainId } = await signer.provider.getNetwork();
    console.log(chainId);
    const transferRequest = new UnderwriterTransferRequest({
      contractAddress,
      nonce: utils.hexlify(utils.randomBytes(32)),
      to: await signer.getAddress(),
      pNonce: utils.hexlify(utils.randomBytes(32)),
      module: deployParameters[process.env.CHAIN].renZEC,
      amount: utils.hexlify(utils.parseUnits("0.005", 8)),
      asset: deployParameters[process.env.CHAIN].WBTC,
      chainId,
      data: utils.defaultAbiCoder.encode(["uint256"], ["1"]),
      underwriter: contractAddress,
    });
    transferRequest.requestType = "TRANSFER";
    await transferRequest.sign(signer);
    console.log("signed", transferRequest.signature);
    const tx = await transferRequest.repay(signer);
    console.log("Gas Used:", (await tx.wait()).gasUsed.toString());
  });
  it("should do a renzec burn", async () => {
    const contractAddress = (await getController()).address;
    deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
    const [signer] = await hre.ethers.getSigners();
    const { chainId } = await signer.provider.getNetwork();
    console.log(chainId);
    const transferRequest = new UnderwriterBurnRequest({
      contractAddress,
      owner: await signer.getAddress(),
      amount: utils.hexlify(utils.parseUnits("0.005", 8)),
      asset: deployParameters[process.env.CHAIN].renZEC,
      chainId,
      underwriter: contractAddress,
      deadline: Math.floor((+new Date() + 1000 * 60 * 60 * 24) / 1000),
      destination: utils.hexlify(utils.randomBytes(64)),
      data: utils.defaultAbiCoder.encode(["uint256"], ["1"]),
    });
    console.log(transferRequest);
    const { sign, toEIP712 } = transferRequest;
    transferRequest.requestType = "BURN";
    await transferRequest.sign(signer, contractAddress);
    console.log("signed", transferRequest.signature);
    const tx = await transferRequest.burn(signer);
    console.log("Gas Used:", (await tx.wait()).gasUsed.toString());
  });
  it("should do a transfer of eth", async () => {
    const contractAddress = (await getController()).address;
    deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
    const [signer] = await hre.ethers.getSigners();
    const { chainId } = await signer.provider.getNetwork();
    const transferRequest = new UnderwriterTransferRequest({
      contractAddress,
      nonce: utils.hexlify(utils.randomBytes(32)),
      to: await signer.getAddress(),
      pNonce: utils.hexlify(utils.randomBytes(32)),
      module: ethers.constants.AddressZero,
      amount: utils.hexlify(utils.parseUnits("0.5", 8)),
      asset: deployParameters[process.env.CHAIN].WBTC,
      chainId,
      data: utils.defaultAbiCoder.encode(["uint256"], ["1"]),
      underwriter: contractAddress,
    });
    transferRequest.requestType = "TRANSFER";
    await transferRequest.sign(signer);
    console.log("signed", transferRequest.signature);
    const tx = await transferRequest.repay(signer);
    console.log("Gas Used:", (await tx.wait()).gasUsed.toString());
  });
  it("should do a eth burn", async () => {
    const contractAddress = (await getController()).address;
    deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
    const [signer] = await hre.ethers.getSigners();
    const { chainId } = await signer.provider.getNetwork();
    const transferRequest = new UnderwriterBurnRequest({
      contractAddress,
      owner: await signer.getAddress(),
      amount: utils.hexlify(utils.parseUnits("1", 18)),
      asset: ethers.constants.AddressZero,
      chainId,
      underwriter: contractAddress,
      deadline: Math.floor((+new Date() + 1000 * 60 * 60 * 24) / 1000),
      destination: ethers.utils.hexlify(utils.randomBytes(64)).toString(),
      data: utils.defaultAbiCoder.encode(["uint256"], ["1"]),
    });
    console.log(transferRequest.data);
    transferRequest.sign = signETH;
    transferRequest.requestType = "BURN";
    const tx = await transferRequest.sign(signer);
    console.log("Gas Used:", (await tx.wait()).gasUsed.toString());
  });
  it("should test burnApproved", async () => {
    const contractAddress = (await getController()).address;
    deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
    const [signer] = await hre.ethers.getSigners();
    const { chainId } = await signer.provider.getNetwork();
    const Dummy = await hre.deployments.deploy("DummyBurnCaller", {
      from: await signer.getAddress(),
      args: [contractAddress, deployParameters[process.env.CHAIN].renZEC],
    });
    const renbtc = new ethers.Contract(
      deployParameters[process.env.CHAIN].renZEC,
      ["function transfer(address, uint256)"],
      signer
    );
    await renbtc.transfer(
      Dummy.receipt.contractAddress,
      utils.hexlify(utils.parseUnits("0.1", 8))
    );
    const transferRequest = new UnderwriterTransferRequest({
      contractAddress,
      nonce: utils.hexlify(utils.randomBytes(32)),
      to: await signer.getAddress(),
      pNonce: utils.hexlify(utils.randomBytes(32)),
      module: deployParameters[process.env.CHAIN].renZEC,
      amount: utils.hexlify(utils.parseUnits("0.1", 8)),
      asset: deployParameters[process.env.CHAIN].WBTC,
      chainId,
      data: utils.defaultAbiCoder.encode(["uint256"], ["1"]),
      underwriter: contractAddress,
    });
    transferRequest.requestType = "TRANSFER";
    await transferRequest.sign(signer);
    console.log("signed", transferRequest.signature);
    const tx = await transferRequest.repay(signer);
    const burnRequest = new UnderwriterBurnRequest({
      contractAddress: Dummy.receipt.contractAddress,
      owner: await signer.getAddress(),
      amount: utils.hexlify(utils.parseUnits("0.1", 8)),
      asset: deployParameters[process.env.CHAIN].renZEC,
      chainId,
      underwriter: contractAddress,
      deadline: Math.floor((+new Date() + 1000 * 60 * 60 * 24) / 1000),
      destination: utils.hexlify(utils.randomBytes(64)),
      data: utils.defaultAbiCoder.encode(["uint256"], ["1"]),
    });
    transferRequest.requestType = "BURN";
    await burnRequest.sign(signer, Dummy.receipt.contractAddress);
    const dummy = new ethers.Contract(
      Dummy.receipt.contractAddress,
      Dummy.abi,
      signer
    );
    await dummy.callBurn(
      contractAddress,
      await signer.getAddress(),
      burnRequest.asset,
      burnRequest.amount,
      burnRequest.getExpiry(),
      burnRequest.signature,
      burnRequest.destination
    );
  });
  it("should test earn", async () => {
    await (await getController()).earn();
  });
});
