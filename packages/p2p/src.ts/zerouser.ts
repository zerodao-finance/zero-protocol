import libp2p from "libp2p";
import { fromBufferToJSON } from "@zerodao/common";
import { ConnectionTypes } from "./types"
import pipe from "it-pipe";
import peerId from "peer-id";
import lp from "it-length-prefixed";
import { EventEmitter } from "events";

class P2PClient extends EventEmitter {
    conn: ConnectionTypes;
    keepers: string[];
    // TODO: implement logger > log: Logger; 
    log: Console
    _pending: Object;
    constructor (options: {
        conn: ConnectionTypes;
    }) {
        super ();
        this.conn = options.conn;
        this.keepers = [];
        this._pending = {};
        this.log = console;
    }

    async subscribeKeepers(): Promise<void> { }
    async unsubscribeKeepers(): Promise<void> { }
    handleConnections() { }
    async publishRequest(request, requestTemplate?, requestType: string = "transfer"): Promise<EventEmitter> { return this }
    async publishBurnRequest(burnReqeust): Promise<EventEmitter> { return this }
    async publishMetaRequest(metaRequest): Promise<EventEmitter> { return  this }
    async publishTransferRequest(transferRequest): Promise<EventEmitter> { return this }
}

export class ZeroUser extends P2PClient {
    constructor(options: { conn: ConnectionTypes }) {
        super(options);

    }


    async subscribeKeepers(): Promise<void> {
        await this.conn.start();
        this.conn.pubsub.on("zero.keepers", async (message: any) => {
            const { data, from } = message;
            const { address } = fromBufferToJSON(data);
            if (!this.keepers.includes(from)) {
                try {
                    this.keepers.push(from);
                    this.emit("keeper", from);
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
        this.log.info("Subscribed to keeper broadcasts");
    }

    async unsubscribeKeepers(): Promise<void> {
        this.log.debug("Keepers bfore unsubscription", this.keepers);
        try {
            await this.conn.pubsub.unsubscribe("zero.keepers");
        } catch (e: any) {
            this.log.error("Could not unsubscribe to keeper broadcasts");
            this.log.debug(e.message);
        }
        this.log.info("Unsubscribed to keeper broadcasts");
        this.keepers = [];
    }

    handleConnection(callback: Function): any {
        return ({stream}: { stream: any }) => {
            pipe(stream.source, lp.decode(), async (rawData: any) => {
                let string: any[] = [];
                for await (const msg of rawData) {
                    string.push(msg.toString());
                }
                callback(JSON.parse(string.join('')));
            });
        };
    }

    async publishRequest(request: any, requestTemplate?: string[], requestType: string = "transfer"): Promise<EventEmitter> {
        const requestFromTemplate = requestTemplate
            ? Object.fromEntries(Object.entries(request).filter(([k, v]) => requestTemplate.includes(k)))
            : request;

        console.log(request);

        const digest = request.signature;
        const result = (this._pending[digest] = new EventEmitter())
        if (this.keepers.length === 0) {
            this.log.error(`Cannot publish ${requestType} request if no keepers are found`)
            return result;
        }
        try {
            let ackReceived = false;

            for (const keeper of this.keepers) {

                // @ts-expect-error
                // ackReceieved set to true in the handler of /zero/user/confirmation
                if (ackReceived !== true) { 
                    try {
                        const peer = await peerId.createFromB58String(keeper);
                        const { stream } = await this.conn.dialProtocol(peer, '/zero/1.1.0/dispatch');
                        pipe(JSON.stringify(requestFromTemplate), lp.encode(), stream.sink);
                        this.log.info(`Published ${requestType} request to ${keeper}. Waiting for keeper confirmation`);
                    } catch (e: any) {
                        this.log.error(`Failed dialing keeper: ${keeper} for txDispatch`);
                        this.log.error(e.stack);
                    }
                } else { }
            }
        } catch (e) {
            console.error(e);
        }

        return result
    }

    async publishBurnRequest(burnRequest: any): Promise<EventEmitter> {
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
	async publishMetaRequest(metaRequest: any): Promise<EventEmitter> {
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

	async publishTransferRequest(transferRequest: any): Promise<EventEmitter> {
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