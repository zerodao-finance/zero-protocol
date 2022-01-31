'use strict';

const zero = require('../lib/zero');

(async () => {
	const wallet = new ethers.Wallet(
		process.env.WALLET,
		new ethers.providers.JsonRpcProvider(
			process.env.JSONRPC_URI || 'https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
		),
	);
	const transferRequest = new zero.UnderwriterTransferRequest(JSON.parse(`{"module":"0x6b9F827D9e0607098d5DdA6D84D2c2164e1B90A9","to":"0x5D27B4D058C306e8793905efE60466E672D70012","underwriter":"0xd0D8fA764352e33F40c66C75B3BC0204DC95973e","asset":"0xDBf31dF14B66535aF65AaC99C32e9eA844e14501","amount":"0x07a120","data":"0x00000000000000000000000000000000000000000000000000071afd498d0000","nonce":"0xb634f6df773270678aed274850811da1235ff6937a3aaaee71e8d6c635879aa7","pNonce":"0xdf366b2aec63206049633bdd413b3de0068ad5bfe40b23828a571dd1652ec6d5","chainId":42161,"contractAddress":"0x53f38bEA30fE6919e0475Fe57C2629f3D3754d1E","signature":"0x7e21cf2b7bcef81fa348365c6fe3615dd60f757ea78258a80d622e7d6dca0e9378ace8d8f443bfd41de6c035baedd942c74ecbad076f005c1f99e39c57d31e931b","_ren":{"utils":{},"_config":{"loadCompletedDeposits":true,"logger":{"level":0}},"_logger":{"level":0},"renVM":{"network":{"name":"mainnet","lightnode":"https://lightnode-mainnet.herokuapp.com","isTestnet":false},"v1":{"network":{"name":"mainnet","lightnode":"https://lightnode-mainnet.herokuapp.com","isTestnet":false},"logger":{"level":0},"provider":{"logger":{"level":0},"nodeURL":"https://lightnode-mainnet.herokuapp.com"}},"v2":{"network":{"name":"mainnet","lightnode":"https://lightnode-mainnet.herokuapp.com","isTestnet":false},"logger":{"level":0},"provider":{"logger":{"level":0},"nodeURL":"https://lightnode-mainnet.herokuapp.com"}}}},"_contractFn":"zeroCall","_contractParams":[{"name":"to","type":"address","value":"0x5D27B4D058C306e8793905efE60466E672D70012"},{"name":"pNonce","type":"uint256","value":"0xdf366b2aec63206049633bdd413b3de0068ad5bfe40b23828a571dd1652ec6d5"},{"name":"module","type":"address","value":"0x6b9F827D9e0607098d5DdA6D84D2c2164e1B90A9"},{"name":"data","type":"bytes","value":"0x00000000000000000000000000000000000000000000000000071afd498d0000"}],"date":1642111659266,"dry":[],"status":"pending"}`));
	const tx = await transferRequest.fallbackMint(wallet);
	console.log('waiting');
	console.log(await tx.wait());
})().catch((err) => console.error(err));
