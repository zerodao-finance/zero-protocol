"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeroUser = void 0;
const common_1 = require("@zerodao/common");
const it_pipe_1 = __importDefault(require("it-pipe"));
const peer_id_1 = __importDefault(require("peer-id"));
const it_length_prefixed_1 = __importDefault(require("it-length-prefixed"));
const events_1 = require("events");
class P2PClient extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.conn = options.conn;
        this.keepers = [];
        this._pending = {};
        this.log = console;
    }
    async subscribeKeepers() { }
    async unsubscribeKeepers() { }
    handleConnections() { }
    async publishRequest(request, requestTemplate, requestType = "transfer") { return this; }
    async publishBurnRequest(burnReqeust) { return this; }
    async publishMetaRequest(metaRequest) { return this; }
    async publishTransferRequest(transferRequest) { return this; }
}
class ZeroUser extends P2PClient {
    constructor(options) {
        super(options);
    }
    async subscribeKeepers() {
        await this.conn.start();
        this.conn.pubsub.on("zero.keepers", async (message) => {
            const { data, from } = message;
            const { address } = (0, common_1.fromBufferToJSON)(data);
            if (!this.keepers.includes(from)) {
                try {
                    this.keepers.push(from);
                    this.emit("keeper", from);
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
        this.log.info("Subscribed to keeper broadcasts");
    }
    async unsubscribeKeepers() {
        this.log.debug("Keepers bfore unsubscription", this.keepers);
        try {
            await this.conn.pubsub.unsubscribe("zero.keepers");
        }
        catch (e) {
            this.log.error("Could not unsubscribe to keeper broadcasts");
            this.log.debug(e.message);
        }
        this.log.info("Unsubscribed to keeper broadcasts");
        this.keepers = [];
    }
    handleConnection(callback) {
        return ({ stream }) => {
            (0, it_pipe_1.default)(stream.source, it_length_prefixed_1.default.decode(), async (rawData) => {
                let string = [];
                for await (const msg of rawData) {
                    string.push(msg.toString());
                }
                callback(JSON.parse(string.join('')));
            });
        };
    }
    async publishRequest(request, requestTemplate, requestType = "transfer") {
        const requestFromTemplate = requestTemplate
            ? Object.fromEntries(Object.entries(request).filter(([k, v]) => requestTemplate.includes(k)))
            : request;
        console.log(request);
        const digest = request.signature;
        const result = (this._pending[digest] = new events_1.EventEmitter());
        if (this.keepers.length === 0) {
            this.log.error(`Cannot publish ${requestType} request if no keepers are found`);
            return result;
        }
        try {
            let ackReceived = false;
            for (const keeper of this.keepers) {
                // @ts-expect-error
                // ackReceieved set to true in the handler of /zero/user/confirmation
                if (ackReceived !== true) {
                    try {
                        const peer = await peer_id_1.default.createFromB58String(keeper);
                        const { stream } = await this.conn.dialProtocol(peer, '/zero/1.1.0/dispatch');
                        (0, it_pipe_1.default)(JSON.stringify(requestFromTemplate), it_length_prefixed_1.default.encode(), stream.sink);
                        this.log.info(`Published ${requestType} request to ${keeper}. Waiting for keeper confirmation`);
                    }
                    catch (e) {
                        this.log.error(`Failed dialing keeper: ${keeper} for txDispatch`);
                        this.log.error(e.stack);
                    }
                }
                else { }
            }
        }
        catch (e) {
            console.error(e);
        }
        return result;
    }
    async publishBurnRequest(burnRequest) {
        return await this.publishRequest(burnRequest, [
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
        ], 'burn');
    }
    async publishMetaRequest(metaRequest) {
        return await this.publishRequest(metaRequest, [
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
        ], 'meta');
    }
    async publishTransferRequest(transferRequest) {
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
exports.ZeroUser = ZeroUser;
//# sourceMappingURL=zerouser.js.map