'use strict';

const Client = require('bitcoin-core');
const request = require('request');

const fetch = async (url) =>
	await new Promise((resolve, reject) =>
		request({ url, method: 'GET' }, (err, resp) => (err ? reject(err) : resolve(JSON.parse(resp.body)))),
	);

exports.fetchBitcoinPriceHistory = async (confirmationTime) => {
	const numConfTime = parseFloat(confirmationTime);
	if (isNaN(numConfTime)) return undefined;
	const oldPriceIndex = Math.ceil(numConfTime / 5) + 1;
	const cgResponse = await fetch(
		'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=.1&interval=minute',
	);
	const prices = cgResponse ? cgResponse.prices : undefined;
	// Coingecko returns data in oldest -> newest format so we pull data from the end
	return prices
		? {
				currentPrice: new BigNumber(prices[prices.length - 1][1]),
				oldPrice: new BigNumber(prices[prices.length - oldPriceIndex][1]),
		  }
		: undefined;
};

exports.fetchAverageBitcoinConfirmationTime = async () => {
	const stats = await fetch(`https://blockchain.info/stats?format=json&cors=true`);
	const blockLengthMinutes = stats ? parseFloat(stats['minutes_between_blocks']) : 60;
	return (blockLengthMinutes * 6).toFixed(1);
};

exports.BitcoinClient = class BitcoinClient extends Client {
	constructor(o) {
		super(o);
		this.addHeaders = o.addHeaders || {};
		this.request.$getAsync = this.request.getAsync;
		this.request.$postAsync = this.request.postAsync;
		const self = this;
		this.request.getAsync = function (o) {
			return self.request.$getAsync.call(self.request, {
				...o,
				headers: self.addHeaders,
			});
		};
		this.request.postAsync = function (o) {
			return self.request.$postAsync.call(self.request, {
				...o,
				headers: self.addHeaders,
			});
		};
	}
};

exports.getDefaultBitcoinClient = () =>
	new exports.BitcoinClient({
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
		},
	});
