export const BYTES_TYPES = ["bytes"];
export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export const NULL_PHASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export const EIP712_TYPES = {
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
  EIP712DomainMatic: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "version",
      type: "string",
    },
    {
      name: "verifyingContract",
      type: "address",
    },
    {
      name: "salt",
      type: "bytes32",
    },
  ],
  TransferRequest: [
    {
      name: "asset",
      type: "address",
    },
    {
      name: "amount",
      type: "uint256",
    },
    {
      name: "underwriter",
      type: "address",
    },
    {
      name: "module",
      type: "address",
    },
    {
      name: "nonce",
      type: "uint256",
    },
    {
      name: "data",
      type: "bytes",
    },
  ],
};
