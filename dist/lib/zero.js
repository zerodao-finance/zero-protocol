"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createZeroKeeper = exports.createZeroUser = exports.createZeroConnection = exports.TrivialUnderwriterTransferRequest = exports.TransferRequest = void 0;
const bytes_1 = require("@ethersproject/bytes");
const contracts_1 = require("@ethersproject/contracts");
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
    ETHEREUM: (0, chains_1.Ethereum)(new ethers_1.ethers.providers.JsonRpcProvider("https://eth-mainnet.alchemyapi.io/v2/Mqiya0B-TaJ1qWsUKuqBtwEyFIbKGWoX"), 'mainnet'),
    ARBITRUM: (0, chains_1.Arbitrum)(new ethers_1.ethers.providers.JsonRpcProvider("https://arb-mainnet.g.alchemy.com/v2/utMr7YLZtnhmRySXim_DuF5QMl0HBwdA"), 'mainnet'),
};
const provider = providers[process.env.CHAIN || process.env.REACT_APP_CHAIN || "MATIC"];
console.log("Provider:", provider);
class TransferRequest {
    constructor(params) {
        this.module = params.module;
        this.to = params.to;
        this.underwriter = params.underwriter;
        this.asset = params.asset;
        this.amount = params.amount.toString();
        this.data = params.data;
        console.log('params.nonce', params.nonce);
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
        this._ren = new ren_1.default('mainnet', { loadCompletedDeposits: true });
        this._contractFn = "zeroCall";
        this._contractParams = [
            {
                name: 'to',
                type: 'address',
                value: this.to
            },
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
    submitToRenVM(isTest) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('submitToRenVM this.nonce', this.nonce);
            if (this._mint)
                return this._mint;
            const result = this._mint = yield this._ren.lockAndMint({
                asset: "BTC",
                from: (0, chains_1.Bitcoin)(),
                nonce: this.nonce,
                to: provider.Contract({
                    sendTo: this.contractAddress,
                    contractFn: this._contractFn,
                    contractParams: this._contractParams
                })
            });
            //    result.params.nonce = this.nonce;
            return result;
        });
    }
    waitForSignature() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._queryTxResult)
                return this._queryTxResult;
            const mint = yield this.submitToRenVM(false);
            const deposit = yield new Promise((resolve, reject) => {
                mint.on('deposit', resolve);
                mint.on('error', reject);
            });
            yield deposit.signed();
            const { signature, nhash, phash, amount } = deposit._state.queryTxResult.out;
            const result = this._queryTxResult = {
                amount: String(amount),
                nHash: (0, bytes_1.hexlify)(nhash),
                pHash: (0, bytes_1.hexlify)(phash),
                signature: (0, bytes_1.hexlify)(signature)
            };
            return result;
        });
    }
    setUnderwriter(underwriter) {
        if (!ethers_1.ethers.utils.isAddress(underwriter))
            return false;
        this.underwriter = ethers_1.ethers.utils.getAddress(underwriter);
        return true;
    }
    toEIP712Digest(contractAddress, chainId) {
        return utils_1.signTypedDataUtils.generateTypedDataHash(this.toEIP712(contractAddress || this.contractAddress, Number(chainId || this.chainId)));
    }
    toEIP712(contractAddress, chainId) {
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
    toGatewayAddress(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const mint = yield this.submitToRenVM(false);
            return mint.gatewayAddress;
        });
    }
    sign(signer, contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = signer.provider;
            const { chainId } = yield signer.provider.getNetwork();
            try {
                const payload = this.toEIP712(contractAddress, chainId);
                delete payload.types.EIP712Domain;
                return (this.signature = yield signer._signTypedData(payload.domain, payload.types, payload.message));
            }
            catch (e) {
                return (this.signature = yield provider.send('eth_signTypedData_v4', [
                    yield signer.getAddress(),
                    this.toEIP712(contractAddress, chainId),
                ]));
            }
        });
    }
}
exports.TransferRequest = TransferRequest;
class TrivialUnderwriterTransferRequest extends TransferRequest {
    getController(signer) {
        return __awaiter(this, void 0, void 0, function* () {
            const underwriter = this.getTrivialUnderwriter(signer);
            return new contracts_1.Contract(yield underwriter.controller(), ['function fallbackMint(address underwriter, address to, address asset, uint256 amount, uint256 actualAmount, uint256 nonce, address module, bytes32 nHash, bytes data, bytes signature)'], signer);
        });
    }
    fallbackMint(signer, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const controller = yield this.getController(signer);
            const queryTxResult = yield this.waitForSignature();
            return yield controller.fallbackMint(this.underwriter, this.destination(), this.asset, this.amount, queryTxResult.amount, this.pNonce, this.module, queryTxResult.nHash, this.data, queryTxResult.signature, params);
        });
    }
    getTrivialUnderwriter(signer) {
        return new contracts_1.Contract(this.underwriter, ['function controller() view returns (address)', 'function repay(address, address, address, uint256, uint256, uint256, address, bytes32, bytes, bytes)', 'function loan(address, address, uint256, uint256, address, bytes, bytes)'], signer);
    }
    loan(signer) {
        return __awaiter(this, void 0, void 0, function* () {
            const underwriter = this.getTrivialUnderwriter(signer);
            return yield underwriter.loan(this.destination(), this.asset, this.amount, this.pNonce, this.module, this.data, this.signature);
        });
    }
    repay(signer, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const underwriter = this.getTrivialUnderwriter(signer);
            const { amount: actualAmount, nHash, signature } = yield this.waitForSignature();
            return yield underwriter.repay(this.underwriter, this.destination(), this.asset, this.amount, actualAmount, this.pNonce, this.module, nHash, this.data, signature, params);
        });
    }
}
exports.TrivialUnderwriterTransferRequest = TrivialUnderwriterTransferRequest;
function createZeroConnection(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const connOptions = {
            multiaddr: address,
        };
        return yield (0, p2p_1.createNode)(connOptions);
    });
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
