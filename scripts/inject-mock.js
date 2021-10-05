const { ForkStateManager } = require('hardhat/internal/hardhat-network/provider/fork/ForkStateManager');
const { ethers } = require('ethers');

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

module.exports.override = (address, runtimeCode) => {
	exports.overrides[toString(address)] = runtimeCode;
	return true;
};
