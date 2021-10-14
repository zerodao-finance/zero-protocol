'use strict';
import libp2p from 'libp2p';
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

class ZeroConnection extends libp2p {}

class ZeroUser {
	conn: ConnectionTypes;
	keepers: string[];
	log: Logger;
	storage: PersistenceAdapter<any, any>;

	constructor(connection: ConnectionTypes, persistence?: PersistenceAdapter<any, any>) {
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

	async publishTransferRequest(transferRequest: TransferRequest) {
		const key = await this.storage.set(transferRequest);
		if (this.keepers.length === 0) {
			this.log.error('Cannot publish transfer request if no keepers are found');
			return;
		}
		try {
			let ackReceived = false;
			// should add handler for rejection

			await this.conn.handle('/zero/user/confirmation', async ({ stream }: { stream: any }) => {
				pipe(stream.source, lp.decode(), async (rawData: any) => {
					let string = [];
					for await (const msg of rawData) {
						string.push(msg.toString());
					}
					const { txConfirmation } = JSON.parse(string.join(''));
					await this.storage.setStatus(key, 'succeeded');
					ackReceived = true;
					this.log.info(`txDispatch confirmed: ${txConfirmation}`);
				});
			});
			for (const keeper of this.keepers) {
				// Typescript error: This condition will always return 'true' since the types 'false' and 'true' have no overlap.
				// This is incorrect, because ackReceived is set to true in the handler of /zero/user/confirmation
				// @ts-expect-error
				if (ackReceived !== true) {
					try {
						const peer = await peerId.createFromB58String(keeper);
						const { stream } = await this.conn.dialProtocol(peer, '/zero/keeper/dispatch');
						pipe(JSON.stringify(transferRequest), lp.encode(), stream.sink);
						this.log.info(`Published transfer request to ${keeper}. Waiting for keeper confirmation.`);
					} catch (e: any) {
						this.log.error(`Failed dialing keeper: ${keeper} for txDispatch`);
						this.log.debug(e.stack);
					}
				} else {
					break;
				}
			}
		} catch (e: any) {
			this.log.error('Could not publish transfer request');
			this.log.debug(e.message);
			return;
		}
	}
}

class ZeroKeeper {
	conn: ConnectionTypes;
	dispatches: any[];
	log: Logger;
	active: NodeJS.Timeout;

	constructor(connection: ConnectionTypes) {
		this.conn = connection;
		this.conn.on('peer:discovery', () => console.log('discovered from keeper!'));
		this.dispatches = [];
		this.log = createLogger('zero.keeper');
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

	async setTxDispatcher(callback: Function) {
		const handler = async (duplex: any) => {
			const stream: any = duplex.stream;
			pipe(stream.source, lp.decode(), async (rawData: any) => {
				// TODO: match handle and dialProtocol spec
				if (process?.env.NODE_ENV === 'test') {
					callback(fromBufferToJSON(stream.source));
					return;
				}
				let string = [];
				for await (const msg of rawData) {
					string.push(msg.toString());
				}
				callback(JSON.parse(string.join('')));
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
