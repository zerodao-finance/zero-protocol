'use strict';

const path = require('path');
const hre = require('hardhat');
const { ethers, upgrades } = hre;

exports = module.exports = function () {};

exports.isSelectedDeployment = (filename) =>
	!process.env.DEPLOYMENT_NUMBER ||
	(() => {
		const match = filename.match(/(?:\d+)/g);
		if (!match) return false;
		return match[0] === process.env.DEPLOYMENT_NUMBER;
	})();

exports.networkNameFromEnv = () => {
	if (!process.env.CHAIN) return 'localhost';
	switch (process.env.CHAIN) {
		case 'ETHEREUM':
			return 'mainnet';
		default:
			return process.env.CHAIN.toLowerCase();
	}
};

exports.getSigner = async (address) => {
	try {
		await hre.network.provider.request({
			method: 'hardhat_impersonateAccount',
			params: [address],
		});
	} catch (e) {}
	return await ethers.getSigner(address);
};

exports.fundWithGas = async (address) => {
	if (!process.env.FORKING || hre.network.name !== 'hardhat') return;
	const [signer] = await hre.ethers.getSigners();
	const balance = Number(hre.ethers.utils.formatEther(await signer.provider.getBalance(await signer.getAddress())));
	if (balance < 0.1) {
		await signer.sendTransaction({
			to: address,
			value: ethers.utils.parseEther('0.1'),
		});
	}
};

exports.deployFixedAddress = async (...args) => {
	console.log('Deploying ' + args[0]);
	args[1].waitConfirmations = 1;
	const [signer] = await ethers.getSigners();
	//  hijackSigner(signer);
	const result = await deployments.deploy(...args);
	//  restoreSigner(signer);
	console.log('Deployed to ' + result.address);
	return result;
};

exports.deployProxyFixedAddress = async (...args) => {
	console.log('Deploying proxy');
	//const [signer] = await ethers.getSigners();
	//hijackSigner(signer);
	console.log(args);
	const result = await upgrades.deployProxy(...args);
	//restoreSigner(signer);
	return result;
};

exports.getContract = async (name) => {
	const deployment = require(path.join(__dirname, '..', 'deployments', exports.networkNameFromEnv(), name));
	const [signer] = await ethers.getSigners();
	return new ethers.Contract(deployment.address, deployment.abi, signer);
};
