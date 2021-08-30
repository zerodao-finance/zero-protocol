var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
// @ts-expect-error
import Redis from 'ioredis-mock';
import PeerId from 'peer-id';
import { bufferToString, fromJSONtoBuffer, stringToBuffer } from '../util';
const redis = new Redis();
const genHex = (size) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
class MockPubsub {
    constructor(peerId) {
        this.subscriptions = {};
        this.peerId = peerId;
    }
    on(channel, callback) {
        if (this.subscriptions[channel]) {
            this.subscriptions[channel].callbacks = [...this.subscriptions[channel].callbacks, callback];
        }
        else {
            this.subscriptions[channel] = {};
            this.subscriptions[channel].callbacks = [callback];
        }
    }
    async publish(channel, msg) {
        const payload = {
            from: this.peerId.toB58String(),
            data: bufferToString(msg),
        };
        return redis.publish(channel, JSON.stringify(payload));
    }
    async subscribe(channel) {
        const subClient = redis.createConnectedClient();
        if (!this.subscriptions[channel]) {
            throw new Error('Cannot subscribe to channel with no handlers');
        }
        subClient.on('message', (c, msg) => {
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
    async unsubscribe(channel) {
        const client = this.subscriptions[channel].client;
        if (client) {
            client.unsubscribe(channel);
        }
        else
            throw new Error('Never subscribed to this channel');
    }
}
class MockZeroConnection {
    constructor() {
        this.peerId = PeerId.createFromHexString(genHex(68));
        this.pubsub = new MockPubsub(this.peerId);
        redis.data.set(this.peerId.toB58String(), 'true');
        this.peerRouting = {
            findPeer: async function (id) {
                const exists = await redis.get(id);
                if (exists) {
                    return id;
                }
                else
                    throw new Error('Invalid keeper dial');
            },
        };
        this.transportManager = {
            getAddrs: function () {
                return ['test'];
            },
        };
    }
    async handle(protocol, callback) {
        const channel = `test/p2p/${this.peerId.toB58String()}`;
        await this.pubsub.on(channel, async (msg) => {
            callback({ stream: { source: msg.data } });
        });
        await this.pubsub.subscribe(channel);
    }
    async dialProtocol(peerId, protocol) {
        const sink = async (source) => {
            var e_1, _a;
            const vals = [];
            try {
                for (var source_1 = __asyncValues(source), source_1_1; source_1_1 = await source_1.next(), !source_1_1.done;) {
                    const val = source_1_1.value;
                    vals.push(val.toString().split('\x01').pop());
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (source_1_1 && !source_1_1.done && (_a = source_1.return)) await _a.call(source_1);
                }
                finally { if (e_1) throw e_1.error; }
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
//# sourceMappingURL=mockZero.js.map