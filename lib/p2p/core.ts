'use strict';
import libp2p from 'libp2p/src/index'; // @ts-ignore
import path from 'path';
import createLogger, { Logger } from '../logger';
//import { MockZeroConnection } from './mocks';
import { fromJSONtoBuffer, fromBufferToJSON } from './util';
import pipe from 'it-pipe';
import lp from 'it-length-prefixed';
import { ConnectionTypes } from './types';
import { TransferRequest } from '../types';
import { PersistenceAdapter, InMemoryPersistenceAdapter } from '../persistence';
import { Buffer } from 'buffer';
import peerId = require('peer-id');
import peerInfo = require('peer-info');
import { EventEmitter } from 'events';
import { utils } from 'ethers';
import { deepCopy } from '@ethersproject/properties';
import { getProvider } from '../deployment-utils';
import ZeroControllerDeploy from '../../deployments/arbitrum/ZeroController.json';

const listeners = {
	burn: ['burn'],
	meta: ['meta'],
	transfer: ['repay', 'loan'],
};

class ZeroConnection extends libp2p {}

async function addContractWait(iface: utils.Interface, tx: any, provider: any) {
	const wait = tx.wait.bind(tx);
	tx.wait = (confirmations?: number) => {
		return wait(confirmations).then((receipt: any) => {
			receipt.events = receipt.logs.map((log: any) => {
				let event = deepCopy(log);
				let parsed = null;
				try {
					parsed = iface.parseLog(log);
				} catch (e) {}
				if (parsed) {
					event.args = parsed.args;
					event.decode = (data: any, topics?: Array<any>) => {
						return iface.decodeEventLog(parsed.eventFragment, data, topics);
					};
					event.event = parsed.name;
					event.eventSignature = parsed.signature;
					event.removeListener = () => provider;
					event.getBlock = () => provider.getBlock(receipt.blockHash);
					event.getTransaction = () => provider.getTransaction(receipt.transactionHash);
					event.getTransactionReceipt = () => Promise.resolve(receipt);
				}

				return event;
			});
			return receipt;
		});
	};
}

class ZeroUser extends EventEmitter {
	conn: ConnectionTypes;
	keepers: string[];
	log: Logger;
	storage: PersistenceAdapter<any, any>;

	constructor(connection: ConnectionTypes, persistence?: PersistenceAdapter<any, any>) {
		super();
		this.conn = connection;
		this.conn.on('peer:discovery', () => console.log('discovered!'));
		this.keepers = [];
		this.log = createLogger('zero.user');
		this.storage = persistence ?? new InMemoryPersistenceAdapter();
	}

	async subscribeKeepers() {
		this.conn.pubsub.on('zero.keepers', async (message: any) => {
			const { data, from } = message;
			const { address } = fromBufferToJSON(data);
			if (!this.keepers.includes(from)) {
				try {
					this.keepers.push(from);
					this.emit('keeper', from);
					this.log.debug(`Keeper Details: `, {
						from,
					});
					this.log.info(`Found keeper: ${from} with address ${address}`);
				} catch (e: any) {
					this.log.error(`Timed out finding keeper: ${from}`);
					this.log.debug(e.message);
				}
			}
		});
		this.conn.pubsub.subscribe('zero.keepers');
		this.log.info('Subscribed to keeper broadcasts');
	}

	async unsubscribeKeepers() {
		this.log.debug('Keepers before unsubscription', this.keepers);
		try {
			await this.conn.pubsub.unsubscribe('zero.keepers');
		} catch (e: any) {
			this.log.error('Could not unsubscribe to keeper broadcasts');
			this.log.debug(e.message);
		}
		this.log.info('Unsubscribed to keeper broadcasts');
		this.keepers = [];
	}

