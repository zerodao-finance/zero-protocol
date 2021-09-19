import { IGunChainReference } from 'gun/types/chain';
import { TransferRequest } from '../types';
import { PersistenceAdapter, RequestStates, TransferRequestWithStatus } from './types';
declare type GunKeyType = string;
declare type GunBackendType = IGunChainReference;
export declare class GunPersistenceAdapter implements PersistenceAdapter<GunBackendType, GunKeyType> {
    backend: IGunChainReference;
    address: string;
    constructor(address: string);
    set(transferRequest: TransferRequest): Promise<GunKeyType>;
    get(key: GunKeyType): Promise<TransferRequest | undefined>;
    remove(key: GunKeyType): Promise<boolean>;
    has(key: GunKeyType): Promise<boolean>;
    getStatus(key: GunKeyType): Promise<RequestStates>;
    setStatus(key: GunKeyType, status: RequestStates): Promise<void>;
    getAllTransferRequests(): Promise<TransferRequestWithStatus[]>;
}
export {};
