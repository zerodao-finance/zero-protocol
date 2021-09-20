
var sdk = require('./');
const multiaddr = '/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/';

var makeKeeper = async () => sdk.createZeroKeeper(await sdk.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));

var makeUser = async () => sdk.createZeroUser(await sdk.createZeroConnection(multiaddr));
