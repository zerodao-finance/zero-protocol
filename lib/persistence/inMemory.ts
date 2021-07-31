import { TransferRequest } from '../types';
import { PersistenceAdapter } from './types';
import hash from 'object-hash';

type InMemoryKeyType = string;
type InMemoryBackendType = Map<string, TransferRequest>;

export class InMemoryPersistenceAdapter implements PersistenceAdapter<InMemoryBackendType, InMemoryKeyType> {
	backend: InMemoryBackendType;
	constructor() {
		this.backend = new Map();
	}

	async set(transferRequest: TransferRequest): Promise<InMemoryKeyType> {
		const key = hash(transferRequest);
		try {
			await this.backend.set(key, transferRequest);
			return key;
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async get(key: InMemoryKeyType): Promise<TransferRequest | undefined> {
		try {
			const value = this.backend.get(key);
			if (value) return value;
			else return undefined;
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
}
