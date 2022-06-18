// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

import { LendableSharesVault } from "./loans/LendableSharesVault.sol";
import { BtcVaultBase } from "./storage/BtcVaultBase.sol";
import { IGateway } from "../interfaces/IGateway.sol";
import { IGatewayRegistry } from "../interfaces/IGatewayRegistry.sol";
import "./interfaces/IZeroModule.sol";
import "./IQuoter.sol";
import "./ModuleRegistry.sol";

uint256 constant ReceiveLoanSelector = 0x332b578c00000000000000000000000000000000000000000000000000000000;
uint256 constant ReceiveLoanErrorSelector = 0x83f44e2200000000000000000000000000000000000000000000000000000000;
uint256 constant RepayLoanSelector = 0x2584dde800000000000000000000000000000000000000000000000000000000;
uint256 constant RepayLoanErrorSelector = 0x0ccaea8800000000000000000000000000000000000000000000000000000000;

contract BtcVault is BtcVaultBase, LendableSharesVault, ModuleRegistry {
  IGatewayRegistry public immutable gatewayRegistry;

  constructor(IQuoter _quoter, IGatewayRegistry _gatewayRegistry) internal {
    quoter = _quoter;
    gatewayRegistry = _gatewayRegistry;
    if (
      IZeroModule.receiveLoan.selector != ReceiveLoanSelector ||
      IZeroModule.repayLoan.selector != RepayLoanSelector ||
      ReceiveLoanError.selector != ReceiveLoanErrorSelector ||
      RepayLoanError.selector != RepayLoanErrorSelector
    ) {
      revert InvalidSelector();
    }
  }

  function getGateway() internal view returns (IGateway gateway) {
    gateway = IGateway(gatewayRegistry.getGatewayByToken(asset));
  }

  function executeReceiveLoan(
    address module,
    bytes32 loanId,
    bytes memory data
  ) internal RestoreFiveWordsBefore(data) returns (uint256 collateralToLock, uint256 gasRefundEth) {
    assembly {
      let startPtr := sub(data, 0x84)
      // Write receiveLoan selector
      mstore(startPtr, ReceiveLoanSelector)
      // Copy borrower and borrowAmount from calldata
      calldatacopy(add(startPtr, 0x04), 0x24, 0x40)
      // Write loanId
      mstore(add(startPtr, 0x44), loanId)
      // Write data offset
      mstore(add(startPtr, 0x64), 0x80)
      // Size of data + (selector, borrower, borrowAmount, loanId, data_offset, data_length)
      let calldataLength := add(mload(data), 0xa4)

      let status := delegatecall(gas(), module, startPtr, calldataLength, 0, 0x40)
      if iszero(status) {
        if returndatasize() {
          returndatacopy(0, 0, returndatasize())
          revert(0, returndatasize())
        }
        // Write ReceiveLoanError.selector
        mstore(sub(startPtr, 0x20), ReceiveLoanSelector)
        // Write module to memory
        mstore(sub(startPtr, 0x1c), module)
        // Update data offset
        mstore(add(startPtr, 0x64), 0xa0)
        revert(sub(startPtr, 0x20), add(calldataLength, 0x20))
      }

      collateralToLock := mload(0)
      gasRefundEth := mload(0x20)
    }
  }

  function executeRepayLoan(
    address module,
    bytes32 loanId,
    address borrower,
    uint256 repayAmount,
    bytes memory data
  ) internal RestoreFiveWordsBefore(data) returns (uint256 collateralToUnlock, uint256 gasRefundEth) {
    assembly {
      let startPtr := sub(data, 0x84)
      // Write repayLoan selector
      mstore(startPtr, RepayLoanSelector)
      calldatacopy(add(startPtr, 0x04), 0x24, 0x40)
      // Write borrower
      mstore(add(startPtr, 0x04), borrower)
      // Write repayAmount
      mstore(add(startPtr, 0x24), repayAmount)
      // Write loanId
      mstore(add(startPtr, 0x44), loanId)
      // Write data offset
      mstore(add(startPtr, 0x64), 0x80)
      // Size of data + (selector, borrower, repayAmount, loanId, data_offset, data_length)
      let calldataLength := add(mload(data), 0xa4)

      let status := delegatecall(gas(), module, startPtr, calldataLength, 0, 0x40)
      if iszero(status) {
        if returndatasize() {
          returndatacopy(0, 0, returndatasize())
          revert(0, returndatasize())
        }
        // Write RepayLoanError.selector
        mstore(sub(startPtr, 0x20), RepayLoanSelector)
        // Write module to memory
        mstore(sub(startPtr, 0x1c), module)
        // Update data offset
        mstore(add(startPtr, 0x64), 0xa0)
        revert(sub(startPtr, 0x20), add(calldataLength, 0x20))
      }

      collateralToUnlock := mload(0)
      gasRefundEth := mload(0x20)
    }
  }

  /**
   * @param module Module to use for conversion
   * @param borrower Account to receive loan
   * @param borrowAmount Amount of vault's underlying asset to borrow
   * @param nonce Nonce for renvm deposit
   * @param data
   */
  function loan(
    address module,
    address borrower,
    uint256 borrowAmount,
    uint256 nonce,
    bytes memory data,
    bytes memory signature
  ) external nonReentrant {
    // Check module is approved by governance.
    if (!approvedModule[module]) {
      revert ModuleNotApproved();
    }

    bytes32 loanId = verifyTransferRequestSignature(borrower, asset, borrowAmount, module, nonce, data, signature);

    (uint256 checkpointSupply, uint256 checkpointTotalAssets) = checkpointWithdrawParams();

    // Execute module interaction
    (uint256 collateralToLock, uint256 gasRefundEth) = executeReceiveLoan(module, uint256(loanId), data);

    // Store loan information (underlying and shares locked for lender)
    // and transfer their shares to the vault.
    _borrowAmount(uint256(loanId), msg.sender, collateralToLock, checkpointSupply, checkpointTotalAssets);
  }

  function repay(
    address lender,
    address borrower,
    uint256 borrowAmount,
    uint256 nonce,
    address module,
    bytes32 nHash,
    bytes memory data,
    bytes memory signature
  ) external nonReentrant {
    bytes32 loanId = digestTransferRequest(asset, amount, module, nonce, data);
    uint256 mintAmount = getGateway().mint(loanId, borrowAmount, nHash, signature);
    (uint256 collateralToUnlock, uint256 gasRefundEth) = executeRepayLoan(
      module,
      uint256(loanId),
      borrower,
      mintAmount,
      data
    );
    _repayTo(lender, uint256(loanId), collateralToUnlock);
  }
}
