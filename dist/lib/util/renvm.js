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
const bitcore_lib_1 = require("bitcore-lib");
const helpers_1 = require("./helpers");
const solidity_1 = require("@ethersproject/solidity");
const address_1 = require("@ethersproject/address");
const assembleCloneCode_1 = __importDefault(require("./assembleCloneCode"));
class RenVM {
    constructor(cachedProxyCodeHash, shifterBorrowProxy) {
        this.InitializationActionsABI = [];
        this.computeGatewayAddress = ({ isTestnet, g, mpkh }) => new bitcore_lib_1.Script()
            .add(Buffer.from((0, helpers_1.stripHexPrefix)((0, helpers_1.maybeCoerceToGHash)(g)), 'hex'))
            .add('OP_DROP')
            .add('OP_DUP')
            .add('OP_HASH160')
            .add(Buffer.from((0, helpers_1.stripHexPrefix)(mpkh), 'hex'))
            .add('OP_EQUALVERIFY')
            .add('OP_CHECKSIG')
            .toScriptHashOut()
            .toAddress(isTestnet ? bitcore_lib_1.Networks.testnet : bitcore_lib_1.Networks.mainnet)
            .toString();
        this.initializeCodeHash = () => __awaiter(this, void 0, void 0, function* () {
            return this.cachedProxyCodeHash;
        });
        this.computeLiquidityRequestHash = ({ shifterPool, token, nonce, amount, gasRequested, forbidLoan = false, actions = [], }) => (0, solidity_1.keccak256)(['address', 'address', 'bytes32', 'uint256', 'uint256', 'bool', 'bytes'], [
            shifterPool,
            token,
            nonce,
            amount,
            gasRequested,
            forbidLoan,
            (0, helpers_1.encodeInitializationActions)(actions, this.InitializationActionsABI),
        ]);
        this.computeBorrowProxyAddress = ({ shifterPool, borrower, token, nonce, amount, forbidLoan, actions }) => {
            const salt = (0, solidity_1.keccak256)(['address', 'address', 'bytes32', 'uint256', 'bool', 'bytes'], [
                borrower,
                token,
                nonce,
                amount,
                forbidLoan,
                (0, helpers_1.encodeInitializationActions)(actions, this.InitializationActionsABI),
            ]);
            const implementation = (0, address_1.getCreate2Address)(shifterPool, (0, solidity_1.keccak256)(['string'], ['borrow-proxy-implementation']), (0, solidity_1.keccak256)(['bytes'], [this.shifterBorrowProxyBytecode]));
            return (0, address_1.getCreate2Address)(shifterPool, salt, (0, solidity_1.keccak256)(['bytes'], [(0, assembleCloneCode_1.default)(shifterPool.toLowerCase(), implementation.toLowerCase())]));
        };
        this.cachedProxyCodeHash = cachedProxyCodeHash;
        this.shifterBorrowProxyBytecode = shifterBorrowProxy;
    }
}
exports.default = RenVM;
