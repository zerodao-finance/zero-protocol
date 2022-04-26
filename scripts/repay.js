const hre = require('hardhat');
const { UnderwriterTransferRequest } = require('../dist/lib/zero');

const transferRequest = new UnderwriterTransferRequest(
	JSON.parse(`{"module":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","to":"0x7A8192079E2983C6AB03bbd6aDDE2f8F4cd625E5","underwriter":"0xa8bd3ffebf92538b3b830dd5b2516a5111db164d","asset":"0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D","amount":"0x0927c0","data":"0x0000000000000000000000000000000000000000000000000000000000000000","nonce":"0x51c77e843338bdfe4b89f8b69e50092c700f8350bd52a47f4e1edad366546bc2","pNonce":"0x41b7c83722c8cf327e3c5281bfca85e0a43eda20e5603bb9c1c032920b9801b4","chainId":1,"contractAddress":"0xa8bd3ffebf92538b3b830dd5b2516a5111db164d","signature":"0x543e3060e5beb30fc8bb55a9ccb0ebe7231b2680ff940bc9ae675178da0cee025d55e5aca791928dcce228a3eac1d658cd103afa8cd807b4d53c8f6bb8d99dd41b"}`)
	);


(async () => {
	const tx = await transferRequest.repay((await hre.ethers.getSigners())[0], { gasLimit: 800000 });
	console.log(require('util').inspect(tx, { colors: true, depth: 15 }));
	console.log('waiting ... ');
	console.log(await tx.wait());
})().catch((err) => console.error(err));
