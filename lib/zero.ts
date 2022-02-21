//import './silence-init';
import { _TypedDataEncoder } from '@ethersproject/hash';
import { createNode, ZeroConnection, ZeroKeeper, ZeroUser } from './p2p';
import { PersistenceAdapter } from './persistence';

export async function createZeroConnection(address: string): Promise<ZeroConnection> {
	const connOptions = {
		multiaddr: address,
	};
	return await createNode(connOptions);
}

export function createZeroUser(connection: ZeroConnection, persistence?: PersistenceAdapter<any, any>) {
	return new ZeroUser(connection, persistence);
}

export function createZeroKeeper(connection: ZeroConnection) {
	return new ZeroKeeper(connection);
}

export { getProvider, logger } from './deployment-utils';
export * from './TransferRequest';
export * from './MetaRequest';
