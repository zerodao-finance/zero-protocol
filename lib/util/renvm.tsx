import { Script, Opcode, Networks } from 'bitcore-lib';
import { stripHexPrefix, maybeCoerceToGHash } from './helpers';

class RenVM {
	public cachedProxyCodeHash;

	computeGatewayAddress = ({ isTestnet, g, mpkh }) =>
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
}

export default RenVM;
