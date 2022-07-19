// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import "./TestERC20.sol";

contract EscrowContract {
  TestERC20 public immutable asset;

  constructor(TestERC20 _asset) {
    asset = _asset;
  }

  function reclaimAssets(uint256 amount) external {
    asset.transfer(msg.sender, amount);
  }
}

contract TestModule {
  bool useEscrow;
  bool returnLessThanFullAmount;
  EscrowContract internal escrow;
  TestERC20 public immutable asset;

  constructor(TestERC20 _asset) {
    escrow = new EscrowContract(_asset);
    asset = _asset;
  }

  function setUseEscrow(bool _useEscrow) external {
    useEscrow = _useEscrow;
  }

  function setReturnLessThanFullAmount(bool _returnLessThanFullAmount) external {
    returnLessThanFullAmount = _returnLessThanFullAmount;
  }

  function receiveLoan(
    address borrower,
    uint256 borrowAmount,
    uint256 loanId,
    bytes calldata data
  ) external {
    uint256 feeAmount = abi.decode(data, (uint256));
    asset.transfer(address(0), feeAmount);
    asset.transfer(borrower, borrowAmount - feeAmount);
  }

  function repayLoan(
    address borrower,
    uint256 repaidAmount,
    uint256 loanId,
    bytes calldata data
  ) external returns (uint256 collateralToUnlock, uint256 gasRefundEth) {}
}
