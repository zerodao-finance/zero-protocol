// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IChainlinkOracle.sol";

struct LoanRecord {
  // Underlying amount borrowed
  uint128 assetsBorrowed;
  // Original value of underlying in shares
  uint128 sharesLocked;
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
