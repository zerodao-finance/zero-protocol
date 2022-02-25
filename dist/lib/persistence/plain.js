"use strict";
exports.__esModule = true;
exports.transferRequestToPlain = void 0;
var transferRequestToPlain = function (transferRequest) {
    var to = transferRequest.to, underwriter = transferRequest.underwriter, contractAddress = transferRequest.contractAddress, nonce = transferRequest.nonce, pNonce = transferRequest.pNonce, data = transferRequest.data, module = transferRequest.module, amount = transferRequest.amount, asset = transferRequest.asset, status = transferRequest.status, signature = transferRequest.signature;
    return {
        to: to,
        underwriter: underwriter,
        contractAddress: contractAddress,
        nonce: nonce,
        pNonce: pNonce,
        data: data,
        module: module,
        amount: amount,
        status: status,
        asset: asset,
        signature: signature
    };
};
exports.transferRequestToPlain = transferRequestToPlain;
