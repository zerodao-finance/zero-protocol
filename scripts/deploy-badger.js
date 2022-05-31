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

  const logic = '0xE182f80DAA9BEE399A623055FC5836BE4781A8eD';
  const proxyAdmin = '0x1150DB3D2C93bF3E69cFdE29d6F352a35056468c';
  const governance = '0x3A627ab4F61985f9F353a3F4c2C91dd8c18a9B04';
  const proxyAdminAbi = await artifacts.readArtifact('ProxyAdmin');
  const bbAbi = await artifacts.readArtifact('BadgerBridgeZeroControllerArb');
  const ifaceP = new ethers.utils.Interface(proxyAdminAbi.abi);
  const newImpl = await deployments.deploy('BadgerBridgeZeroControllerArb', {
    contract: 'BadgerBridgeZeroControllerArb',
    from: await signer.getAddress(),
    args: [],
    libraries: [],
    skipIfAlreadyDeployed: false,
  });
  console.log(newImpl.receipt.contractAddress);
  console.log(
    ifaceP.encodeFunctionData('upgrade', [
      '0x9880fCd5d42e8F4c2148f2c1187Df050BE3Dbd17',
      newImpl.receipt.contractAddress,
    ])
  );
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
