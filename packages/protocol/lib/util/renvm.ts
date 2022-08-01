import { Script, Networks } from 'bitcore-lib';
import { stripHexPrefix, maybeCoerceToGHash, encodeInitializationActions } from './helpers';
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { getCreate2Address } from '@ethersproject/address';
import assembleCloneCode from './assembleCloneCode';

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

export default RenVM;
