"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createZeroKeeper = exports.createZeroUser = exports.createZeroConnection = exports.TransferRequest = void 0;
const bytes_1 = require("@ethersproject/bytes");
const random_1 = require("@ethersproject/random");
const hash_1 = require("@ethersproject/hash");
const transactions_1 = require("@ethersproject/transactions");
const strings_1 = require("@ethersproject/strings");
const btc_1 = require("./rpc/btc");
const buffer_1 = require("buffer");
const ethers_1 = require("ethers");
const utils_1 = require("@0x/utils");
const constants_1 = require("./config/constants");
const renvm_1 = __importDefault(require("./util/renvm"));
const helpers_1 = require("./util/helpers");
const p2p_1 = require("./p2p");
const toBuffer = (hex) => buffer_1.Buffer.from(hex.substr(2), 'hex');
const RenSDK = require("@renproject/ren");
const RenJS = RenSDK.RenJS;
class TransferRequest {
    constructor(params) {
        this.module = params.module;
        this.to = params.to;
        this.underwriter = params.underwriter;
        this.asset = params.asset;
        this.amount = params.amount.toString();
        this.data = params.data;
        this.nonce = params.nonce
            ? (0, strings_1.formatBytes32String)(params.nonce.toString())
            : (0, bytes_1.hexlify)((0, random_1.randomBytes)(32));
        this.pNonce = params.pNonce
            ? (0, strings_1.formatBytes32String)(params.pNonce.toString())
            : (0, bytes_1.hexlify)((0, random_1.randomBytes)(32));
        this.chainId = params.chainId;
        this.contractAddress = params.contractAddress;
    }
    destination(contractAddress, chainId, signature) {
        if (this._destination)
            return this._destination;
        const payload = this.toEIP712(contractAddress || this.contractAddress, Number(chainId || this.chainId));
        delete payload.types.EIP712Domain;
        const digest = hash_1._TypedDataEncoder.hash(payload.domain, payload.types, payload.message);
        return (this._destination = (0, transactions_1.recoverAddress)(digest, signature || this.signature));
    }
    async waitForSignature(isTest) {
        const txHash = await this.computeMintTxHash(isTest);
        const renvm = new RenJS('mainnet', { useV2TransactionFormat: true });
        while (true) {
            console.log('poll RenVM ...');
            const result = await renvm.renVM.queryTx(txHash);
            if (!result) {
                await new Promise((resolve) => setTimeout(resolve, 10000));
            }
            else {
                return result;
            }
        }
    }
    async computeMintTxHash(isTest) {
        const renvm = new RenJS('mainnet', { useV2TransactionFormat: true });
        const { hash, vout } = await this.pollForFromChainTx(isTest || false);
        const nHash = toBuffer((0, helpers_1.computeNHash)({
            txHash: hash,
            vOut: vout,
            nonce: this.nonce
        }));
        return renvm.renVM.mintTxHash({
            selector: 'BTC/toEthereum',
            gHash: toBuffer(this._computeGHash()),
            gPubKey: toBuffer(await this.getGPubKey()),
            nHash,
            nonce: toBuffer(this.nonce),
            output: {
                txid: toBuffer(hash),
                txindex: (0, bytes_1.hexlify)(vout)
            },
            amount: (0, bytes_1.hexlify)(this.amount),
            payload: toBuffer('0x' + (0, helpers_1.computeP)(this.pNonce, this.module, this.data).substr(10)),
            pHash: toBuffer(ethers_1.utils.solidityKeccak256(['bytes'], [(0, helpers_1.computeP)(this.pNonce, this.module, this.data)])),
            to: this.contractAddress,
            outputHashFormat: 'b64'
        });
    }
    async submitToRenVM(isTest) {
        const renvm = new RenJS('mainnet', { useV2TransactionFormat: true });
        const { hash, vout } = await this.pollForFromChainTx(isTest || false);
        const nHash = toBuffer((0, helpers_1.computeNHash)({
            txHash: hash,
            vOut: vout,
            nonce: this.nonce
        }));
        return await renvm.renVM.submitMint({
            selector: 'BTC/toEthereum',
            gHash: toBuffer(this._computeGHash()),
            gPubKey: toBuffer(await this.getGPubKey()),
            nHash,
            nonce: toBuffer(this.nonce),
            output: {
                txid: toBuffer(hash),
                txindex: (0, bytes_1.hexlify)(vout)
            },
            amount: (0, bytes_1.hexlify)(this.amount),
            payload: toBuffer('0x' + (0, helpers_1.computeP)(this.pNonce, this.module, this.data).substr(10)),
            pHash: toBuffer(ethers_1.utils.solidityKeccak256(['bytes'], [(0, helpers_1.computeP)(this.pNonce, this.module, this.data)])),
            to: this.contractAddress,
            token: this.asset,
            fn: 'zeroCall',
            fnABI: [{
                    name: 'zeroCall',
                    type: 'function',
                    stateMutability: 'nonpayable',
                    inputs: [{
                            type: 'uint256',
                            name: 'pNonce'
                        }, {
                            type: 'address',
                            name: 'module'
                        }, {
                            type: 'bytes',
                            name: 'data'
                        }]
                }],
            tags: []
        });
    }
    async pollForFromChainTx(isTest) {
        const gateway = await this.toGatewayAddress({ isTest: isTest || false });
        while (true) {
            try {
                if (process.env.NODE_ENV === 'development')
                    console.log('poll ' + gateway);
                const result = await (0, btc_1.getDefaultBitcoinClient)().listReceivedByAddress(gateway);
                if (result) {
                    const { txids } = result;
                    const tx = txids.find((v) => v.out.find((v) => v.addr === gateway));
                    return {
                        hash: tx.hash,
                        vout: tx.out.findIndex((v) => v.addr === gateway)
                    };
                }
                else {
                    await new Promise((resolve) => setTimeout(resolve, 10000));
                }
            }
            catch (e) {
                if (process.env.NODE_ENV === 'development')
                    console.error(e);
            }
        }
    }
    setUnderwriter(underwriter) {
        if (!ethers_1.ethers.utils.isAddress(underwriter))
            return false;
        this.underwriter = ethers_1.ethers.utils.getAddress(underwriter);
        return true;
    }
    toEIP712Digest(contractAddress, chainId = 1) {
        return utils_1.signTypedDataUtils.generateTypedDataHash(this.toEIP712(contractAddress || this.contractAddress, Number(chainId || this.chainId)));
    }
    toEIP712(contractAddress, chainId = 1) {
        this.contractAddress = contractAddress || this.contractAddress;
        this.chainId = chainId || this.chainId;
        return {
            types: constants_1.EIP712_TYPES,
            domain: {
                name: 'ZeroController',
                version: '1',
                chainId: this.chainId.toString() || '1',
                verifyingContract: this.contractAddress || ethers_1.ethers.constants.AddressZero,
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
    _computeGHash() {
        return (0, helpers_1.maybeCoerceToGHash)({
            p: (0, helpers_1.computeP)(this.pNonce, this.module, this.data),
            nonce: this.nonce,
            to: this.destination(),
            tokenAddress: this.asset
        });
    }
    async getGPubKey() {
        const renvm = new RenJS('mainnet');
        return (0, bytes_1.hexlify)(await renvm.renVM.selectPublicKey('BTC', ''));
    }
    async toGatewayAddress(input) {
        const renvm = new RenJS('mainnet', {});
        input = input || { isTest: false };
        return (new renvm_1.default(null, null)).computeGatewayAddress({
            mpkh: (0, bytes_1.hexlify)((await renvm.renVM.selectPublicKey('BTC', ''))),
            isTestnet: input.isTest,
            g: {
                p: (0, helpers_1.computeP)(this.pNonce, this.module, this.data),
                nonce: this.nonce,
                tokenAddress: this.asset,
                to: this.destination()
            },
        });
    }
    async sign(signer, contractAddress) {
        const provider = signer.provider;
        const { chainId } = await signer.provider.getNetwork();
        try {
            const payload = this.toEIP712(contractAddress, chainId);
            delete payload.types.EIP712Domain;
            return (this.signature = await signer._signTypedData(payload.domain, payload.types, payload.message));
        }
        catch (e) {
            return (this.signature = await provider.send('eth_signTypedData_v4', [
                await signer.getAddress(),
                this.toEIP712(contractAddress, chainId),
            ]));
        }
    }
}
exports.TransferRequest = TransferRequest;
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