	handleConnection(callback: Function) {
		return ({ stream }: { stream: any }) => {
			pipe(stream.source, lp.decode(), async (rawData: any) => {
				let string = [];
				for await (const msg of rawData) {
					string.push(msg.toString());
				}
				callback(JSON.parse(string.join('')));
			});
		};
	}
	async publishRequest(request: any, requestTemplate?: string[], requestType: string = 'transfer') {
		const requestFromTemplate = requestTemplate
			? Object.fromEntries(Object.entries(request).filter(([k, v]) => requestTemplate.includes(k)))
			: request;

		console.log(request);

		let result = {
			meta: null,
			burn: null,
			loan: null,
			repay: null,
		};
		console.log('requestFromTemplate', requestFromTemplate);
		const key = await this.storage.set(requestFromTemplate);
		if (this.keepers.length === 0) {
			this.log.error(`Cannot publish ${requestType} request if no keepers are found`);
			return result;
		}
		const provider = await getProvider(request);
		try {
			let ackReceived = false;
			// should add handler for rejection
			listeners[requestType].map((d) => {
				result[d] = new Promise(async (resolve) => {
					this.conn.handle(
						`/zero/user/${d}Dispatch`,
						this.handleConnection((tx: any) => {
							tx.wait = (confirms?: number) => provider.waitForTransaction(tx.hash, confirms);
							addContractWait(new utils.Interface(ZeroControllerDeploy.abi), tx, provider);
							resolve(tx);
						}),
					);
				});
			});

			await this.conn.handle(
				'/zero/user/confirmation',
				this.handleConnection(async ({ txConfirmation }) => {
					await this.storage.setStatus(key, 'succeeded');
					ackReceived = true;
					this.log.info(`txDispatch confirmed: ${txConfirmation}`);
				}),
			);
			for (const keeper of this.keepers) {
				// Typescript error: This condition will always return 'true' since the types 'false' and 'true' have no overlap.
				// This is incorrect, because ackReceived is set to true in the handler of /zero/user/confirmation
				// @ts-expect-error
				if (ackReceived !== true) {
					try {
						const peer = await peerId.createFromB58String(keeper);
						const { stream } = await this.conn.dialProtocol(peer, '/zero/keeper/dispatch');
						pipe(JSON.stringify(requestFromTemplate), lp.encode(), stream.sink);
						this.log.info(`Published transfer request to ${keeper}. Waiting for keeper confirmation.`);
					} catch (e: any) {
						this.log.error(`Failed dialing keeper: ${keeper} for txDispatch`);
						this.log.error(e.stack);
					}
				} else {
					break;
				}
			}
		} catch (e: any) {
			this.log.error('Could not publish transfer request');
			this.log.debug(e.message);
			Object.keys(result).map((d) => {
				result[d] = null;
			});
			return result;
		}
		return result;
	}

	async publishBurnRequest(burnRequest: any) {
		return await this.publishRequest(
			burnRequest,
			[
				'asset',
				'chainId',
				'contractAddress',
				'data',
				'module',
				'nonce',
				'pNonce',
				'signature',
				'underwriter',
				'owner',
				'amount',
				'deadline',
				'destination',
				'requestType',
			],
			'burn',
		);
	}
	async publishMetaRequest(metaRequest: any) {
		return await this.publishRequest(
			metaRequest,
			[
				'asset',
				'chainId',
				'contractAddress',
				'data',
				'module',
				'nonce',
				'pNonce',
				'signature',
				'underwriter',
				'addressFrom',
				'requestType',
			],
			'meta',
		);
	}

	async publishTransferRequest(transferRequest: any) {
		return await this.publishRequest(transferRequest, [
			'amount',
			'asset',
			'chainId',
			'contractAddress',
			'data',
			'module',
			'nonce',
			'pNonce',
			'signature',
			'to',
			'underwriter',
			'requestType',
		]);
	}
}

class ZeroKeeper {
	storage: PersistenceAdapter<any, any>;
	conn: ConnectionTypes;
	dispatches: any[];
	log: Logger;
	active: NodeJS.Timeout;

	constructor(connection: ConnectionTypes, persistence?: PersistenceAdapter<any, any>) {
		this.conn = connection;
		this.conn.on('peer:discovery', () => console.log('discovered from keeper!'));
		this.dispatches = [];
		this.log = createLogger('zero.keeper');
		this.storage = persistence ?? new InMemoryPersistenceAdapter();
	}

	setPersistence(adapter: any) {
		this.storage = adapter;
	}
	async advertiseAsKeeper(address: string) {
		this.active = setInterval(async () => {
			try {
				await this.conn.pubsub.publish(
					'zero.keepers',
					fromJSONtoBuffer({
						address,
					}),
				);
				this.log.debug(`Made presence known ${this.conn.peerId.toB58String()}`);
			} catch (e: any) {
				console.debug(e);
				this.log.info('Could not make presence known. Retrying in 1s');
				this.log.debug(e.message);
			}
		}, 1000);
		this.log.info('Started to listen for tx dispatch requests');
	}

	makeReplyDispatcher(remotePeer: any) {
		const replyDispatcher = async (target: string, data: Object) => {
			const { stream } = await this.conn.dialProtocol(remotePeer, target);
			pipe(JSON.stringify(data), lp.encode(), stream.sink);
		};
		return replyDispatcher;
	}
	async setTxDispatcher(callback: Function) {
		const handler = async (duplex: any) => {
			const stream: any = duplex.stream;
			pipe(stream.source, lp.decode(), async (rawData: any) => {
				// TODO: match handle and dialProtocol spec
				/*if (process?.env.NODE_ENV === 'test') {
					callback(fromBufferToJSON(stream.source));
					return;
				}*/
				let string = [];
				for await (const msg of rawData) {
					string.push(msg.toString());
				}
				const transferRequest = JSON.parse(string.join(''));
				await (
					this.storage || {
						async set() {
							return 0;
						},
					}
				).set(transferRequest);
				callback(transferRequest, this.makeReplyDispatcher(duplex.connection.remotePeer));
			});
		};
		await this.conn.handle('/zero/keeper/dispatch', handler);
		this.log.info('Set the tx dispatcher');
	}

	destroy() {
		clearTimeout(this.active);
	}
}

export { ZeroKeeper, ZeroUser, ZeroConnection };
