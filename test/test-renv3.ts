const hre = require("hardhat");
//@ts-ignore
const { deployments } = hre;
import { ethers } from "ethers";
import { UnderwriterTransferRequest } from "../lib/UnderwriterRequest";
import { utils as renUtils } from "@renproject/utils";
var deployParameters = require("../lib/fixtures");
var deploymentUtils = require("../dist/lib/deployment-utils");
const { utils } = ethers;

const getContractName = () => {
  switch (process.env.CHAIN) {
    case "MATIC":
      return "BadgerBridgeZeroControllerMatic";
    case "ARBITRUM":
      return "BadgerBridgeZeroControllerArb";
    case "AVALANCHE":
      return "BadgerBridgeZeroControllerAvax";
    default:
      return "BadgerBridgeZeroController";
  }
};

const getController: () => Promise<ethers.Contract> = async () => {
  return await hre.ethers.getContract(getContractName());
};
describe("ren", () => {
  before(async () => {
    await deployments.fixture();
    //@ts-ignore
    process.env.HARDHAT_TEST = true;
    const [signer] = await hre.ethers.getSigners();
    const artifact = await deployments.getArtifact("MockGatewayLogicV1");
    //@ts-ignore
    await hre.network.provider.send("hardhat_setCode", [
      //@ts-ignore
      utils.getAddress(deployParameters[process.env.CHAIN].btcGateway),
      artifact.deployedBytecode,
    ]);
    const gateway = new hre.ethers.Contract(
      deployParameters[process.env.CHAIN].btcGateway,
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
      "0x"
    ); //mint renBTC to signer
    const renbtc = new hre.ethers.Contract(
      deployParameters[process.env.CHAIN].renBTC,
      ["function approve(address, uint256)"],
      signer
    );
    const renCrv = new hre.ethers.Contract(
      "0x93054188d876f558f4a66B2EF1d97d16eDf0895B",
      ["function exchange(int128, int128, uint256, uint256)"],
      signer
    );
    await renbtc.approve(renCrv.address, ethers.constants.MaxUint256);
    await renCrv.exchange(0, 1, ethers.utils.parseUnits("1", 8), 0);
    console.log("minted renBTC to signer");
    await hre.network.provider.send("hardhat_impersonateAccount", [
      "0xcf7346a5e41b0821b80d5b3fdc385eeb6dc59f44",
    ]);
    const governanceSigner = await hre.ethers.getSigner(
      "0xcf7346a5e41b0821b80d5b3fdc385eeb6dc59f44"
    );
    await signer.sendTransaction({
      value: utils.parseEther("0.1"),
      to: await governanceSigner.getAddress(),
    });
    await new hre.ethers.Contract(
      "0x41671BA1abcbA387b9b2B752c205e22e916BE6e3",
      ["function approveContractAccess(address)"],
      governanceSigner
    ).approveContractAccess((await getController()).address);
    await hre.network.provider.send("hardhat_impersonateAccount", [
      "0xb65cef03b9b89f99517643226d76e286ee999e77",
    ]);
    const settGovernanceSigner = await hre.ethers.getSigner(
      "0xb65cef03b9b89f99517643226d76e286ee999e77"
    );
    await signer.sendTransaction({
      value: utils.parseEther("0.1"),
      to: await settGovernanceSigner.getAddress(),
    });
    await new hre.ethers.Contract(
      "0x6def55d2e18486b9ddfaa075bc4e4ee0b28c1545",
      ["function approveContractAccess(address)"],
      settGovernanceSigner
    ).approveContractAccess((await getController()).address);
  });
  it("should test out renv3", async () => {
    const contractAddress = (await getController()).address;
    deploymentUtils.CONTROLLER_DEPLOYMENTS.Ethereum = contractAddress;
    const [signer] = await hre.ethers.getSigners();
    const { chainId } = await signer.provider.getNetwork();
    console.log(chainId);
    const transferRequest = new UnderwriterTransferRequest({
      contractAddress,
      nonce: renUtils.toNBytes("0x1", 32),
      to: await signer.getAddress(),
      pNonce: utils.hexlify(utils.randomBytes(32)),
      module: deployParameters[process.env.CHAIN].renBTC,
      amount: utils.hexlify(utils.parseUnits("0.0002", 8)),
      asset: deployParameters[process.env.CHAIN].WBTC,
      chainId,
      data: utils.defaultAbiCoder.encode(["uint256"], ["1"]),
      underwriter: contractAddress,
      network: "testnet",
    });
    transferRequest.requestType = "TRANSFER";
    console.log(process.env.NODE_ENV);
    await transferRequest.sign(signer);
    console.log("signed", transferRequest.signature);
    const gateway = await transferRequest.submitToRenVM();
    console.log("gateway:", gateway.gatewayAddress);
    const gateway2 = await (transferRequest as any)._ren.gateway(
      gateway.params
    );
    console.log(gateway2.gatewayAddress);
    await transferRequest.waitForSignature();
  });
});
