const {
  deployments,
  ethers: hreEthers,
  network,
  artifacts,
} = require('hardhat');
const ethers = require('ethers');
const fs = require('fs');

async function getSigner() {
  return (await hreEthers.getSigners())[0];
}

const main = async () => {
  const signer = await getSigner();
  const proxyAbi = await artifacts.readArtifact('TransparentUpgradeableProxy');

  const logic = '0x65906fFe8E9eC966D15B3eCA93313ac496Ac95B4';
  const proxyAdmin = '0x7CbAe0548ed84017e399976E3997088f31310de3';
  const governance = '0xC10e4c59F1CC2Bc854A27E645318190F173440cB';
  const bbAbi = await artifacts.readArtifact('BadgerBridgeZeroControllerAvax');
  const ifaceP = new ethers.utils.Interface(proxyAbi.abi);
  const ifaceB = new ethers.utils.Interface(bbAbi.abi);
  const data = ifaceP.encodeDeploy([
    logic,
    proxyAdmin,
    ifaceB.encodeFunctionData('initialize', [governance, governance]),
  ]);
  console.log(data);
  // const newImpl = await deployments.deploy(
  //   'BadgerBridgeZeroControllerDeployer',
  //   {
  //     contract: 'BadgerBridgeZeroControllerDeployer',
  //     from: await signer.getAddress(),
  //     args: [],
  //     libraries: {},
  //     skipIfAlreadyDeployed: false,
  //   }
  // );
  // fs.writeFileSync('deploy.json', JSON.stringify(newImpl));
  // console.log(newImpl);
};

main().then().catch(console.error);
