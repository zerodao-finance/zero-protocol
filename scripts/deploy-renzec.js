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
  /*const proxyAbi = await artifacts.readArtifact(
    "@openzeppelin/contracts/proxy/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy"
  );

  const logic = "0x5B6C670bac19d5DeFfFEb8202df3f7384BF444bb";
  const proxyAdmin = "0xFF727BDFa7608d7Fd12Cd2cDA1e7736ACbfCdB7B";
  const governance = "0x5E9B37149b7d7611bD0Eb070194dDA78EB11EfdC";
  const bbAbi = await artifacts.readArtifact("RenZECController");
  const ifaceP = new ethers.utils.Interface(proxyAbi.abi);
  const ifaceB = new ethers.utils.Interface(bbAbi.abi);
  const args = [
    logic,
    proxyAdmin,
    ifaceB.encodeFunctionData("initialize", [governance, governance]),
  ];
  const data = ifaceP.encodeDeploy(args);
  console.log(data);
  */
  /*const deploy = await deployments.deploy("TransparentUpgradeableProxy", {
    contract: "TransparentUpgradeableProxy",
    from: await signer.getAddress(),
    args: args,
    skipIfAlreadyDeployed: false,
    libraries: {},
  });
  */
  // console.log(deploy);
  const newImpl = await deployments.deploy("RenZECControllerDeployer", {
    contract: "RenZECControllerDeployer",
    from: await signer.getAddress(),
    args: [],
    libraries: {},
    skipIfAlreadyDeployed: false,
  });
  fs.writeFileSync("deploy.json", JSON.stringify(newImpl));
  console.log(newImpl);
};

main().then().catch(console.error);
