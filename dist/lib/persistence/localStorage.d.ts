import { TransferRequest } from '../types';
import { PersistenceAdapter, RequestStates, TransferRequestWithStatus } from './types';
declare type LocalStorageKeyType = string;
declare type LocalStorageBackendType = Storage;
export declare class LocalStoragePersistenceAdapter implements PersistenceAdapter<LocalStorageBackendType, LocalStorageKeyType> {
    backend: LocalStorageBackendType;
    constructor();
    set(transferRequest: any): Promise<LocalStorageKeyType>;
    get(key: LocalStorageKeyType): Promise<TransferRequest | undefined>;
    remove(key: LocalStorageKeyType): Promise<boolean>;
    has(key: LocalStorageKeyType): Promise<boolean>;
    getStatus(key: LocalStorageKeyType): Promise<RequestStates>;
    setStatus(key: LocalStorageKeyType, status: RequestStates): Promise<void>;
    getAllTransferRequests(): Promise<TransferRequestWithStatus[]>;
}
export {};
//# sourceMappingURL=localStorage.d.ts.map