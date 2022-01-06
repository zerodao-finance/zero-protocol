import { ForkStateManager } from 'hardhat/internal/hardhat-network/provider/fork/ForkStateManager';
import { ethers } from 'ethers';
import { Buffer } from 'buffer';
var getContractCode = ForkStateManager.prototype.getContractCode;
var toString = function (v) { return ethers.utils.getAddress(v.toString('hex')).toLowerCase(); };
exports.overrides = {};
Object.defineProperty(ForkStateManager.prototype, 'getContractCode', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function (address) {
        address = toString(address);
        if (exports.overrides[address]) {
            return Promise.resolve(Buffer.from(exports.overrides[address].substr(2), 'hex'));
        }
        return getContractCode.call(this, address);
    },
});
export var override = function (address, runtimeCode) {
    exports.overrides[toString(address)] = runtimeCode;
    return true;
};
