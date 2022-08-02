// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

interface IZeroModule {
  function asset() external view returns (address);

  function repayLoan(
    address borrower,
    uint256 repaidAmount,
    uint256 loanId,
    bytes calldata data
  ) external returns (uint256 collateralToUnlock);

  function receiveLoan(
    address borrower,
    uint256 borrowAmount,
    uint256 loanId,
    bytes calldata data
  ) external;
}
