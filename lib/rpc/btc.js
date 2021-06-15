'use strict';

const Client = require('bitcoin-core');

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
        headers: self.addHeaders
      });
    };
    this.request.postAsync = function (o) {
      return self.request.$postAsync.call(self.request, {
        ...o,
        headers: self.addHeaders
      });
    };
  }
}

exports.getDefault = () => new exports.BitcoinClient({
  network: 'mainnet',
  host: 'btccore-main.bdnodes.net',
  port: 443,
  ssl: {
    enabled: true,
    strict: true
  },
  username: 'blockdaemon',
  password: 'blockdaemon',
  addHeaders: {
    'X-Auth-Token': 'vm9Li06gY2hCWXuPt-y9s5nEUVQpzUC6TfC7XTdgphg'
  }
});

