import PeerInfo from 'peer-info';
import { ZeroConnection } from './core';
import { MockZeroConnection } from './mocks';

export interface NodeOptions {
	peerInfo?: PeerInfo;
	multiaddr: string;
}

export type ConnectionTypes = MockZeroConnection | ZeroConnection;
