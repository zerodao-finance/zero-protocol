'use strict';

const zero = require('../dist/lib/zero');
const ethers = require('ethers');

(async () => {
	const wallet = new ethers.Wallet(
		process.env.WALLET,
		new ethers.providers.JsonRpcProvider(
			process.env.JSONRPC_URI || 'https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
		),
	);
const transferRequest = new zero.UnderwriterTransferRequest(
	JSON.parse(
		'{"requestType":"transfer","module":"0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D","to":"0x0235175496c649B9AF7C78f7550D6d7cb453F0Fa","underwriter":"0xa8bd3ffebf92538b3b830dd5b2516a5111db164d","asset":"0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D","amount":"0x055730","data":"0x0000000000000000000000000000000000000000000000000000000000000000","nonce":"0xc5a9a6ea4369f5a709b757c0f4849262c7d9648d66c03e03aa534ee64aa5b220","pNonce":"0x18eef5282671d6f0689b30112a8cb9b711d17daa597d4a853aea45248d60bf0e","chainId":1,"contractAddress":"0xa8bd3ffebf92538b3b830dd5b2516a5111db164d","signature":"0xd3e3e55dba6fc7f77de231a75bb1c19d058bb9207f00d0ec378094ed114ad2514924c56ea21cd95c5a65b9a13339c25d2d468c2b9b3e35ab4463c4a0180729871c"}',
	),
); 

	const tx = await transferRequest.fallbackMint(wallet);
	console.log('waiting');
	console.log(await tx.wait());
})().catch((err) => console.log(err));
