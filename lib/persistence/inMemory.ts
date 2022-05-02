import { TransferRequest, RequestStates, RequestWithStatus, Request, BurnRequest } from '../types';
import { PersistenceAdapter } from './types';
import hash from 'object-hash';

type InMemoryKeyType = string;
type InMemoryBackendType = Map<string, RequestWithStatus<Request>>;

export class InMemoryPersistenceAdapter implements PersistenceAdapter<InMemoryBackendType, InMemoryKeyType> {
	backend: InMemoryBackendType;
	constructor() {
		this.backend = new Map();
	}

	async set(transferRequest: any): Promise<InMemoryKeyType> {
		const tr: any = {
			amount: transferRequest.amount,
			nonce: transferRequest.nonce,
			pNonce: transferRequest.pNonce,
			data: transferRequest.data,
			module: transferRequest.module,
			asset: transferRequest.assset,
			chainId: transferRequest.chainId,
			contractAddress: transferRequest.contractAddress,
			underwriter: transferRequest.underwriter,
			signature: transferRequest.signature,
			to: transferRequest.to,
		};
		const key = hash(tr);
		const status: any = { ...tr, status: 'pending' };
		try {
			await this.backend.set(key, status);
			return key;
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async get(key: InMemoryKeyType): Promise<Request | undefined> {
		try {
			const value = this.backend.get(key);
			if (value) {
				return value as Request;
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
			const value = (await this.get(key)) as RequestWithStatus<Request>;
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
			const value = (await this.get(key)) as RequestWithStatus<Request>;
			if (value) {
				value.status = status;
				await this.backend.set(key, value);
			} else throw new Error(`No transfer request with key: ${key}`);
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async getAllRequests(filter): Promise<RequestWithStatus<Request>[]> {
		return Array.from(this.backend.values()).filter(d => d.requestType === filter);
	}

	async getAllTransferRequests() {
		return (await this.getAllRequests("transfer")) as unknown as RequestWithStatus<TransferRequest>[]
	}

	async getAllBurnRequests() {

		return (await this.getAllRequests("transfer")) as unknown as RequestWithStatus<BurnRequest>[]
	}
}
