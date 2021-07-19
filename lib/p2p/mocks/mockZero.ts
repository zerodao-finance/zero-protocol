// @ts-expect-error
import Redis from 'ioredis-mock';
import PeerId from 'peer-id';
import { bufferToString, fromJSONtoBuffer, stringToBuffer } from '../util';
import { PayloadType, Subscriptions } from './types';

const redis = new Redis();

const genHex = (size: number): string =>
	[...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

class MockPubsub {
	subscriptions: Subscriptions;
	peerId: PeerId;

	constructor(peerId: PeerId) {
		this.subscriptions = {};
		this.peerId = peerId;
	}

	on(channel: string, callback: (arg0: PayloadType) => void) {
		if (this.subscriptions[channel]) {
			this.subscriptions[channel].callbacks = [...this.subscriptions[channel].callbacks, callback];
		} else {
			this.subscriptions[channel] = {};
			this.subscriptions[channel].callbacks = [callback];
		}
	}

	async publish(channel: string, msg: Uint8Array) {
		const payload: PayloadType = {
			from: this.peerId.toB58String(),
			data: bufferToString(msg),
		};
		return redis.publish(channel, JSON.stringify(payload));
	}

	async subscribe(channel: string) {
		const subClient = redis.createConnectedClient();
		if (!this.subscriptions[channel]) {
			throw new Error('Cannot subscribe to channel with no handlers');
		}
		subClient.on('message', (c: string, msg: string) => {
			if (c === channel) {
				this.subscriptions[channel].callbacks.forEach((cb) => {
					const message = JSON.parse(msg);
					const formatted = {
						from: message.from,
						data: stringToBuffer(message.data),
					};
					cb(formatted);
				});
			}
		});
		await subClient.subscribe(channel);
		this.subscriptions[channel].client = subClient;
	}

	async unsubscribe(channel: string) {
		const client = this.subscriptions[channel].client;
		if (client) {
			client.unsubscribe(channel);
		} else throw new Error('Never subscribed to this channel');
	}
}

class MockZeroConnection {
	peerId: PeerId;
	pubsub: MockPubsub;
	peerRouting: { findPeer: (id: string) => Promise<string> };
	transportManager: { getAddrs: () => string[] };

	constructor() {
		this.peerId = PeerId.createFromHexString(genHex(68));
		this.pubsub = new MockPubsub(this.peerId);
		redis.data.set(this.peerId.toB58String(), 'true');
		this.peerRouting = {
			findPeer: async function (id) {
				const exists = await redis.get(id);
				if (exists) {
					return id;
				} else throw new Error('Invalid keeper dial');
			},
		};
		this.transportManager = {
			getAddrs: function () {
				return ['test'];
			},
		};
	}

	async handle(protocol: string, callback: (arg0: any) => void) {
		const channel = `test/p2p/${this.peerId.toB58String()}`;
		await this.pubsub.on(channel, async (msg) => {
			callback({ stream: { source: msg.data } });
		});
		await this.pubsub.subscribe(channel);
	}

	async dialProtocol(peerId: string, protocol: string) {
		const sink = async (source: any) => {
			const vals = [];
			for await (const val of source) {
				vals.push(val.toString().split('\x01').pop());
			}
			await this.pubsub.publish(peerId, fromJSONtoBuffer(JSON.parse(vals.join(''))));
		};
		return {
			stream: {
				sink,
			},
		};
	}

	destroy() {
		this.pubsub = null;
	}
}

export { MockZeroConnection, MockPubsub, redis, bufferToString, stringToBuffer };
