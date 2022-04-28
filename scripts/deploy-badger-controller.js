const { deployments, ethers: hreEthers } = require('hardhat');
const ethers = require('ethers');
const fs = require('fs');

async function getSigner() {
	return (await hreEthers.getSigners())[0];
}

const main = async () => {
	const signer = await getSigner();
	console.log(ethers.utils.formatEther(await signer.getBalance()));
	const newImpl = await deployments.deploy('BadgerBridgeZeroController__Impl', {
		contract: 'BadgerBridgeZeroController',
		from: await signer.getAddress(),
		args: [],
		libraries: {},
		skipIfAlreadyDeployed: false,
	});
	await deployments.save('BadgerBridgeZeroController__Impl', newImpl);
};

main().then().catch(console.error);
