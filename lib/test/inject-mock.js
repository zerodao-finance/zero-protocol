'use strict';

const StateManager  = require('@nomiclabs/ethereumjs-vm/dist/state/stateManager').default;
const { getContractCode } = StateManager.prototype;
const ethers = require('ethers');
const { Buffer } = require('buffer');

const toString = (v) => ethers.utils.hexlify(v).toLowerCase();

exports.overrides = {};

Object.defineProperty(StateManager.prototype, 'getContractCode', {
  enumerable: false,
  configurable: true,
  writable: true,
  value: function (address, cb) {
    address = toString(address);
    if (exports.overrides[address]) {
      return cb(null, Buffer.from(ethers.utils.hexlify(exports.overrides[address]).substr(2), 'hex'));
    }
    return getContractCode.call(this, address, cb);
  }
});

exports.override = (address, runtimeCode) => {
  exports.overrides[toString(address)] = runtimeCode;
  return true;
};
