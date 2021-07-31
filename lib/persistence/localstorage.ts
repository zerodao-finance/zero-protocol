import { TransferRequest } from '../types';
import { PersistenceAdapter } from './types';
import hash from 'object-hash';

export class LocalStoragePersistenceAdapter implements PersistenceAdapter<Storage, string> {
	backend: Storage;
	constructor() {
		this.backend = window.localStorage;
	}

	async set(transferRequest: TransferRequest): Promise<string> {
		const serialized = JSON.stringify(transferRequest);
		const key = hash(serialized);
		try {
			await this.backend.setItem(key, serialized);
			return key;
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async get(key: string): Promise<TransferRequest | undefined> {
		try {
			const value = await this.backend.getItem(key);
			if (value) {
				return JSON.parse(value);
			} else throw new Error('Could not find transferRequest');
		} catch (e) {
			return undefined;
		}
	}

	async remove(key: string): Promise<boolean> {
		try {
			await this.backend.removeItem(key);
			return true;
		} catch (e) {
			return false;
		}
	}

	async has(key: string): Promise<boolean> {
		try {
			const value = await this.backend.getItem(key);
			if (value) return true;
			return false;
		} catch (e) {
			return false;
		}
	}
}
