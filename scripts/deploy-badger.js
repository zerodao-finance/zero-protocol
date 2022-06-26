const {
  deployments,
  ethers: hreEthers,
  network,
  artifacts,
} = require("hardhat");
const ethers = require("ethers");
const fs = require("fs");

async function getSigner() {
  return (await hreEthers.getSigners())[0];
}

const main = async () => {
  const signer = await getSigner();
  const proxyAbi = await artifacts.readArtifact("TransparentUpgradeableProxy");

  const logic = "0xE182f80DAA9BEE399A623055FC5836BE4781A8eD";
  const proxyAdmin = "0x1150DB3D2C93bF3E69cFdE29d6F352a35056468c";
  const governance = "0x4A423AB37d70c00e8faA375fEcC4577e3b376aCa";
  const bbAbi = await artifacts.readArtifact("BadgerBridgeZeroControllerMatic");
  const ifaceP = new ethers.utils.Interface(proxyAbi.abi);
  const ifaceB = new ethers.utils.Interface(bbAbi.abi);
  const data = ifaceP.encodeDeploy([
    logic,
    proxyAdmin,
    ifaceB.encodeFunctionData("initialize", [governance, governance]),
  ]);
  console.log(data);
  // const newImpl = await deployments.deploy(
  //   "BadgerBridgeZeroControllerDeployer",
  //   {
  //     contract: "BadgerBridgeZeroControllerDeployer",
  //     from: await signer.getAddress(),
  //     args: [],
  //     libraries: {},
  //     skipIfAlreadyDeployed: false,
  //   }
  // );
  // fs.writeFileSync("deploy.json", JSON.stringify(newImpl));
  // console.log(newImpl);
};

main().then().catch(console.error);
