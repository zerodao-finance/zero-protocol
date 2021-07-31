import { TransferRequest } from '../types';
import { PersistenceAdapter } from './types';
import hash from 'object-hash';

type LocalStorageKeyType = string;
type LocalStorageBackendType = Storage;

export class LocalStoragePersistenceAdapter
	implements PersistenceAdapter<LocalStorageBackendType, LocalStorageKeyType>
{
	backend: LocalStorageBackendType;
	constructor() {
		this.backend = window.localStorage;
	}

	async set(transferRequest: TransferRequest): Promise<LocalStorageKeyType> {
		const serialized = JSON.stringify(transferRequest);
		const key = hash(transferRequest);
		try {
			await this.backend.setItem(key, serialized);
			return key;
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async get(key: LocalStorageKeyType): Promise<TransferRequest | undefined> {
		try {
			const value = await this.backend.getItem(key);
			if (value) {
				return JSON.parse(value);
			} else throw new Error('Could not find transferRequest');
		} catch (e) {
			return undefined;
		}
	}

	async remove(key: LocalStorageKeyType): Promise<boolean> {
		try {
			await this.backend.removeItem(key);
			return true;
		} catch (e) {
			return false;
		}
	}

	async has(key: LocalStorageKeyType): Promise<boolean> {
		try {
			const value = await this.backend.getItem(key);
			if (value) return true;
			return false;
		} catch (e) {
			return false;
		}
	}
}
