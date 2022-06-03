// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

import { LendableSharesVault } from "./LendableSharesVault.sol";
import { GasAccounting } from "./GasAccounting.sol";
import "../interfaces/IZeroModule.sol";
import "./IQuoter.sol";
import { weth } from "./ConstantAddresses.sol";

contract BtcVault is LendableSharesVault, GasAccounting {
  error ModuleNotApproved();
  error AlreadyInitialized();

  IQuoter public immutable quoter;

  mapping(IZeroModule => bool) public approvedModules;

  constructor(IQuoter _quoter) internal {
    quoter = _quoter;
  }

  /**
   * @param borrower Account to receive loan
   * @param amount Amount of vault's underlying asset to loan
   * @param module Module to use for conversion
   */
  function loan(
    address borrower,
    address token,
    uint256 amount,
    IZeroModule module,
    bytes memory data,
    bytes memory userSignature
  ) internal {
    // Check module is approved by governance.
    if (!approvedModule[module]) {
      revert ModuleNotApproved();
    }

    // Increment total loans and get ID for this loan.
    uint256 loanId = ++loansCount;

    // Get estimated gas cost and collateralization ratio for a loan
    // from module.
    uint256 estimatedGas = module.estimateGas();

    // Get max allowable gas fee for the loan and convert to vault's
    // underlying asset.
    uint256 gasCostInAsset = quoter.quote(weth, asset, amount);

    // Store loan information (underlying and shares locked for lender)
    // and transfer their shares to the vault.
    _borrowFrom(msg.sender, loanId, amount - gasCostInAsset);

    // Execute module interaction
    IZeroModule(module).receiveLoan(borrower, token, amount - gasCostInAsset, nonce, data);
    // @todo Handle gas repayment
  }
}
