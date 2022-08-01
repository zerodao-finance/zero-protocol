import { TransferRequest, RequestStates, RequestWithStatus, Request, BurnRequest } from '../types';
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

	async set(transferRequest: any): Promise<LocalStorageKeyType> {
		const key = hash(transferRequest);
		const status: any = { ...transferRequest, status: 'pending' };
		const serialized = JSON.stringify(status);
		try {
			await this.backend.setItem(`request:${key}`, serialized);
			return key;
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async get(key: LocalStorageKeyType): Promise<Request | undefined> {
		try {
			const value = await this.backend.getItem(`request:${key}`);
			if (value) {
				const parsed: RequestWithStatus<Request> = JSON.parse(value);
				return parsed as Request;
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
			const value = (await this.get(key)) as RequestWithStatus<Request>;
			return value?.status;
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async setStatus(key: LocalStorageKeyType, status: RequestStates): Promise<void> {
		try {
			const value = (await this.get(key)) as RequestWithStatus<Request>;
			if (value) {
				value.status = status;
				this.backend.setItem(key, JSON.stringify(value));
			}
			throw new Error(`No transfer request with key: ${key}`);
		} catch (e) { }
	}

	async getAllRequests(filter): Promise<RequestWithStatus<Request>[]> {
		const keys = Object.keys(this.backend).filter((v) => v.startsWith('request:'));
		const returnArr: RequestWithStatus<Request>[] = [];
		for (const key of keys) {
			const request = (await this.get(key)) as RequestWithStatus<Request>
			if (!filter || request.requestType === filter)
				returnArr.push(request);
		}
		return returnArr;
	}
	async getAllTransferRequests(): Promise<RequestWithStatus<TransferRequest>[]> {
		return (await this.getAllRequests("transfer") as RequestWithStatus<TransferRequest>[])
	}
	async getAllBurnRequests(): Promise<RequestWithStatus<BurnRequest>[]> {
		return (await this.getAllRequests("burn") as RequestWithStatus<BurnRequest>[])
	}
}
