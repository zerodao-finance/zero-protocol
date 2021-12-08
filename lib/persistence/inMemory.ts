import { TransferRequest } from '../types';
import { PersistenceAdapter, RequestStates, TransferRequestWithStatus } from './types';
import hash from 'object-hash';

type InMemoryKeyType = string;
type InMemoryBackendType = Map<string, TransferRequestWithStatus>;

export class InMemoryPersistenceAdapter implements PersistenceAdapter<InMemoryBackendType, InMemoryKeyType> {
	backend: InMemoryBackendType;
	constructor() {
		this.backend = new Map();
	}

	async set(transferRequest: TransferRequest): Promise<InMemoryKeyType> {
    const tr: any = { ...transferRequest };
    delete tr._mint;
    delete tr._queryTxResult;
    delete tr.provider;
		const key = hash(tr);
		const status: any = { ...tr, status: 'pending' };
		try {
			await this.backend.set(key, status);
			return key;
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async get(key: InMemoryKeyType): Promise<TransferRequest | undefined> {
		try {
			const value = this.backend.get(key);
			if (value) {
				return value as TransferRequest;
			} else return undefined;
		} catch (e) {
			return undefined;
		}
	}

	async remove(key: InMemoryKeyType): Promise<boolean> {
		try {
			await this.backend.delete(key);
			return true;
		} catch (e) {
			return false;
		}
	}

	async has(key: InMemoryKeyType): Promise<boolean> {
		try {
			return await this.backend.has(key);
		} catch (e) {
			return false;
		}
	}

	async getStatus(key: InMemoryKeyType): Promise<RequestStates> {
		try {
			const value = (await this.get(key)) as TransferRequestWithStatus;
			if (value) {
				return value.status;
			} else {
				throw new Error(`No transfer request with key: ${key}`);
			}
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async setStatus(key: InMemoryKeyType, status: RequestStates): Promise<void> {
		try {
			const value = (await this.get(key)) as TransferRequestWithStatus;
			if (value) {
				value.status = status;
				await this.backend.set(key, value);
			} else throw new Error(`No transfer request with key: ${key}`);
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async getAllTransferRequests(): Promise<TransferRequestWithStatus[]> {
		return Array.from(this.backend.values());
	}
}
