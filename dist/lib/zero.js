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
const ethers_1 = require("ethers");
const utils_1 = require("@0x/utils");
const constants_1 = require("./config/constants");
const p2p_1 = require("./p2p");
const chains_1 = require("@renproject/chains");
const ren_1 = __importDefault(require("@renproject/ren"));
const logger = { debug(v) { console.error(v); } };
const providers = {
    MATIC: (0, chains_1.Polygon)(new ethers_1.ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/8_zmSL_WeJCxMIWGNugMkRgphmOCftMm"), 'mainnet'),
    ETHEREUM: (0, chains_1.Ethereum)(new ethers_1.ethers.providers.JsonRpcProvider("https://eth-mainnet.alchemyapi.io/v2/Mqiya0B-TaJ1qWsUKuqBtwEyFIbKGWoX"), 'mainnet')
};
const provider = providers[process.env.CHAIN || "MATIC"];
class TransferRequest {
    constructor(params) {
        this.module = params.module;
        this.to = params.to;
        this.underwriter = params.underwriter;
        this.asset = params.asset;
        this.amount = params.amount.toString();
        this.data = params.data;
        this.nonce = params.nonce
            ? (0, bytes_1.hexlify)(params.nonce)
            : (0, bytes_1.hexlify)((0, random_1.randomBytes)(32));
        this.pNonce = params.pNonce
            ? (0, bytes_1.hexlify)(params.pNonce.toString())
            : (0, bytes_1.hexlify)((0, random_1.randomBytes)(32));
        this.chainId = params.chainId;
        this.contractAddress = params.contractAddress;
        this.signature = params.signature;
        //this._config = 
        this._ren = new ren_1.default('mainnet', { useV2TransactionFormat: true, loadCompletedDeposits: true });
        this._contractFn = "zeroCall";
        this._contractParams = [
            {
                name: "pNonce",
                type: "uint256",
                value: this.pNonce
            },
            {
                name: "module",
                type: "address",
                value: this.module
            },
            {
                name: "data",
                type: "bytes",
                value: this.data
            }
        ];
    }
    destination(contractAddress, chainId, signature) {
        if (this._destination)
            return this._destination;
        const payload = this.toEIP712(contractAddress || this.contractAddress, Number(chainId || this.chainId));
        delete payload.types.EIP712Domain;
        const digest = hash_1._TypedDataEncoder.hash(payload.domain, payload.types, payload.message);
        return (this._destination = (0, transactions_1.recoverAddress)(digest, signature || this.signature));
    }
    async submitToRenVM(isTest) {
        return await this._ren.lockAndMint({
            asset: "BTC",
            from: (0, chains_1.Bitcoin)(),
            nonce: this.nonce,
            to: provider.Contract({
                sendTo: this.contractAddress,
                contractFn: this._contractFn,
                contractParams: this._contractParams
            })
        });
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
    async toGatewayAddress(input) {
        const mint = await this.submitToRenVM(false);
        return mint.gatewayAddress;
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