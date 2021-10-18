import BigNumber from 'bignumber.js';
import Client from 'bitcoin-core';
export declare const fetchBitcoinPriceHistory: (confirmationTime: string) => Promise<{
    currentPrice: BigNumber;
    oldPrice: BigNumber;
}>;
export declare const fetchAverageBitcoinConfirmationTime: () => Promise<string>;
export declare class BitcoinClient extends Client {
    addHeaders: {
        [key: string]: string;
    };
    request: {
        [key: string]: any;
    };
    constructor(o: any);
}
declare class BTCBackend {
    testnet: boolean;
    handler: any;
    name: string;
    prefixes: any[];
    id: number;
    constructor(options: any);
    sendPromise({ id, method, params }: {
        id: any;
        method: any;
        params: any;
    }): Promise<{
        jsonrpc: string;
        id: any;
        result: any;
        error?: undefined;
    } | {
        jsonrpc: string;
        id: any;
        error: any;
        result?: undefined;
    }>;
    send(o: any, cb: any): void;
    sendWrapped(method: any, params: any): Promise<any>;
    listReceivedByAddress(params: any): Promise<any>;
}
export declare const getDefaultBitcoinClient: () => BTCBackend;
export {};
