const hre = require('hardhat');
const { UnderwriterTransferRequest } = require('../dist/lib/zero');

const transferRequest = new UnderwriterTransferRequest(require('../g'));


(async () => {
	const tx = await transferRequest.repay((await hre.ethers.getSigners())[0], { gasLimit: 800000 });
	console.log(require('util').inspect(tx, { colors: true, depth: 15 }));
	console.log('waiting ... ');
	console.log(await tx.wait());
})().catch((err) => console.error(err));
