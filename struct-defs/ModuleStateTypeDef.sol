enum ModuleType {
  Null,
  LoanOverride,
  LoanAndRepayOverride
}
struct ModuleState {
  ModuleType moduleType exact;

  // gas to refund keeper for executing a loan call (set by governance)
  uint8 loanGasE4;

  // gas to refund keeper for executing a repay call (set by governance)
  uint8 repayGasE4;

  // ETH paid to keepers for executing a repay call
  // loanGasE4 * 10000 * gasPrice (cached)
  uint64 ethRefundForLoanGas;

  // ETH paid to keepers for executing a repay call
  // repayGasE4 * 10000 * gasPrice (cached)
  uint64 ethRefundForRepayGas;

  // BTC value of `ethRefundForLoanGas` (cached)
  uint24 btcFeeForLoanGas;

  // BTC value of `repayRefundEth` (cached)
  uint24 btcFeeForRepayGas;

  // Last time the cached values were updated
  // Cache must update if it is lower than global update timestamp
  // or is older than the cache ttl
  uint32 lastUpdateTimestamp;

  group LoanParams {
    get;

    moduleType exact;
    ethRefundForLoanGas;
  }

  group BitcoinGasFees {
    get;

    btcFeeForLoanGas;
    btcFeeForRepayGas;
  }

  group RepayParams {
    moduleType exact;
    ethRefundForRepayGas;
    btcFeeForRepayGas;
  }

  group Cached {
    ethRefundForLoanGas;
    ethRefundForRepayGas;
    btcFeeForLoanGas;
    btcFeeForRepayGas;
    lastUpdateTimestamp;
  }

  group GasParams {
    loanGasE4;
    repayGasE4;
  }
}
