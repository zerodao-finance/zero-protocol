
var { RenJS } = require('@renproject/ren');

var r = new RenJS('mainnet');
var { getDefaultBitcoinClient } = require('./lib/rpc/btc');
var Client = require('bitcoin-core');
var zero = require('./lib/zero');

r.renVM
