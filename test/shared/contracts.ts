import { ethers } from "hardhat";
import { Contract } from "ethers";
import { JsonRpcSigner } from "@ethersproject/providers";
import * as dotenv from "dotenv";
import { impersonate } from "./chain";

dotenv.config();

export const deployContract = async <C extends Contract>(
  name: string,
  ...args: any[]
): Promise<C> => {
  const references = new Map<string, string>([
    ["Consideration", "ReferenceConsideration"],
    ["Conduit", "ReferenceConduit"],
    ["ConduitController", "ReferenceConduitController"],
  ]);

  const nameWithReference =
    process.env.REFERENCE && references.has(name)
      ? references.get(name) || name
      : name;

  const f = await ethers.getContractFactory(nameWithReference);
  const c = await f.deploy(...args);
  return c as C;
};

export async function getContractBase<C extends Contract>(
  address: string,
  name: string
): Promise<C> {
  let contract = await ethers.getContractAt(name, address);
  return contract as C;
}

export async function getContract<C extends Contract>(
  address: string,
  name: string,
  signer?: string | JsonRpcSigner
): Promise<C> {
  let contract = await getContractBase(address, name);
  if (signer) {
    const _signer =
      typeof signer === "string" ? await impersonate(signer) : signer;
    contract = contract.connect(_signer);
  }
  return contract as C;
}
