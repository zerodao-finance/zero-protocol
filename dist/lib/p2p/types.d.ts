import PeerInfo from 'peer-info';
import { ZeroConnection } from './core';
export interface NodeOptions {
    peerInfo?: PeerInfo;
    multiaddr: string;
}
export declare type ConnectionTypes = ZeroConnection;
