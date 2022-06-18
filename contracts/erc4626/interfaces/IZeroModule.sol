// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IZeroModule {
  function asset() external view returns (address);

  function repayLoan(
    address borrower,
    uint256 repaidAmount,
    uint256 loanId,
    bytes calldata data
  ) external returns (uint256 collateralToUnlock, uint256 gasCostEther);

  function receiveLoan(
    address borrower,
    uint256 borrowAmount,
    uint256 loanId,
    bytes calldata data
  ) external returns (uint256 collateralToLock, uint256 gasCostEther);
}
