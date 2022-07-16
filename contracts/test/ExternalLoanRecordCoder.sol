// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import '../erc4626/utils/LoanRecordCoder.sol';

// ============================== NOTICE ==============================
// This library was automatically generated with stackpacker.
// Be very careful about modifying it, as doing so incorrectly could
// result in corrupted reads/writes.
// ====================================================================

contract ExternalLoanRecordCoder {
  LoanRecord internal _loanRecord;

  function decode()
    external
    view
    returns (
      uint256 sharesLocked,
      uint256 actualBorrowAmount,
      uint256 lenderDebt,
      uint256 btcFeeForLoanGas,
      uint256 expiry
    )
  {
    (
      sharesLocked,
      actualBorrowAmount,
      lenderDebt,
      btcFeeForLoanGas,
      expiry
    ) = LoanRecordCoder.decode(_loanRecord);
  }

  function encode(
    uint256 sharesLocked,
    uint256 actualBorrowAmount,
    uint256 lenderDebt,
    uint256 btcFeeForLoanGas,
    uint256 expiry
  ) external {
    (_loanRecord) = LoanRecordCoder.encode(
      sharesLocked,
      actualBorrowAmount,
      lenderDebt,
      btcFeeForLoanGas,
      expiry
    );
  }
}
