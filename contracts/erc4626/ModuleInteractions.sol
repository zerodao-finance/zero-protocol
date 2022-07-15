// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import "./storage/VaultBase.sol";
import "./interfaces/IZeroModule.sol";
import "./utils/MemoryRestoration.sol";

uint256 constant ReceiveLoanError_selector = 0x83f44e2200000000000000000000000000000000000000000000000000000000;
uint256 constant RepayLoanError_selector = 0x0ccaea8800000000000000000000000000000000000000000000000000000000;
uint256 constant RepayLoan_selector = 0x2584dde800000000000000000000000000000000000000000000000000000000;
uint256 constant ReceiveLoan_selector = 0x332b578c00000000000000000000000000000000000000000000000000000000;

uint256 constant ModuleCall_borrower_offset = 0x04;
uint256 constant ModuleCall_amount_offset = 0x24;
uint256 constant ModuleCall_loanId_offset = 0x44;
uint256 constant ModuleCall_data_head_offset = 0x64;
uint256 constant ModuleCall_data_length_offset = 0x84;
uint256 constant ModuleCall_data_offset = 0x80;
uint256 constant ModuleCall_calldata_baseLength = 0xa4;

abstract contract ModuleInteractions is VaultBase, MemoryRestoration {
  error InvalidSelector();

  constructor() {
    if (
      uint256(bytes32(IZeroModule.receiveLoan.selector)) != ReceiveLoan_selector ||
      uint256(bytes32(IZeroModule.repayLoan.selector)) != RepayLoan_selector ||
      uint256(bytes32(ReceiveLoanError.selector)) != ReceiveLoanError_selector ||
      uint256(bytes32(RepayLoanError.selector)) != RepayLoanError_selector
    ) {
      revert InvalidSelector();
    }
  }

  /*//////////////////////////////////////////////////////////////
                          Module Interactions
  //////////////////////////////////////////////////////////////*/

  function _prepareModuleCalldata(
    uint256 selector,
    address borrower,
    bytes32 loanId,
    uint256 amount,
    bytes memory data
  ) internal pure {
    assembly {
      let startPtr := sub(data, ModuleCall_data_length_offset)
      // Write function selector
      mstore(startPtr, selector)
      // Write borrower
      mstore(add(startPtr, ModuleCall_borrower_offset), borrower)
      // Write borrowAmount or repaidAmount
      mstore(add(startPtr, ModuleCall_amount_offset), amount)
      // Write loanId
      mstore(add(startPtr, ModuleCall_loanId_offset), loanId)
      // Write data offset
      mstore(add(startPtr, ModuleCall_data_head_offset), ModuleCall_data_offset)
    }
  }

  function _executeReceiveLoan(
    address module,
    address borrower,
    bytes32 loanId,
    uint256 borrowAmount,
    bytes memory data
  ) internal RestoreFiveWordsBefore(data) {
    _prepareModuleCalldata(ReceiveLoan_selector, borrower, loanId, borrowAmount, data);
    assembly {
      let startPtr := sub(data, ModuleCall_data_length_offset)
      // Size of data + (selector, borrower, borrowAmount, loanId, data_offset, data_length)
      let calldataLength := add(mload(data), ModuleCall_calldata_baseLength)
      // Delegatecall module
      let status := delegatecall(gas(), module, startPtr, calldataLength, 0, 0)

      // Handle failures
      if iszero(status) {
        // If return data was provided, bubble up
        if returndatasize() {
          returndatacopy(0, 0, returndatasize())
          revert(0, returndatasize())
        }
        // If no return data was provided, throw generic error
        // Write ReceiveLoanError.selector
        mstore(sub(startPtr, 0x20), ReceiveLoanError_selector)
        // Write module to memory
        mstore(sub(startPtr, 0x1c), module)
        // Update data offset
        mstore(add(startPtr, 0x64), 0xa0)
        // Revert with ReceiveLoanError
        revert(sub(startPtr, 0x20), add(calldataLength, 0x20))
      }
    }
  }

  function _executeRepayLoan(
    address module,
    address borrower,
    bytes32 loanId,
    uint256 repaidAmount,
    bytes memory data
  ) internal RestoreFiveWordsBefore(data) returns (uint256 collateralToUnlock) {
    _prepareModuleCalldata(RepayLoan_selector, borrower, loanId, repaidAmount, data);
    assembly {
      let startPtr := sub(data, ModuleCall_data_length_offset)
      // Size of data + (selector, borrower, borrowAmount, loanId, data_offset, data_length)
      let calldataLength := add(mload(data), ModuleCall_calldata_baseLength)
      // Delegatecall module
      let status := delegatecall(gas(), module, startPtr, calldataLength, 0, 0x20)

      // Handle failures
      if iszero(status) {
        // If return data was provided, bubble up
        if returndatasize() {
          returndatacopy(0, 0, returndatasize())
          revert(0, returndatasize())
        }
        // If no return data was provided, throw generic error
        // Write RepayLoanError.selector
        mstore(sub(startPtr, 0x20), RepayLoanError_selector)
        // Write module to memory
        mstore(sub(startPtr, 0x1c), module)
        // Update data offset
        mstore(add(startPtr, 0x64), 0xa0)
        // Revert with RepayLoanError
        revert(sub(startPtr, 0x20), add(calldataLength, 0x20))
      }
      collateralToUnlock := mload(0)
    }
  }
}
