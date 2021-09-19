/// <reference types="node" />
import libp2p from 'libp2p';
import { Logger } from '../logger';
import { ConnectionTypes } from './types';
import { TransferRequest } from '../types';
import { PersistenceAdapter } from '../persistence';
declare class ZeroConnection extends libp2p {
}
declare class ZeroUser {
    conn: ConnectionTypes;
    keepers: string[];
    log: Logger;
    storage: PersistenceAdapter<any, any>;
    constructor(connection: ConnectionTypes, persistence?: PersistenceAdapter<any, any>);
    subscribeKeepers(): Promise<void>;
    unsubscribeKeepers(): Promise<void>;
    publishTransferRequest(transferRequest: TransferRequest): Promise<void>;
}
declare class ZeroKeeper {
    conn: ConnectionTypes;
    dispatches: any[];
    log: Logger;
    active: NodeJS.Timeout;
    constructor(connection: ConnectionTypes);
    advertiseAsKeeper(address: string): Promise<void>;
    setTxDispatcher(callback: Function): Promise<void>;
    destroy(): void;
}
export { ZeroKeeper, ZeroUser, ZeroConnection };
