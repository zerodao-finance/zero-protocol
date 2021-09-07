import { TransferRequest } from '../types';
import { PersistenceAdapter, RequestStates, TransferRequestWithStatus } from './types';
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

	async set(transferRequest: any): Promise<LocalStorageKeyType> {
		const key = hash(transferRequest);
		const status: any= { ...transferRequest, status: 'pending' };
		const serialized = JSON.stringify(status);
		try {
			await this.backend.setItem(`request:${key}`, serialized);
			return key;
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async get(key: LocalStorageKeyType): Promise<TransferRequest | undefined> {
		try {
			const value = await this.backend.getItem(`request:${key}`);
			if (value) {
				const parsed: TransferRequestWithStatus = JSON.parse(value);
				return parsed as TransferRequest;
			} else throw new Error('Could not find transferRequest');
		} catch (e) {
			return undefined;
		}
	}

	async remove(key: LocalStorageKeyType): Promise<boolean> {
		try {
			await this.backend.removeItem(`request:${key}`);
			return true;
		} catch (e) {
			return false;
		}
	}

	async has(key: LocalStorageKeyType): Promise<boolean> {
		try {
			const value = await this.get(key);
			if (value) return true;
			return false;
		} catch (e) {
			return false;
		}
	}

	async getStatus(key: LocalStorageKeyType): Promise<RequestStates> {
		try {
			const value = (await this.get(key)) as TransferRequestWithStatus;
			return value?.status;
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async setStatus(key: LocalStorageKeyType, status: RequestStates): Promise<void> {
		try {
			const value = (await this.get(key)) as TransferRequestWithStatus;
			if (value) {
				value.status = status;
				this.backend.setItem(key, JSON.stringify(value));
			}
			throw new Error(`No transfer request with key: ${key}`);
		} catch (e) {}
	}

	async getAllTransferRequests(): Promise<TransferRequestWithStatus[]> {
		const keys = Object.keys(this.backend).filter((v) => v.startsWith('request:'));
		const returnArr: TransferRequestWithStatus[] = [];
		for (const key of keys) {
			returnArr.push((await this.get(key)) as TransferRequestWithStatus);
		}
		return returnArr;
	}
}
