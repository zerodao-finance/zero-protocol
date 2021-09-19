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
export declare const getDefaultBitcoinClient: () => BitcoinClient;
