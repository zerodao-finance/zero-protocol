"use strict";

const renvm = require("./util/ren");
const ethers = require("ethers");
const {
  signTypedDataUtils: { generateTypedDataHash },
} = require("@0x/utils");

const { hexlify, randomBytes } = ethers.utils;

class TransferRequest {
  constructor({ module, to, asset, underwriter, nonce, pNonce, amount, data }) {
    Object.assign(this, {
      module,
      to,
      underwriter,
      asset,
      nonce: nonce || hexlify(randomBytes(32)),
      pNonce: pNonce || hexlify(randomBytes(32)),
      amount,
      data,
    });
  }
  setUnderwriter(underwriter) {
    this.underwriter = underwriter;
    return this;
  }
  toEIP712Digest(contractAddress, chainId = 1) {
    return generateTypedDataHash(this.toEIP712(contractAddress, chainId));
  }
  async sign(signer, contractAddress) {
    const { chainId } = await signer.provider.getNetwork();
    try {
      return await signer.provider.send('eth_signTypedData_v4', [await signer.getAddress(), this.toEIP712(contractAddress, chainId)]);
    } catch (e) {
      console.error(e);
      // in case this is not available in the signer
      return await signer.signMessage(ethers.utils.hexlify(this.toEIP712Digest(contractAddress, chainId)));
    }
  }
  toEIP712(contractAddress, chainId = 1) {
    return {
      types: {
        EIP712Domain: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "version",
            type: "string",
          },
          {
            name: "chainId",
            type: "uint256",
          },
          {
            name: "verifyingContract",
            type: "address",
          },
        ],
        TransferRequest: [
          {
            name: 'asset',
            type: 'address'
          },
          {
            name: 'amount',
            type: 'uint256'
          },
          {
            name: 'underwriter',
            type: 'address'
          }, 
          {
            name: 'module',
            type: 'address'
          },
          {
            name: 'nonce',
            type: 'uint256'
          },
          {
            name: 'data',
            type: 'bytes'
          }
        ]
      },
      domain: {
        name: 'ZeroController',
        version: '1',
        chainId: chainId || '1',
        verifyingContract: contractAddress || ethers.constants.AddressZero
      },
      message: {
        module: this.module,
        asset: this.asset,
        amount: this.amount,
        data: this.data,
        underwriter: this.underwriter,
        nonce: this.pNonce
      },
      primaryType: 'TransferRequest'
    };
  }
  toGatewayAddress({ mpkh, isTest }) {
    return renvm.computeGatewayAddress({
      mpkh,
      isTest,
      g: {
        p: renvm.computeP({
          nonce: this.pNonce,
          data: this.data,
        }),
        nonce: this.nonce,
        tokenAddress: this.asset,
        to: this.module,
      },
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
  data,
}) => {
  return new TransferRequest({
    module,
    to,
    asset,
    nonce,
    pNonce,
    amount,
    data,
  });
};
