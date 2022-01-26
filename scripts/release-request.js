const { ReleaseRequest } = require("../dist/lib/zero");
const { Bitcoin, Polygon, Ethereum, Arbitrum, Fantom } = require("@renproject/chains");

console.log("Bitcoin", Bitcoin().assets);
console.log("Polygon", Polygon().assets);
console.log("Ethereum", Ethereum().assets);
console.log("Arbitrum", Arbitrum().assets);
console.log("Fantom", Fantom().assets);

