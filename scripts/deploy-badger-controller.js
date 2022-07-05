const { deployments, ethers: hreEthers } = require("hardhat");
const ethers = require("ethers");
const { mixinGetGasPrice } = require("ethers-gasnow");
const fs = require("fs");

const getControllerName = () => {
  switch (process.env.CHAIN) {
    case "ARBITRUM":
      return "BadgerBridgeZeroControllerArb";
    case "AVALANCHE":
      return "BadgerBridgeZeroControllerAvax";
    case "MATIC":
      return "BadgerBridgeZeroControllerMatic";
    default:
      mixinGetGasPrice(ethers.providers.BaseProvider.prototype, "rapid");
      return "BadgerBridgeZeroController";
  }
};

async function getSigner() {
  return (await hreEthers.getSigners())[0];
}

const main = async () => {
  const signer = await getSigner();
  console.log(ethers.utils.formatEther(await signer.getBalance()));
  const newImpl = await deployments.deploy("BadgerBridgeZeroController__Impl", {
    contract: getControllerName(),
    from: await signer.getAddress(),
    args: [],
    libraries: {},
    skipIfAlreadyDeployed: false,
  });
  await deployments.save("BadgerBridgeZeroController__Impl", newImpl);
};

main().then().catch(console.error);
