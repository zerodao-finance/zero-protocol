const hre = require('hardhat');
const { UnderwriterTransferRequest } = require('../dist/lib/zero');

const transferRequest = new UnderwriterTransferRequest(
	JSON.parse(
		`{"module":"0x6b9F827D9e0607098d5DdA6D84D2c2164e1B90A9","to":"0xFE7B639c04c205b7E758Ee999cb72C80344b3B0e","underwriter":"0x3D0810cd7976b9CFcB9b747A1618E9CE40B3Df3F","asset":"0xDBf31dF14B66535aF65AaC99C32e9eA844e14501","amount":"0x07a120","data":"0x0000000000000000000000000000000000000000000000000de0b6b3a7640000","nonce":"0x6b73dd867c88b699a30f5f90086429e1a5b77c2637d06c27b8e0c73114beced7","pNonce":"0xae6fb5a55d2ac4129b12f899fd3e63e8bd5fe016b283b21f5276874282c81f40","chainId":42161,"contractAddress":"0x53f38bEA30fE6919e0475Fe57C2629f3D3754d1E","signature":"0x622cf6a969b8b93cbef53f2e1aa484e46523d940a66b423040ac515c1eebdafd0f5d0de36d9f7ef8ef35e0121e2462de8f340a38680898678d067c8c5af4f5ba1c"}`,
	),
); 

(async () => {
	const tx = await transferRequest.repay((await hre.ethers.getSigners())[0]);
	console.log(require('util').inspect(tx, { colors: true, depth: 15 }));
	console.log('waiting ... ');
	console.log(await tx.wait());
})().catch((err) => console.error(err));
