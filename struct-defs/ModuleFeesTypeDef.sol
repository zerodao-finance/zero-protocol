enum ModuleType {
  Null,
  LoanOverride,
  LoanAndRepayOverride
}
struct ModuleFees {
  ModuleType moduleType exact;
  // gas to refund keeper for executing a loan call (set by governance)
  uint8 loanGasE4;
  // gas to refund keeper for executing a repay call (set by governance)
  uint8 repayGasE4;
  // ETH paid to keepers for executing a repay call
  // loanGasE4 * 10000 * gasPrice (cached)
  uint64 loanRefundEth;
  // ETH paid to keepers for executing a repay call
  // repayGasE4 * 10000 * gasPrice (cached)
  uint64 repayRefundEth;
  // Static bitcoin fee charged on mint amounts
  // ((loanRefundEth + repayRefundEth) * btcPrice) + global.loanStaticBitcoinFee (cached)
  uint24 staticBorrowFee;
  // Last time the cached values were updated
  // Cache must update if it is lower than global update timestamp
  // or is older than the cache ttl
  uint32 lastUpdateTimestamp;

  group LoanParams {
    moduleType exact;
    loanRefundEth;
    staticBorrowFee;
  }

  group RepayParams {
    moduleType exact;
    repayRefundEth;
  }

  group Cached {
    loanRefundEth;
    repayRefundEth;
    staticBorrowFee;
    lastUpdateTimestamp;
  }

  group Config {
    loanGasE4;
    repayGasE4;
  }

  group GasParams {
    loanGasE4;
    repayGasE4;
  }
}
