'use strict';
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import libp2p from 'libp2p';
import createLogger from '../logger';
//import { MockZeroConnection } from './mocks';
import { fromJSONtoBuffer, fromBufferToJSON } from './util';
import pipe from 'it-pipe';
import lp from 'it-length-prefixed';
import { InMemoryPersistenceAdapter } from '../persistence';
class ZeroConnection extends libp2p {
}
class ZeroUser {
    constructor(connection, persistence) {
        this.conn = connection;
        this.keepers = [];
        this.log = createLogger('zero.user');
        this.storage = persistence !== null && persistence !== void 0 ? persistence : new InMemoryPersistenceAdapter();
    }
    async subscribeKeepers() {
        this.conn.pubsub.on('zero.keepers', async (message) => {
            const { data, from } = message;
            const { address } = fromBufferToJSON(data);
            if (!this.keepers.includes(from)) {
                try {
                    this.keepers.push(from);
                    this.log.debug(`Keeper Details: `, {
                        from,
                    });
                    this.log.info(`Found keeper: ${from} with address ${address}`);
                }
                catch (e) {
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
        }
        catch (e) {
            this.log.error('Could not unsubscribe to keeper broadcasts');
            this.log.debug(e.message);
        }
        this.log.info('Unsubscribed to keeper broadcasts');
        this.keepers = [];
    }
    async publishTransferRequest(transferRequest) {
        const key = await this.storage.set(transferRequest);
        if (this.keepers.length === 0) {
            this.log.error('Cannot publish transfer request if no keepers are found');
            return;
        }
        try {
            let ackReceived = false;
            // should add handler for rejection
            await this.conn.handle('/zero/user/confirmation', async ({ stream }) => {
                pipe(stream.source, lp.decode(), async (rawData) => {
                    var e_1, _a;
                    let string = [];
                    try {
                        for (var rawData_1 = __asyncValues(rawData), rawData_1_1; rawData_1_1 = await rawData_1.next(), !rawData_1_1.done;) {
                            const msg = rawData_1_1.value;
                            string.push(msg.toString());
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (rawData_1_1 && !rawData_1_1.done && (_a = rawData_1.return)) await _a.call(rawData_1);
                        }
                        finally { if (e_1) throw e_1.error; }
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
                        const signallingServer = this.conn.transportManager.getAddrs()[0];
                        const peerAddr = `${signallingServer}/p2p/${keeper}`;
                        const { stream } = await this.conn.dialProtocol(peerAddr, '/zero/keeper/dispatch');
                        pipe(JSON.stringify(transferRequest), lp.encode(), stream.sink);
                        this.log.info(`Published transfer request to ${keeper}. Waiting for keeper confirmation.`);
                    }
                    catch (e) {
                        this.log.error(`Failed dialing keeper: ${keeper} for txDispatch`);
                        this.log.debug(e.message);
                    }
                }
                else {
                    break;
                }
            }
        }
        catch (e) {
            this.log.error('Could not publish transfer request');
            this.log.debug(e.message);
            return;
        }
    }
}
class ZeroKeeper {
    constructor(connection) {
        this.conn = connection;
        this.dispatches = [];
        this.log = createLogger('zero.keeper');
    }
    async advertiseAsKeeper(address) {
        this.active = setInterval(async () => {
            try {
                await this.conn.pubsub.publish('zero.keepers', fromJSONtoBuffer({
                    address,
                }));
                this.log.debug(`Made presence known ${this.conn.peerId.toB58String()}`);
            }
            catch (e) {
                console.debug(e);
                this.log.info('Could not make presence known. Retrying in 1s');
                this.log.debug(e.message);
            }
        }, 1000);
        this.log.info('Started to listen for tx dispatch requests');
    }
    async setTxDispatcher(callback) {
        const handler = async (duplex) => {
            const stream = duplex.stream;
            pipe(stream.source, lp.decode(), async (rawData) => {
                var e_2, _a;
                // TODO: match handle and dialProtocol spec
                if ((process === null || process === void 0 ? void 0 : process.env.NODE_ENV) === 'test') {
                    callback(fromBufferToJSON(stream.source));
                    return;
                }
                let string = [];
                try {
                    for (var rawData_2 = __asyncValues(rawData), rawData_2_1; rawData_2_1 = await rawData_2.next(), !rawData_2_1.done;) {
                        const msg = rawData_2_1.value;
                        string.push(msg.toString());
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (rawData_2_1 && !rawData_2_1.done && (_a = rawData_2.return)) await _a.call(rawData_2);
                    }
                    finally { if (e_2) throw e_2.error; }
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
//# sourceMappingURL=core.js.map