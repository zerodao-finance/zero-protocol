
var { RenJS } = require('@renproject/ren');

var r = new RenJS('mainnet');
var { getDefaultBitcoinClient } = require('./lib/rpc/btc');
var Client = require('bitcoin-core');
var zero = require('./lib/zero');
var makeKeeper = async () => await zero.createZeroKeeper(await zero.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));
var makeUser = async () => await zero.createZeroUser(await zero.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));
var peerId = require('peer-id');

var peerInfo = require('peer-info');
var f = async () => {
  const user = await makeUser();
  await user.conn.start();
  await user.publishTransferRequest({});
  return user;
};
