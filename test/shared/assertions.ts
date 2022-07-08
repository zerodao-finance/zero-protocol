import { expect } from "chai";
import { BigNumberish, Contract, ContractTransaction } from "ethers";

// from, to, amount
type Transfer = [Contract, string, string, BigNumberish];

export const expectTransfers = (
  tx: ContractTransaction | Promise<ContractTransaction>,
  transfers: Transfer[]
) => {
  let assertion = expect(tx);
  for (let [token, from, to, amount] of transfers) {
    assertion = assertion.to.emit(token, "Transfer").withArgs(from, to, amount);
  }
  return assertion;
};

const ArithmeticOverflowPanicMessage =
  "0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)";

export const expectOverflowPanic = async (
  tx: ContractTransaction | Promise<ContractTransaction>
) => {
  await expect(tx).to.be.revertedWith(ArithmeticOverflowPanicMessage);
};
