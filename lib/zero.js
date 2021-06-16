'use strict';

const renvm = require('./util/ren');
const ethers = require('ethers');

const { hexlify, randomBytes } = ethers.utils;

class TransferRequest {
  constructor({
    module,
    to,
    asset,
    nonce,
    pNonce,
    amount,
    data
  }) {
    Object.assign(this, {
      module,
      to,
      asset,
      nonce: nonce || hexlify(randomBytes(32)),
      pNonce: pNonce || hexlify(randomBytes(32)),
      amount,
      data
    });
  }
  toGatewayAddress({
    mpkh,
    isTest
  }) {
    return renvm.computeGatewayAddress({
      mpkh,
      isTest,
      g: {
        p: renvm.computeP({
          nonce: this.pNonce,
          data: this.data
        }),
        nonce: this.nonce,
        tokenAddress: this.asset,
        to: this.module
      }
    });
  }
}

exports.createTransferRequest = ({
  module,
  to,
  asset,
  nonce,
  pNonce,
  amount,
  data
}) => {
  new TransferRequest({
    module,
    to,
    asset,
    nonce,
    pNonce,
    amount,
    data
  });
}

