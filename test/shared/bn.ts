import {
  parseEther,
  parseUnits,
} from "@ethereum-waffle/provider/node_modules/@ethersproject/units";
import { BigNumber, BigNumberish } from "ethers";

export const toBN = (n: BigNumberish, decimals = 0) =>
  BigNumber.from(10).pow(decimals).mul(n);

export const e18 = (n: string | number) => parseEther(n.toString());

export const HALF_E18 = e18("0.5");
export const ONE_E8 = toBN(1, 8);
export const ONE_E18 = e18(1);
export const TWO_E18 = e18(2);
export const THREE_E18 = e18(3);
export const GWEI = toBN(1, 9);
export const gwei = (n: BigNumberish) => GWEI.mul(n);
export const ONE_BTC_PER_WEI = toBN(1, 26);

export const MaxUint128 = BigNumber.from(2).pow(128);
