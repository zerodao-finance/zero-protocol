'use strict';
import { TransferRequest, Request, BurnRequest, RequestStates, RequestWithStatus } from '../types';
import { ethers } from 'ethers';
import { PersistenceAdapter } from './types';
import path from 'path';
import memdown from 'memdown';
import { pick } from 'lodash';
const level: any = require('level');
const levelup: any = require('levelup');

type LocalStorageKeyType = string;
type LocalStorageBackendType = Storage;

const getValue = async (level: any, key: string): Promise<string> =>
	await new Promise((resolve, reject) =>
		level.get(key, (err, result: string) => {
			if (err) {
				if (err.notFound) return resolve(null);
				else return reject(err);
			} else resolve(result);
		}),
	);

const setValue = async (level, key: string, value: string) =>
	await new Promise<void>((resolve, reject) => level.put(key, value, (err) => (err ? reject(err) : resolve())));
const delValue = async (level, key: string) =>
	await new Promise<void>((resolve, reject) => level.del(key, (err) => (err ? reject(err) : resolve())));

const toKey = (key) => 'request:' + key;
const toIndexKey = (key) => 'index:' + key;
const toKeyFromIndexKey = (index) => 'key: ' + index;

const requestToKey = (request) => ethers.utils.solidityKeccak256(['bytes'], [request.signature]);

const requestToPlain = (request) => {
	let result = {};
	switch (request.requestType) {
		case 'burn':
			result = pick(request, ['destination', 'owner', 'deadline']);
			break;
		default:
			result = pick(request, ['to', 'data', 'module']);
			break;
	}
	result = {
		...result,
		...pick(request, [
			'underwriter',
			'contractAddress',
			'nonce',
			'pNonce',
			'amount',
			'asset',
			'status',
			'signature',
			'chainId',
			'requestType',
		]),
	};
	return result;
};

export class LevelDBPersistenceAdapter implements PersistenceAdapter<LocalStorageBackendType, LocalStorageKeyType> {
	backend: any;
	constructor() {
		let db = process.env.ZERO_PERSISTENCE_DB;
		if (db === '::memory') this.backend = levelup(memdown());
		else this.backend = level(db);
	}
	async length() {
		return Number((await getValue(this.backend, 'length')) || 0);
	}
	async get(key) {
		return JSON.parse((await getValue(this.backend, toKey(key))) || '0') || null;
	}
	async getIndex(key) {
		return Number((await getValue(this.backend, toIndexKey(key))) || -1);
	}
	async getKeyFromIndex(index) {
		return (await getValue(this.backend, toKeyFromIndexKey(index))) || null;
	}
	async set(transferRequest) {
		const key = requestToKey(transferRequest);
		let index = await this.getIndex(key);
		if (!~index) {
			index = await this.length();
			await setValue(this.backend, 'length', String(index + 1));
		}
		await setValue(this.backend, toIndexKey(key), String(index));
		await setValue(this.backend, toKeyFromIndexKey(index), key);
		await setValue(this.backend, toKey(key), JSON.stringify(requestToPlain(transferRequest)));
		return key;
	}
	async remove(key) {
		const index = await this.getIndex(key);
		if (!~index) return false;
		await delValue(this.backend, toKey(key));
		return true;
	}
	async has(key) {
		return Boolean(await this.get(key));
	}
	async getStatus(key) {
		const transferRequest = await this.get(key);
		if (!transferRequest) return 'pending';
		return transferRequest.status || 'pending';
	}
	async setStatus(key, value) {
		const transferRequest = await this.get(key);
		transferRequest.status = value;
		await this.set(transferRequest);
	}
	async getAllRequests(filter?: string) {
		const length = await this.length();
		const result = [];
		for (let i = 0; i < length; i++) {
			const key = await this.getKeyFromIndex(i);
			const request = (await this.get(key)) as RequestWithStatus<Request>;
			request.status = request.status || 'pending';
			if (request && (!filter || request.requestType === filter)) {
				result.push(request);
			}
		}
		return result;
	}
	async getAllTransferRequests() {
		return await this.getAllRequests('transfer');
	}
	async getAllBurnRequests() {
		return await this.getAllRequests('burn');
	}
}
