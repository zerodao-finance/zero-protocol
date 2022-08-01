const hre = require('hardhat');
const { ethers, deployments } = hre;
import BalanceTree from './merkle/balance-tree';
import MerkleTree from './merkle/merkle-tree';

const config = {
	decimals: 18,
	airdrop: {
		'0xe32d9D1F1484f57F8b5198f90bcdaBC914de0B5A': '100',
		'0x7f78Da15E8298e7afe6404c54D93cb5269D97570': '100',
		'0xdd2fd4581271e230360230f9337d5c0430bf44c0': '100',
		'0x46F71A5b3aCF70cc1Eab83234c158A27F350c66A': '100',
	},
};

const whitelist_config = [
	{ account: '0xe32d9D1F1484f57F8b5198f90bcdaBC914de0B5A', amount: ethers.utils.parseUnits('100', 18) },
	{ account: '0x46F71A5b3aCF70cc1Eab83234c158A27F350c66A', amount: ethers.utils.parseUnits('100', 18) },
	{ account: '0x7f78Da15E8298e7afe6404c54D93cb5269D97570', amount: ethers.utils.parseUnits('100', 18) },
	{ account: '0xdd2fd4581271e230360230f9337d5c0430bf44c0', amount: ethers.utils.parseUnits('100', 18) },
];

export const startMockEnvironment = async () => {
	// TODO: build merkle tree from config
	// Deploy and approve zeroDistributor
	/**
	 * Signer / Setup
	 */
	const [owner, treasury] = ethers.getSigners();
	const zeroDistributor = await new ethers.getContractFactory('ZeroDistributor', owner);
	const zeroToken = await ethers.getContract('ZERO', treasury);
	const mTree = new BalanceTree(whitelist_config);
	const hexRoot = mTree.getHexRoot();
	await zeroDistributor.deploy(zeroToken.address, treasury.address, hexRoot);
	zeroToken.approve(zeroDistributor.address, await zeroToken.balanceOf(treasury.address));

	return mTree;
};

export const testClaim = async (address: string, mTree: BalanceTree) => {
	var index = whitelist_config
		.map((i) => {
			return i.account;
		})
		.indexOf(address);
	const proof = mTree.getProof(index, whitelist_config[index].account, whitelist_config[index].amount);

	const [signer] = await ethers.getSigners();
	const zDist = await ethers.getContract('ZeroDistributor', signer);

	await zDist.claim(index, address, whitelist_config[index].amount.toString(), proof);

	return true;
};
