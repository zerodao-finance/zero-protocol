const hre = require('hardhat');
const { UnderwriterTransferRequest } = require('../dist/lib/zero');

const transferRequest = new UnderwriterTransferRequest(
	JSON.parse(`{"module":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","to":"0x7A8192079E2983C6AB03bbd6aDDE2f8F4cd625E5","underwriter":"0xa8bd3ffebf92538b3b830dd5b2516a5111db164d","asset":"0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D","amount":"0x0493e0","data":"0x0000000000000000000000000000000000000000000000000000000000000000","nonce":"0xb7d856604f89511a64da114b18f4625683d3828eda3161d070da3d37c41e12b2","pNonce":"0x3c7bb526397c0686e9777d96286f24dfcee0ccb2f79a486ce1753f3d266cc03e","chainId":1,"contractAddress":"0xa8bd3ffebf92538b3b830dd5b2516a5111db164d","signature":"0x0a8379fba5a8053b698c73bc38aee5cbc51791c6bdfaf1a74faf1b2fb1c32cc818e1a5ec4a473b11e8f6cea6e698fa819205fd7c88f39bad290046bcfd0716141c"}`)
	);

(async () => {
	const tx = await transferRequest.repay((await hre.ethers.getSigners())[0], { gasLimit: 800000 });
	console.log(require('util').inspect(tx, { colors: true, depth: 15 }));
	console.log('waiting ... ');
	console.log(await tx.wait());
})().catch((err) => console.error(err));
