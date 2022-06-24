const hre = require("hardhat");
const { TEST_KEEPER_ADDRESS } = require("../lib/mock");
const deployParameters = require("../lib/fixtures");
const validate = require("@openzeppelin/upgrades-core/dist/validate/index");
Object.defineProperty(validate, "assertUpgradeSafe", {
  value: () => {},
});
const { ethers, deployments, upgrades } = hre;
const getControllerName = () => {
  switch (process.env.CHAIN) {
    case "ARBITRUM":
      return "BadgerBridgeZeroControllerArb";
    case "ETHEREUM":
      return "BadgerBridgeZeroController";
    case "AVALANCHE":
      return "BadgerBridgeZeroControllerAvax";
    default:
      return "ZeroController";
  }
};
const isLocalhost = !hre.network.config.live;
const SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";

const getController = async () => {
  const name = getControllerName();
  const controller = await hre.ethers.getContract(name);
  return controller;
};

const network = process.env.CHAIN || "ETHEREUM";

module.exports = async ({ getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts(); //used as governance address
  const [ethersSigner] = await ethers.getSigners();
  const { provider } = ethersSigner;

  if (
    Number(ethers.utils.formatEther(await provider.getBalance(deployer))) === 0
  )
    await ethersSigner.sendTransaction({
      value: ethers.utils.parseEther("1"),
      to: deployer,
    });
  const { chainId } = await provider.getNetwork();
  if (hre.network.name === "hardhat") {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [SIGNER_ADDRESS],
    });
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [TEST_KEEPER_ADDRESS],
    });
    await ethersSigner.sendTransaction({
      value: ethers.utils.parseEther("0.5"),
      to: TEST_KEEPER_ADDRESS,
    });
  }
  const signer = await ethers.getSigner(SIGNER_ADDRESS);
  const [deployerSigner] = await ethers.getSigners();
  console.log("RUNNING");

  console.log("deploying controller");
  const zeroControllerFactory = await hre.ethers.getContractFactory(
    getControllerName(),
    {}
  );
  const zeroController = await upgrades.deployProxy(zeroControllerFactory, [
    deployer,
    deployer,
  ]);
  const zeroControllerArtifact = await deployments.getArtifact(
    getControllerName()
  );
  await deployments.save(getControllerName(), {
    contractName: getControllerName(),
    address: zeroController.address,
    bytecode: zeroControllerArtifact.bytecode,
    abi: zeroControllerArtifact.abi,
  });

  console.log("waiting on proxy deploy to mine ...");
  await zeroController.deployTransaction.wait();
};
