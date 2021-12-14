'use strict';

const zero = require('../');
const hre = require('hardhat');
const { ethers } = hre;
const getSigner = async () => {
  return new ethers.Wallet(process.env.WALLET, new ethers.providers.JsonRpcProvider(process.env.FORKING === 'true' ? 'http://localhost:8545' : 'https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2'));
};

ethers.getSigners = async () => {
  return [ await getSigner() ];
};

(async () => {
  const [ signer ] = await hre.ethers.getSigners();
		const transferRequest = new zero.TrivialUnderwriterTransferRequest({
			module: '0x59741D0210Dd24FFfDBa2eEEc9E130A016B8eb3F',
			to: '0xC6ccaC065fCcA640F44289886Ce7861D9A527F9E',
			underwriter: '0xd0D8fA764352e33F40c66C75B3BC0204DC95973e',
			asset: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501',
			amount: '0x061a80',
			data: '0x00000000000000000000000000000000000000000000000000009184e72a0000',
			nonce: '0xb67ed6c41ea6f5b7395f005ceb172eb093273396d1e5bb49d919c4df396e0d5a',
			pNonce: '0x0153c5fa086b7eceef6ec52b6b96381ee6f16852a6ace5b742f239296b4cd901',
			chainId: 42161,
			contractAddress: '0x53f38bEA30fE6919e0475Fe57C2629f3D3754d1E',
			signature:
				'0x42e48680f15b7207c7602fec83b9c252fa3548c8533246ed532a75c6d0c486394648ba8f42a73a0ce2482712f09d177c3641ef07fcfd3b5cd3b4329982f756141b',
		});
  transferRequest.setProvider(signer.provider);
  const tx = await transferRequest.loan(signer, { gasLimit: 1.5e6 });
  console.log(tx);
  console.log(await tx.wait());
})().catch((err) => console.error(err));
