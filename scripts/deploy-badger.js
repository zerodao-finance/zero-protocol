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
  const proxyAbi = await artifacts.readArtifact(
    "@openzeppelin/contracts/proxy/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy"
  );

  const logic = "0x5B6C670bac19d5DeFfFEb8202df3f7384BF444bb";
  const proxyAdmin = "0x6d406A4A9Ea1074dCC8B284af6922970216f9c0B";
  const governance = "0xa1324c9085deCB8C346b69e0e951399D00AF6fb6";
  const bbAbi = await artifacts.readArtifact(
    "BadgerBridgeZeroControllerOptimism"
  );
  const ifaceP = new ethers.utils.Interface(proxyAbi.abi);
  const ifaceB = new ethers.utils.Interface(bbAbi.abi);
  const args = [
    logic,
    proxyAdmin,
    ifaceB.encodeFunctionData("initialize", [governance, governance]),
  ];
  const data = ifaceP.encodeDeploy(args);
  console.log(data);
  /*const deploy = await deployments.deploy("TransparentUpgradeableProxy", {
    contract: "TransparentUpgradeableProxy",
    from: await signer.getAddress(),
    args: args,
    skipIfAlreadyDeployed: false,
    libraries: {},
  });
  */
  // console.log(deploy);
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
