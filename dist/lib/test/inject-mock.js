"use strict";
exports.__esModule = true;
exports.override = void 0;
var ForkStateManager_1 = require("hardhat/internal/hardhat-network/provider/fork/ForkStateManager");
var ethers_1 = require("ethers");
var buffer_1 = require("buffer");
var getContractCode = ForkStateManager_1.ForkStateManager.prototype.getContractCode;
var toString = function (v) { return ethers_1.ethers.utils.getAddress(v.toString('hex')).toLowerCase(); };
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
    }
});
var override = function (address, runtimeCode) {
    exports.overrides[toString(address)] = runtimeCode;
    return true;
};
exports.override = override;
