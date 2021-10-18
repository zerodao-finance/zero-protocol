"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultBitcoinClient = exports.BitcoinClient = exports.fetchAverageBitcoinConfirmationTime = exports.fetchBitcoinPriceHistory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const helpers_1 = require("../util/helpers");
// @ts-ignore
const bitcoin_core_1 = __importDefault(require("bitcoin-core"));
const axios_1 = __importDefault(require("axios"));
const BTCHandler_1 = require("send-crypto/build/main/handlers/BTC/BTCHandler");
const fetchBitcoinPriceHistory = async (confirmationTime) => {
    const numConfTime = parseFloat(confirmationTime);
    if (isNaN(numConfTime))
        return undefined;
    const oldPriceIndex = Math.ceil(numConfTime / 5) + 1;
    const cgResponse = await (0, helpers_1.fetchData)(() => fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=.1&interval=minute'));
    const prices = cgResponse ? cgResponse['prices'] : undefined;
    // Coingecko returns data in oldest -> newest format so we pull data from the end
    return prices
        ? {
            currentPrice: new bignumber_js_1.default(prices[prices.length - 1][1]),
            oldPrice: new bignumber_js_1.default(prices[prices.length - oldPriceIndex][1]),
        }
        : undefined;
};
exports.fetchBitcoinPriceHistory = fetchBitcoinPriceHistory;
const fetchAverageBitcoinConfirmationTime = async () => {
    const stats = await (0, helpers_1.fetchData)(() => fetch(`https://blockchain.info/stats?format=json&cors=true`));
    const blockLengthMinutes = stats ? parseFloat(stats['minutes_between_blocks']) : 60;
    return (blockLengthMinutes * 6).toFixed(1);
};
exports.fetchAverageBitcoinConfirmationTime = fetchAverageBitcoinConfirmationTime;
class BitcoinClient extends bitcoin_core_1.default {
    constructor(o) {
        super(o);
        this.addHeaders = o.addHeaders || {};
        this.request.$getAsync = this.request.getAsync;
        this.request.$postAsync = this.request.postAsync;
        const self = this;
        this.request.getAsync = function (o) {
            return self.request.$getAsync.call(self.request, Object.assign(Object.assign({}, o), { headers: self.addHeaders }));
        };
        this.request.postAsync = function (o) {
            return self.request.$postAsync.call(self.request, Object.assign(Object.assign({}, o), { headers: self.addHeaders }));
        };
    }
}
exports.BitcoinClient = BitcoinClient;
const resultToJsonRpc = async (id, fn) => {
    try {
        return {
            jsonrpc: '2.0',
            id,
            result: await fn()
        };
    }
    catch (e) {
        return {
            jsonrpc: '2.0',
            id,
            error: e
        };
    }
};
class BTCBackend {
    constructor(options) {
        this.testnet = options.network && options.network === 'testnet';
        this.handler = BTCHandler_1.BTCHandler;
        this.name = 'btc';
        this.prefixes = ['btc'];
        this.id = 0;
    }
    async sendPromise({ id, method, params }) {
        switch (method) {
            case 'btc_getUTXOs':
                return await resultToJsonRpc(id, async () => await this.handler.getUTXOs(this.testnet, ...params));
        }
    }
    send(o, cb) {
        this.sendPromise(o).then((result) => cb(null, result)).catch((err) => cb(err));
    }
    async sendWrapped(method, params) {
        const response = await new Promise((resolve, reject) => this.send({
            id: this.id++,
            method,
            params,
            jsonrpc: '2.0'
        }, (err, result) => err ? reject(err) : resolve(result)));
        if (response.error)
            throw response.error;
        return response.result;
    }
    async listReceivedByAddress(params) {
        return await this.sendWrapped('btc_getUTXOs', [{
                confirmations: params.confirmations || 1,
                address: params.address
            }]);
    }
}
const getDefaultBitcoinClient = () => {
    const network = process.env.CHAIN;
    return new BTCBackend({ network });
};
exports.getDefaultBitcoinClient = getDefaultBitcoinClient;
const getSingleAddressBlockchainInfo = async (address) => {
    const { data, status } = await axios_1.default.get('https://blockchain.info/rawaddr/' + address + '?cors=true');
    if (status !== 200)
        throw Error('status code - ' + String(status));
    return data;
};
const getListReceivedByAddressBlockchainInfo = async (address) => {
    const singleAddress = await getSingleAddressBlockchainInfo(address);
    const { txs, total_received, address: addressResult } = singleAddress;
    return {
        txids: txs,
        amount: total_received,
        address: addressResult
    };
};
/*
export const getDefaultBitcoinClient = () => {
              const client = new BitcoinClient({
        network: 'mainnet',
        host: 'btccore-main.bdnodes.net',
        port: 443,
        ssl: {
            enabled: true,
            strict: true,
        },
        username: 'blockdaemon',
        password: 'blockdaemon',
        addHeaders: {
            'X-Auth-Token': 'vm9Li06gY2hCWXuPt-y9s5nEUVQpzUC6TfC7XTdgphg',
            'Content-Type': 'application/json'
        },
    });
    (client as any).listReceivedByAddress = getListReceivedByAddressBlockchainInfo;
    return client;
};
*/
/*export const getDefaultBitcoinClient = () => {
    const client = new BitcoinClient({
        network: 'mainnet',
        host: 'buupdvmqajdr42o18i2g.bdnodes.net',
        port: 443,
        ssl: {
            enabled: true,
            strict: true,
        },
        username: 'blockdaemon',
        password: 'blockdaemon',
        addHeaders: {
            'X-Auth-Token': 'EhpzhOruGOdC9wyMG5mERa5o_So4TlZfSO2yzsdjEac',
            'Content-Type': 'application/json'
        },
    });
    return client;
};
*/ 
//# sourceMappingURL=btc.js.map