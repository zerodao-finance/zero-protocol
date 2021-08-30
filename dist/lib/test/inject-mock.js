import { ForkStateManager } from 'hardhat/internal/hardhat-network/provider/fork/ForkStateManager';
import { ethers } from 'ethers';
import { Buffer } from 'buffer';
const { getContractCode } = ForkStateManager.prototype;
const toString = (v) => ethers.utils.getAddress(v.toString('hex')).toLowerCase();
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
export const override = (address, runtimeCode) => {
    exports.overrides[toString(address)] = runtimeCode;
    return true;
};
//# sourceMappingURL=inject-mock.js.map