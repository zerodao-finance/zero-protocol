import { BigNumber, BigNumberish, ContractTransaction } from "ethers";
import { GWEI, ONE_BTC_PER_WEI, ONE_E18, toBN } from "./bn";
import { getTransactionTimestamp } from "./chain";

enum ModuleType {
  Null = 0,
  LoanOverride = 1,
  LoanAndRepayOverride = 2,
}

export interface ModuleFees {
  moduleType: ModuleType;
  loanGasE4: BigNumber;
  repayGasE4: BigNumber;
  loanRefundEth: BigNumber;
  repayRefundEth: BigNumber;
  staticBorrowFee: BigNumber;
  lastUpdateTimestamp: BigNumber;
}

export interface GlobalFees {
  dynamicBorrowFeeBips: BigNumber;
  staticBorrowFee: BigNumber;
  satoshiPerEth: BigNumber;
  gweiPerGas: BigNumber;
  lastUpdateTimestamp: BigNumber;
}

export const divE4RoundUp = (n: BigNumberish) => toBN(n).add(9999).div(1e4);

export const makeArrayObject = (obj: any) => {
  const values = Object.values(obj);
  return Object.keys(obj).reduce(
    (obj, key, i) => ({
      ...obj,
      [key]: values[i],
      [i]: values[i],
    }),
    {}
  );
};

export const getExpectedGlobalFees = async (
  dynamicBorrowFeeBips: BigNumberish,
  staticBorrowFee: BigNumberish,
  weiPerBitcoin: BigNumberish,
  gasPrice: BigNumberish,
  updateTx: ContractTransaction | Promise<ContractTransaction>
): Promise<GlobalFees> => {
  const lastUpdateTimestamp = toBN(await getTransactionTimestamp(updateTx));
  const gweiPerGas = toBN(gasPrice).div(GWEI);
  const satoshiPerEth = ONE_BTC_PER_WEI.div(weiPerBitcoin);
  return {
    dynamicBorrowFeeBips: toBN(dynamicBorrowFeeBips),
    staticBorrowFee: toBN(staticBorrowFee),
    satoshiPerEth,
    gweiPerGas,
    lastUpdateTimestamp,
  };
};

export const getExpectedModuleFees = async (
  globalFees: GlobalFees,
  moduleType: ModuleType,
  _loanGas: BigNumberish,
  _repayGas: BigNumberish,
  updateTx: ContractTransaction | Promise<ContractTransaction>
): Promise<ModuleFees> => {
  const loanGasE4 = divE4RoundUp(_loanGas);
  const repayGasE4 = divE4RoundUp(_repayGas);
  const { gweiPerGas, satoshiPerEth } = globalFees;
  const gasPriceE4 = toBN(gweiPerGas, 13);
  const loanRefundEth = loanGasE4.mul(gasPriceE4);
  const repayRefundEth = repayGasE4.mul(gasPriceE4);
  const staticBorrowFee = satoshiPerEth
    .mul(loanRefundEth.add(repayRefundEth))
    .div(ONE_E18);
  return {
    moduleType,
    loanGasE4,
    repayGasE4,
    loanRefundEth,
    repayRefundEth,
    staticBorrowFee: globalFees.staticBorrowFee.add(staticBorrowFee),
    lastUpdateTimestamp: toBN(await getTransactionTimestamp(updateTx)),
  };
};

export const calculateBorrowFee = async (
  globalFees: GlobalFees,
  moduleFees: ModuleFees,
  borrowAmount: BigNumber
) => {
  return moduleFees.staticBorrowFee.add(
    borrowAmount.mul(globalFees.dynamicBorrowFeeBips).div(10000)
  );
  // return staticBorrowFee + (borrowAmount * globalFees.getDynamicBorrowFeeBips()) / BasisPointsOne;
};
