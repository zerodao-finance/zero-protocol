import Gun from 'gun';
/*
import 'gun/lib/unset';
import 'gun/lib/';
*/
import { IGunChainReference } from 'gun/types/chain';
import { TransferRequest } from '../types';
import { PersistenceAdapter, RequestStates, TransferRequestWithStatus } from './types';
import hash from 'object-hash';

type GunKeyType = string;
type GunBackendType = IGunChainReference;

interface ZeroState {
	transferRequests: {
		[index: string]: TransferRequestWithStatus[];
	};
}

export class GunPersistenceAdapter implements PersistenceAdapter<GunBackendType, GunKeyType> {
	backend: IGunChainReference;
	address: string;

	constructor(address: string) {
		this.address = address;
		this.backend = new Gun<ZeroState>(['http://localhost:8765/gun']);
	}

	async set(transferRequest: TransferRequest): Promise<GunKeyType> {
		const key = hash(transferRequest);
		const status: any = { ...transferRequest, status: 'pending' };
		try {
			await this.backend
				.get('transferRequests')
				.get(this.address)
				.set({ ...status, key });
			return key;
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async get(key: GunKeyType): Promise<TransferRequest | undefined> {
		try {
			const values = await this.getAllTransferRequests();
			const value = values.filter((data: any) => data?.key === key)[0];
			if (value) {
				return value as TransferRequest;
			} else return undefined;
		} catch (e) {
			return undefined;
		}
	}

	async remove(key: GunKeyType): Promise<boolean> {
		try {
			let deleted = false;
			await this.backend
				.get('transferRequests')
				.get(this.address)
				.map()
				// @ts-expect-error
				.val(function (this: IGunChainReference, val: any, field: any) {
					if (val?.key === key && !deleted) {
						this.back(1).put({ [field]: null });
						deleted = true;
					}
				});
			return true;
		} catch (e) {
			return false;
		}
	}

	async has(key: GunKeyType): Promise<boolean> {
		try {
			const value = (await this.get(key)) as any;
			if (value) {
				return true;
			} else return false;
		} catch (e) {
			return false;
		}
	}

	async getStatus(key: GunKeyType): Promise<RequestStates> {
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

	async setStatus(key: GunKeyType, status: RequestStates): Promise<void> {
		try {
			const value = (await this.get(key)) as TransferRequestWithStatus;
			if (value) {
				value.status = status;
				await this.backend.get('transferRequest').get(this.address).set(value);
			} else throw new Error(`No transfer request with key: ${key}`);
		} catch (e) {
			throw new Error(e.message);
		}
	}

	async getAllTransferRequests(): Promise<TransferRequestWithStatus[]> {
		let values: any = [];
		await this.backend
			.get('transferRequests')
			.map()
			.once((d) => {
				if (d) {
					values.push(d);
				}
			});
		return values as TransferRequestWithStatus[];
	}
}
