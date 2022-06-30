"use strict";
exports.__esModule = true;
exports.EIP712_TYPES = exports.NULL_PHASH = exports.NULL_ADDRESS = exports.BYTES_TYPES = void 0;
exports.BYTES_TYPES = ["bytes"];
exports.NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
exports.NULL_PHASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
exports.EIP712_TYPES = {
    EIP712Domain: [
        {
            name: "name",
            type: "string"
        },
        {
            name: "version",
            type: "string"
        },
        {
            name: "chainId",
            type: "uint256"
        },
        {
            name: "verifyingContract",
            type: "address"
        },
    ],
    TransferRequest: [
        {
            name: "asset",
            type: "address"
        },
        {
            name: "amount",
            type: "uint256"
        },
        {
            name: "underwriter",
            type: "address"
        },
        {
            name: "module",
            type: "address"
        },
        {
            name: "nonce",
            type: "uint256"
        },
        {
            name: "data",
            type: "bytes"
        },
    ]
};
