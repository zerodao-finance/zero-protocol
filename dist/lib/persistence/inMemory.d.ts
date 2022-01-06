import { TransferRequest } from '../types';
import { PersistenceAdapter, RequestStates, TransferRequestWithStatus } from './types';
declare type InMemoryKeyType = string;
declare type InMemoryBackendType = Map<string, TransferRequestWithStatus>;
export declare class InMemoryPersistenceAdapter implements PersistenceAdapter<InMemoryBackendType, InMemoryKeyType> {
    backend: InMemoryBackendType;
    constructor();
    set(transferRequest: TransferRequest): Promise<InMemoryKeyType>;
    get(key: InMemoryKeyType): Promise<TransferRequest | undefined>;
    remove(key: InMemoryKeyType): Promise<boolean>;
    has(key: InMemoryKeyType): Promise<boolean>;
    getStatus(key: InMemoryKeyType): Promise<RequestStates>;
    setStatus(key: InMemoryKeyType, status: RequestStates): Promise<void>;
    getAllTransferRequests(): Promise<TransferRequestWithStatus[]>;
}
export {};
//# sourceMappingURL=inMemory.d.ts.map