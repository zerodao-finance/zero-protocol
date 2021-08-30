// @ts-expect-error
import { Script, Networks } from 'bitcore-lib';
import { stripHexPrefix, maybeCoerceToGHash, encodeInitializationActions } from './helpers';
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { getCreate2Address } from '@ethersproject/address';
import assembleCloneCode from './assembleCloneCode';
class RenVM {
    constructor(cachedProxyCodeHash, shifterBorrowProxy) {
        this.InitializationActionsABI = [];
        this.computeGatewayAddress = ({ isTestnet, g, mpkh }) => new Script()
            .add(Buffer.from(stripHexPrefix(maybeCoerceToGHash(g)), 'hex'))
            .add('OP_DROP')
            .add('OP_DUP')
            .add('OP_HASH160')
            .add(Buffer.from(stripHexPrefix(mpkh), 'hex'))
            .add('OP_EQUALVERIFY')
            .add('OP_CHECKSIG')
            .toScriptHashOut()
            .toAddress(isTestnet ? Networks.testnet : Networks.mainnet)
            .toString();
        this.initializeCodeHash = async () => {
            return this.cachedProxyCodeHash;
        };
        this.computeLiquidityRequestHash = ({ shifterPool, token, nonce, amount, gasRequested, forbidLoan = false, actions = [], }) => solidityKeccak256(['address', 'address', 'bytes32', 'uint256', 'uint256', 'bool', 'bytes'], [
            shifterPool,
            token,
            nonce,
            amount,
            gasRequested,
            forbidLoan,
            encodeInitializationActions(actions, this.InitializationActionsABI),
        ]);
        this.computeBorrowProxyAddress = ({ shifterPool, borrower, token, nonce, amount, forbidLoan, actions }) => {
            const salt = solidityKeccak256(['address', 'address', 'bytes32', 'uint256', 'bool', 'bytes'], [
                borrower,
                token,
                nonce,
                amount,
                forbidLoan,
                encodeInitializationActions(actions, this.InitializationActionsABI),
            ]);
            const implementation = getCreate2Address(shifterPool, solidityKeccak256(['string'], ['borrow-proxy-implementation']), solidityKeccak256(['bytes'], [this.shifterBorrowProxyBytecode]));
            return getCreate2Address(shifterPool, salt, solidityKeccak256(['bytes'], [assembleCloneCode(shifterPool.toLowerCase(), implementation.toLowerCase())]));
        };
        this.cachedProxyCodeHash = cachedProxyCodeHash;
        this.shifterBorrowProxyBytecode = shifterBorrowProxy;
    }
}
export default RenVM;
//# sourceMappingURL=renvm.js.map