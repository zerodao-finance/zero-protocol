// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import "../interfaces/IChainlinkOracle.sol";

struct LoanRecord {
  // Underlying amount borrowed
  uint128 assetsBorrowed;
  // Original value of underlying in shares
  uint128 sharesLocked;
}

struct ModuleData {
  // Mint gas - only updated by governance
  uint8 loanGasE5;
  // Burn gas - only updated by governance
  uint8 burnGasE5;
  // ETH refund for loan gas - updated when gas price expires
  uint64 loanGasRefundETH;
  // ETH refund for repay gas - updated when gas price expires
  uint64 repayGasRefundETH;
  // BTC charged against borrow amount for gas and RenVM fees
  uint24 mintStaticFeeBTC;
  uint24 mintDynamicFeeBTC;
  uint32 lastUpdateTimestamp;
}

struct FeesInfo {
  // Oracle for getting current fast gas price
  IChainlinkOracle fastGasOracle;
  // Loan fee in basis points (units of 0.01%)
  uint16 loanFeeBips;
  // Average gas price in giga-wei - can not exceed 65535 gwei per gas
  // Updated when expires
  uint16 averageGweiPerGas;
  // Micro bitcoin paid for mint - only updated by governance
  uint16 mintBaseFeeMicroBitcoin;
  uint32 lastUpdateTimestamp;
}

struct GasParameters {
  // Oracle for getting current fast gas price
  IChainlinkOracle fastGasOracle;
  // Maximum total gas refunded for a repay call
  uint24 maxGasRefundForRepayCall;
  // Maximum total gas refunded for a loan call
  uint24 maxGasRefundForLoanCall;
  // Maximum total gas refunded for a burn call
  uint24 maxGasRefundForBurnCall;
  // Maximum total gas refunded for a meta call
  uint24 maxGasRefundForMetaCall;
}
