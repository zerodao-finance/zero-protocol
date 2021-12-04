"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.override = void 0;
const ForkStateManager_1 = require("hardhat/internal/hardhat-network/provider/fork/ForkStateManager");
const ethers_1 = require("ethers");
const buffer_1 = require("buffer");
const { getContractCode } = ForkStateManager_1.ForkStateManager.prototype;
const toString = (v) => ethers_1.ethers.utils.getAddress(v.toString('hex')).toLowerCase();
exports.overrides = {};
Object.defineProperty(ForkStateManager_1.ForkStateManager.prototype, 'getContractCode', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function (address) {
        address = toString(address);
        if (exports.overrides[address]) {
            return Promise.resolve(buffer_1.Buffer.from(exports.overrides[address].substr(2), 'hex'));
        }
        return getContractCode.call(this, address);
    },
});
const override = (address, runtimeCode) => {
    exports.overrides[toString(address)] = runtimeCode;
    return true;
};
exports.override = override;
