"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createZeroKeeper = exports.createZeroUser = exports.createZeroConnection = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("@0x/utils");
const constants_1 = require("./config/constants");
const renvm_1 = __importDefault(require("./util/renvm"));
const helpers_1 = require("./util/helpers");
const p2p_1 = require("./p2p");
class TransferRequest {
    constructor(module, to, underwriter, asset, amount, data, nonce, pNonce) {
        this.module = module;
        this.to = to;
        this.underwriter = underwriter;
        this.asset = asset;
        this.amount = amount.toString();
        this.data = data;
        this.nonce = nonce
            ? ethers_1.ethers.utils.formatBytes32String(nonce.toString())
            : ethers_1.ethers.utils.hexlify(ethers_1.ethers.utils.randomBytes(32));
        this.pNonce = pNonce
            ? ethers_1.ethers.utils.formatBytes32String(pNonce.toString())
            : ethers_1.ethers.utils.hexlify(ethers_1.ethers.utils.randomBytes(32));
    }
    setUnderwriter(underwriter) {
        if (!ethers_1.ethers.utils.isAddress(underwriter))
            return false;
        this.underwriter = ethers_1.ethers.utils.getAddress(underwriter);
        return true;
    }
    toEIP712Digest(contractAddress, chainId = 1) {
        return utils_1.signTypedDataUtils.generateTypedDataHash(this.toEIP712(contractAddress, chainId));
    }
    toEIP712(contractAddress, chainId = 1) {
        return {
            types: constants_1.EIP712_TYPES,
            domain: {
                name: 'ZeroController',
                version: '1',
                chainId: chainId.toString() || '1',
                verifyingContract: contractAddress || ethers_1.ethers.constants.AddressZero,
            },
            message: {
                module: this.module,
                asset: this.asset,
                amount: this.amount.toString(),
                data: this.data,
                underwriter: this.underwriter,
                nonce: this.pNonce.toString(),
            },
            primaryType: 'TransferRequest',
        };
    }
    toGatewayAddress(input) {
        const renvm = new renvm_1.default(null, {});
        return renvm.computeGatewayAddress({
            mpkh: input.mpkh,
            isTestnet: input.isTest,
            g: {
                p: (0, helpers_1.computeP)(this.pNonce, this.module, this.data),
                nonce: this.nonce,
                tokenAddress: this.asset,
                to: input.destination,
            },
        });
    }
    async sign(signer, contractAddress) {
        const provider = signer.provider;
        const { chainId } = await signer.provider.getNetwork();
        try {
            const payload = this.toEIP712(contractAddress, chainId);
            delete payload.types.EIP712Domain;
            return await signer._signTypedData(payload.domain, payload.types, payload.message);
        }
        catch (e) {
            return await provider.send('eth_signTypedData_v4', [
                await signer.getAddress(),
                this.toEIP712(contractAddress, chainId),
            ]);
        }
    }
}
exports.default = TransferRequest;
async function createZeroConnection(address) {
    const connOptions = {
        multiaddr: address,
    };
    return await (0, p2p_1.createNode)(connOptions);
}
exports.createZeroConnection = createZeroConnection;
function createZeroUser(connection, persistence) {
    return new p2p_1.ZeroUser(connection, persistence);
}
exports.createZeroUser = createZeroUser;
function createZeroKeeper(connection) {
    return new p2p_1.ZeroKeeper(connection);
}
exports.createZeroKeeper = createZeroKeeper;
//# sourceMappingURL=zero.js.map