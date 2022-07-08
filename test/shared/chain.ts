import { JsonRpcSigner } from "@ethersproject/providers";
import { ContractTransaction } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { IERC20 } from "../../typechain-types";

const TEN_THOUSAND_ETH = parseEther("10000").toHexString().replace("0x0", "0x");

export const getTransactionTimestamp = async (
  tx: ContractTransaction | Promise<ContractTransaction>
) => {
  const { timestamp } = await Promise.resolve(tx)
    .then(({ wait }) => wait())
    .then(({ blockHash }) => ethers.provider.getBlock(blockHash));
  return timestamp;
};

export const faucet = async (address: string) => {
  await ethers.provider.send("hardhat_setBalance", [address, TEN_THOUSAND_ETH]);
};

export async function createSnapshot() {
  let snapshotId = await network.provider.request({
    method: "evm_snapshot",
  });
  return async () => {
    await network.provider.request({
      method: "evm_revert",
      params: [snapshotId],
    });
    snapshotId = await network.provider.request({
      method: "evm_snapshot",
    });
  };
}

export async function impersonate(address: string) {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });
  return ethers.provider.getSigner(address);
}

export async function stopImpersonating(address: string) {
  await network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [address],
  });
}

export async function withSigner(
  address: string,
  fn: (signer: JsonRpcSigner) => Promise<void>
) {
  const signer = await impersonate(address);
  await fn(signer);
  await stopImpersonating(address);
}

export async function getTransactionCost(
  tx: ContractTransaction | Promise<ContractTransaction>
) {
  const { wait, gasPrice } = await Promise.resolve(tx);
  const { gasUsed } = await wait();
  return gasUsed.mul(gasPrice);
}

export async function createBalanceCheckpoint(
  token: IERC20 | null,
  account: string
) {
  const bal = () =>
    token ? token.balanceOf(account) : ethers.provider.getBalance(account);
  const balanceBefore = await bal();
  return async (tx?: ContractTransaction | Promise<ContractTransaction>) => {
    let balanceAfter = await bal();
    if (tx && !token) {
      balanceAfter = balanceAfter.add(await getTransactionCost(tx));
    }
    return balanceAfter.sub(balanceBefore);
  };
}
