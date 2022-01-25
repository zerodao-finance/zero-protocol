const { ReleaseRequest } = require("../dist/lib/zero");
const chains = require("@renproject/chains");

const btc = chains.Ethereum;
console.log(btc());

console.log('release');

