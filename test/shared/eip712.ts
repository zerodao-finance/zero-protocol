import { toUtf8Bytes } from "@ethersproject/strings";
import { BigNumber, Contract } from "ethers";
import { keccak256 } from "@ethersproject/keccak256";
import { defaultAbiCoder, solidityPack } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { _TypedDataEncoder } from "@ethereum-waffle/provider/node_modules/@ethersproject/hash";

const EIP712_DomainType = {
  EIP712Domain: [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ],
};

export const EIP712_TransferRequestType = {
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

const EIP712_PermitType = {
  Permit: [
    {
      name: "owner",
      type: "address",
    },
    {
      name: "spender",
      type: "address",
    },
    {
      name: "value",
      type: "uint256",
    },
    {
      name: "nonce",
      type: "uint256",
    },
    {
      name: "deadline",
      type: "uint256",
    },
  ],
};

export function getDomainSeparator(
  name: string,
  verifyingContract: string,
  version = "1"
) {
  return {
    name,
    version,
    chainId: network.config.chainId,
    verifyingContract,
  };
}

export async function getApprovalDigest(
  token: Contract,
  approve: {
    owner: string;
    spender: string;
    value: BigNumber;
  },
  nonce: BigNumber,
  deadline: BigNumber
): Promise<string> {
  const name = await token.name();
  const domain = getDomainSeparator(name, token.address);
  return _TypedDataEncoder.hash(domain, EIP712_PermitType, {
    owner: approve.owner,
    spender: approve.spender,
    value: approve.value,
    nonce,
    deadline,
  });
}

export const getTransferRequestDigest = async (
  contract: Contract,
  asset: string,
  amount: BigNumber,
  module: string,
  nonce: BigNumber,
  data: string
) => {
  const name = await contract.name();
  const domain = getDomainSeparator(name, contract.address);
  return _TypedDataEncoder.hash(domain, EIP712_TransferRequestType, {
    asset,
    amount,
    module,
    nonce,
    data,
  });
};
