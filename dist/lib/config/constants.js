export var BYTES_TYPES = ['bytes'];
export var NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export var NULL_PHASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
export var EIP712_TYPES = {
    EIP712Domain: [
        {
            name: 'name',
            type: 'string',
        },
        {
            name: 'version',
            type: 'string',
        },
        {
            name: 'chainId',
            type: 'uint256',
        },
        {
            name: 'verifyingContract',
            type: 'address',
        },
    ],
    TransferRequest: [
        {
            name: 'asset',
            type: 'address',
        },
        {
            name: 'amount',
            type: 'uint256',
        },
        {
            name: 'underwriter',
            type: 'address',
        },
        {
            name: 'module',
            type: 'address',
        },
        {
            name: 'nonce',
            type: 'uint256',
        },
        {
            name: 'data',
            type: 'bytes',
        },
    ],
};
