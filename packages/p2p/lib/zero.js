"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createZeroConnection = void 0;
const zerop2p_1 = require("./zerop2p");
const uuid_1 = require("uuid");
async function createZeroConnection(signer, address) {
    var connOptions = Object.create({ multiaddr: address, signer: signer, password: (0, uuid_1.v4)() });
    //@ts-ignore
    //expects libp2p options that will be generated when super() is called on the class
    return await zerop2p_1.ZeroP2P.fromPassword(connOptions);
}
exports.createZeroConnection = createZeroConnection;
//# sourceMappingURL=zero.js.map