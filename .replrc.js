
var sdk = require('./');

var makeKeeper = async () => sdk.createZeroKeeper(await sdk.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));
