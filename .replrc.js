
var sdk = require('./');
const multiaddr = '/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/';
var ethers = require('ethers');

var makeUser = async () => sdk.createZeroUser(await sdk.createZeroConnection(multiaddr));
var peerId = require('peer-id');

var handler = async (o) => {
  console.log('got dispatch');
  console.log(require('util').inspect(o, { colors: true, depth: 15 }));
};


var makeKeeper = async () => {
  const keeper = await sdk.createZeroKeeper(await sdk.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));
  keeper.conn.start();
  keeper.advertiseAsKeeper();
  keeper.setTxDispatcher(handler);
  return keeper;
};

var { getFreeBitcoinClient, getDefaultBitcoinClient } = require('./dist/lib/rpc/btc');
