// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../erc4626/utils/LoanRecordCoder.sol";

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
    (sharesLocked, actualBorrowAmount, lenderDebt, btcFeeForLoanGas, expiry) = LoanRecordCoder.decode(_loanRecord);
  }

  function encode(
    uint256 sharesLocked,
    uint256 actualBorrowAmount,
    uint256 lenderDebt,
    uint256 btcFeeForLoanGas,
    uint256 expiry
  ) external {
    (_loanRecord) = LoanRecordCoder.encode(sharesLocked, actualBorrowAmount, lenderDebt, btcFeeForLoanGas, expiry);
  }

  function getSharesAndDebt() external view returns (uint256 sharesLocked, uint256 lenderDebt) {
    (sharesLocked, lenderDebt) = LoanRecordCoder.getSharesAndDebt(_loanRecord);
  }

  function getActualBorrowAmount() external view returns (uint256 actualBorrowAmount) {
    (actualBorrowAmount) = LoanRecordCoder.getActualBorrowAmount(_loanRecord);
  }

  function getBtcFeeForLoanGas() external view returns (uint256 btcFeeForLoanGas) {
    (btcFeeForLoanGas) = LoanRecordCoder.getBtcFeeForLoanGas(_loanRecord);
  }

  function getExpiry() external view returns (uint256 expiry) {
    (expiry) = LoanRecordCoder.getExpiry(_loanRecord);
  }
}
