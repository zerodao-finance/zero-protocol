//import './silence-init';
import { Wallet } from '@ethersproject/wallet';
import { Signer } from '@ethersproject/abstract-signer';
import { _TypedDataEncoder } from '@ethersproject/hash';
import type { SignerWithAddress } from 'hardhat-deploy-ethers/dist/src/signer-with-address';
import { ethers } from 'ethers';
import { Polygon, Ethereum, Arbitrum, Avalanche } from '@renproject/chains';

export const CONTROLLER_DEPLOYMENTS = {
	[ethers.utils.getAddress(require('../deployments/arbitrum/BadgerBridgeZeroController.json').address)]: 'Arbitrum',
	[ethers.utils.getAddress(require('../deployments/avalanche/BadgerBridgeZeroController.json').address)]: 'Avalanche',
	[ethers.utils.getAddress(require('../deployments/matic/ZeroController').address)]: 'Polygon',
	[ethers.utils.getAddress(require('../deployments/mainnet/BadgerBridgeZeroController.json').address)]: 'Ethereum',
};

export const RPC_ENDPOINTS = {
	Arbitrum: 'https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
	Avalanche: 'https://api.avax.network/ext/bc/C/rpc',
	Polygon: 'https://polygon-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
	Ethereum: 'https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
};

export const RENVM_PROVIDERS = {
	Arbitrum,
	Polygon,
	Ethereum,
	Avalanche,
};

export const getVanillaProvider = (request) => {
	const checkSummedContractAddr = ethers.utils.getAddress(request.contractAddress);
	if (Object.keys(CONTROLLER_DEPLOYMENTS).includes(checkSummedContractAddr)) {
		const chain_key = CONTROLLER_DEPLOYMENTS[checkSummedContractAddr];
		const infuraKey = (() => {
	          switch (chain_key) {
                    case 'ethereum':
                      return 'mainnet';
                    case 'polygon':
                      return 'matic';
                    case 'arbitrum':
                      return chain_key;
		  }
		})();
                if (infuraKey) return new ethers.providers.InfuraProvider(infuraKey, '816df2901a454b18b7df259e61f92cd2');
		return new ethers.providers.JsonRpcProvider(RPC_ENDPOINTS[chain_key]);
	} else {
		throw new Error('Not a contract currently deployed: ' + checkSummedContractAddr);
	}
};

export const getProvider = (transferRequest) => {
	const checkSummedContractAddr = ethers.utils.getAddress(transferRequest.contractAddress);
	const ethersProvider = getVanillaProvider(transferRequest);
	const chain_key = CONTROLLER_DEPLOYMENTS[checkSummedContractAddr];
	return RENVM_PROVIDERS[chain_key](ethersProvider);
}

export const logger = {
	debug(v) {
		console.error(v);
	},
};

export type ZeroSigner = Wallet & SignerWithAddress & Signer;
