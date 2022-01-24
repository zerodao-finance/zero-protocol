export const BYTES_TYPES = ['bytes'];
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export const NULL_PHASH = '0x0000000000000000000000000000000000000000000000000000000000000000';

export const ERC20PERMIT_TYPES = {
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
		}
	],
	Permit: [
		{
			name: "owner",
			type: "address"
		},
		{
			name: "spender",
			type: "address"
		},
		{
			name: "value",
			type: "uint256"
		},
		{
			name: "nonce",
			type: "uint256"
		},
		{
			name: "deadline",
			type: "uint256"
		}
	],
	primaryType: "Permit",
};

export const EIP712_TYPES = {
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
