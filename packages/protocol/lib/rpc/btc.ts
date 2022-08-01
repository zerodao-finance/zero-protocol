import BigNumber from 'bignumber.js';
import { fetchData } from '../util/helpers';
// @ts-ignore
import Client from 'bitcoin-core';
import axios from 'axios';
import { BTCHandler as handler } from 'send-crypto/build/main/handlers/BTC/BTCHandler';

interface CgPriceResponse {
	prices: number[][];
}

interface BtcConfirmationResponse {
	minutes_between_blocks: string;
}

export const fetchBitcoinPriceHistory = async (confirmationTime: string) => {
	const numConfTime = parseFloat(confirmationTime);
	if (isNaN(numConfTime)) return undefined;
	const oldPriceIndex = Math.ceil(numConfTime / 5) + 1;
	const cgResponse: CgPriceResponse | null = await fetchData(() =>
		fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=.1&interval=minute'),
	);
	const prices = cgResponse ? cgResponse['prices'] : undefined;
	// Coingecko returns data in oldest -> newest format so we pull data from the end
	return prices
		? {
			currentPrice: new BigNumber(prices[prices.length - 1][1]),
			oldPrice: new BigNumber(prices[prices.length - oldPriceIndex][1]),
		}
		: undefined;
};

export const fetchAverageBitcoinConfirmationTime = async () => {
	const stats: BtcConfirmationResponse | null = await fetchData(() =>
		fetch(`https://blockchain.info/stats?format=json&cors=true`),
	);
	const blockLengthMinutes = stats ? parseFloat(stats['minutes_between_blocks']) : 60;
	return (blockLengthMinutes * 6).toFixed(1);
};

export class BitcoinClient extends Client {
	addHeaders: { [key: string]: string };
	request: { [key: string]: any };
	constructor(o: any) {
		super(o);
		this.addHeaders = o.addHeaders || {};
		this.request.$getAsync = this.request.getAsync;
		this.request.$postAsync = this.request.postAsync;
		const self = this;
		this.request.getAsync = function (o: any) {
			return self.request.$getAsync.call(self.request, {
				...o,
				headers: self.addHeaders,
			});
		};
		this.request.postAsync = function (o: any) {
			return self.request.$postAsync.call(self.request, {
				...o,
				headers: self.addHeaders,
			});
		};
	}
}


const resultToJsonRpc = async (id: any, fn: any) => {
	try {
		return {
			jsonrpc: '2.0',
			id,
			result: await fn()
		};
	} catch (e) {
		return {
			jsonrpc: '2.0',
			id,
			error: e
		};
	}
};

class BTCBackend {
	testnet: boolean;
	handler: any;
	name: string;
	prefixes: any[];
	id: number;

	constructor(options: any) {
		this.testnet = options.network && options.network === 'testnet';
		this.handler = handler;
		this.name = 'btc';
		this.prefixes = ['btc'];
		this.id = 0;
	}
	async sendPromise({
		id,
		method,
		params
	}) {
		switch (method) {
			case 'btc_getUTXOs':
				return await resultToJsonRpc(id, async () => await this.handler.getUTXOs(this.testnet, ...params));
		}
	}
	send(o: any, cb: any) {
		this.sendPromise(o).then((result) => cb(null, result)).catch((err) => cb(err));
	}

	async sendWrapped(method: any, params: any) {
		const response: any = await new Promise((resolve, reject) => this.send({
			id: this.id++,
			method,
			params,
			jsonrpc: '2.0'
		}, (err, result) => err ? reject(err) : resolve(result)));
		if (response.error) throw response.error;
		return response.result;
	}

	async listReceivedByAddress(params: any) {
		return await this.sendWrapped(
			'btc_getUTXOs',
			[{
				confirmations: params.confirmations || 1,
				address: params.address
			}]
		)
	}
}

export const getDefaultBitcoinClient = () => {
	const network = process.env.CHAIN;
	return new BTCBackend({ network })
}


const getSingleAddressBlockchainInfo = async (address) => {
	const { data, status } = await axios.get('https://blockchain.info/rawaddr/' + address + '?cors=true');
	if (status !== 200) throw Error('status code - ' + String(status));
	return data;
};

const getListReceivedByAddressBlockchainInfo = async (address) => {
	const singleAddress = await getSingleAddressBlockchainInfo(address);
	const {
		txs,
		total_received,
		address: addressResult
	} = singleAddress;
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