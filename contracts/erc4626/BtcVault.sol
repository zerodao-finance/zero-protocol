// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import "./loans/LendableSharesVault.sol";
import { BtcVaultBase } from "./storage/BtcVaultBase.sol";
import { IGateway } from "../interfaces/IGateway.sol";
import { IGatewayRegistry } from "../interfaces/IGatewayRegistry.sol";
import { EIP712 } from "./EIP712/EIP712.sol";
import "./interfaces/IZeroModule.sol";
import "./IQuoter.sol";
import "./Governable.sol";

uint256 constant ReceiveLoanSelector = 0x332b578c00000000000000000000000000000000000000000000000000000000;
uint256 constant ReceiveLoanErrorSelector = 0x83f44e2200000000000000000000000000000000000000000000000000000000;
uint256 constant RepayLoanSelector = 0x2584dde800000000000000000000000000000000000000000000000000000000;
uint256 constant RepayLoanErrorSelector = 0x0ccaea8800000000000000000000000000000000000000000000000000000000;

contract BtcVault is BtcVaultBase, LendableSharesVault, EIP712, Governable {
  IGatewayRegistry public immutable gatewayRegistry;
  string public constant version = "v0.1";

  constructor(IGatewayRegistry _gatewayRegistry, address _btcAddress)
    ERC4626(_btcAddress)
    ERC20Metadata("ZeroBTC", "ZBTC", 18)
    ReentrancyGuard()
    Governable()
    EIP712("ZeroBTC", version)
  {
    // quoter = _quoter;
    gatewayRegistry = _gatewayRegistry;
    if (
      uint256(bytes32(IZeroModule.receiveLoan.selector)) != ReceiveLoanSelector ||
      uint256(bytes32(IZeroModule.repayLoan.selector)) != RepayLoanSelector ||
      uint256(bytes32(ReceiveLoanError.selector)) != ReceiveLoanErrorSelector ||
      uint256(bytes32(RepayLoanError.selector)) != RepayLoanErrorSelector
    ) {
      revert InvalidSelector();
    }
  }

  function addModule(address module) external onlyGovernance {
    if (IZeroModule(module).asset() != asset) {
      revert ModuleAssetDoesNotMatch(module);
    }
    approvedModules[module] = true;
    emit ModuleStatusUpdated(module, true);
  }

  function removeModule(address module) external onlyGovernance {
    approvedModules[module] = false;
    emit ModuleStatusUpdated(module, false);
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
   * @param data User provided data
   * @param signature User's signatures
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
    if (!approvedModules[module]) {
      revert ModuleNotApproved();
    }

    bytes32 loanId = verifyTransferRequestSignature(borrower, asset, borrowAmount, module, nonce, data, signature);

    (uint256 checkpointSupply, uint256 checkpointTotalAssets) = checkpointWithdrawParams();

    // Execute module interaction
    (uint256 collateralToLock, uint256 gasRefundEth) = executeReceiveLoan(module, loanId, data);

    // Store loan information (underlying and shares locked for lender)
    // and transfer their shares to the vault.
    _borrowFrom(uint256(loanId), msg.sender, borrower, collateralToLock, checkpointSupply, checkpointTotalAssets);
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
    bytes32 loanId = digestTransferRequest(asset, borrowAmount, module, nonce, data);
    uint256 mintAmount = getGateway().mint(loanId, borrowAmount, nHash, signature);
    (uint256 collateralToUnlock, uint256 gasRefundEth) = executeRepayLoan(module, loanId, borrower, mintAmount, data);
    _repayTo(lender, uint256(loanId), collateralToUnlock);
  }
}
