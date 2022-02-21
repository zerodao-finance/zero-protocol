//import './silence-init';
import { Wallet } from '@ethersproject/wallet';
import { Signer } from '@ethersproject/abstract-signer';
import { _TypedDataEncoder } from '@ethersproject/hash';
import type { SignerWithAddress } from 'hardhat-deploy-ethers/dist/src/signer-with-address';
import { ethers } from 'ethers';
import { Polygon, Ethereum, Arbitrum } from '@renproject/chains';

export const CONTROLLER_DEPLOYMENTS = {
	Arbitrum: require('../deployments/arbitrum/ZeroController').address,
	Polygon: require('../deployments/matic/ZeroController').address,
	Ethereum: ethers.constants.AddressZero,
};
export const RPC_ENDPOINTS = {
	Arbitrum: 'https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
	Polygon: 'https://polygon-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
	Ethereum: 'https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
};

export const RENVM_PROVIDERS = {
	Arbitrum,
	Polygon,
	Ethereum,
};

export const getProvider = (transferRequest) => {
	const chain = Object.entries(CONTROLLER_DEPLOYMENTS).find(([k, v]) => transferRequest.contractAddress === v);
	const chain_key = chain[0];
	return RENVM_PROVIDERS[chain_key](new ethers.providers.JsonRpcProvider(RPC_ENDPOINTS[chain_key]), 'mainnet');
};

export const logger = {
	debug(v) {
		console.error(v);
	},
};

export type ZeroSigner = Wallet & SignerWithAddress & Signer;
