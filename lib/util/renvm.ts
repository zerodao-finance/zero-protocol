// @ts-expect-error
import { Script, Networks } from 'bitcore-lib';
import { stripHexPrefix, maybeCoerceToGHash, encodeInitializationActions } from './helpers';
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { getCreate2Address } from '@ethersproject/address';
import assembleCloneCode from './assembleCloneCode';
import RenJS, { LockAndMint } from '@renproject/ren';
import { LockChain } from '@renproject/interfaces';
import { GatewayAddressParams } from './types';
import { Bitcoin, Ethereum } from '@renproject/chains';
import { ethers } from 'ethers';
import { defaultAbiCoder, keccak256 } from 'ethers/lib/utils';

class RenVM {
	public cachedProxyCodeHash: any;
	public shifterBorrowProxyBytecode: any;
	private InitializationActionsABI: any[] = [];

	constructor(cachedProxyCodeHash: any, shifterBorrowProxy: any) {
		this.cachedProxyCodeHash = cachedProxyCodeHash;
		this.shifterBorrowProxyBytecode = shifterBorrowProxy;
	}

	computeGatewayAddress = ({ isTestnet, g, mpkh }: any) =>
		new Script()
			.add(Buffer.from(stripHexPrefix(maybeCoerceToGHash(g)), 'hex'))
			.add('OP_DROP')
			.add('OP_DUP')
			.add('OP_HASH160')
			.add(Buffer.from(stripHexPrefix(mpkh), 'hex'))
			.add('OP_EQUALVERIFY')
			.add('OP_CHECKSIG')
			.toScriptHashOut()
			.toAddress(isTestnet ? Networks.testnet : Networks.mainnet)
			.toString();

	initializeCodeHash = async () => {
		return this.cachedProxyCodeHash;
	};

	computeLiquidityRequestHash = ({
		shifterPool,
		token,
		nonce,
		amount,
		gasRequested,
		forbidLoan = false,
		actions = [],
	}: any) =>
		solidityKeccak256(
			['address', 'address', 'bytes32', 'uint256', 'uint256', 'bool', 'bytes'],
			[
				shifterPool,
				token,
				nonce,
				amount,
				gasRequested,
				forbidLoan,
				encodeInitializationActions(actions, this.InitializationActionsABI),
			],
		);

	computeBorrowProxyAddress = ({ shifterPool, borrower, token, nonce, amount, forbidLoan, actions }: any) => {
		const salt = solidityKeccak256(
			['address', 'address', 'bytes32', 'uint256', 'bool', 'bytes'],
			[
				borrower,
				token,
				nonce,
				amount,
				forbidLoan,
				encodeInitializationActions(actions, this.InitializationActionsABI),
			],
		);
		const implementation = getCreate2Address(
			shifterPool,
			solidityKeccak256(['string'], ['borrow-proxy-implementation']),
			solidityKeccak256(['bytes'], [this.shifterBorrowProxyBytecode]),
		);
		return getCreate2Address(
			shifterPool,
			salt,
			solidityKeccak256(['bytes'], [assembleCloneCode(shifterPool.toLowerCase(), implementation.toLowerCase())]),
		);
	};
}

export const computeGatewayAddress = async (ren: RenJS, params: GatewayAddressParams) => {
	// dev
	throw new Error('Function is broken!');
	let fromChain: LockChain;
	switch (params.from) {
		case 'btc': {
			fromChain = Bitcoin();
			break;
		}
		default: {
			throw new Error(`Invalid from network: ${params.from}`);
		}
	}
	const zeroController = '0x';
	const pHash = keccak256(
		defaultAbiCoder.encode(['uint256', 'address', 'bytes'], [params.pNonce, params.module, params.data]),
	);
	const lockAndMint = await new LockAndMint(
		ren.renVM,
		{
			from: fromChain,
			nonce: params.nonce || ethers.utils.hexlify(ethers.utils.randomBytes(32)),
			to: Ethereum({ provider: params.signer.provider, signer: params.signer }).Address(zeroController),
			contractCalls: [
				// {
				// 	// todo
				// 	contractParams: [],
				// },
			],
			asset: params.asset,
		},
		// @ts-ignore
		{ ...ren._config },
	)._initialize();
	// @ts-expect-error
	return lockAndMint.generateGatewayAddress();
};

export default RenVM;
