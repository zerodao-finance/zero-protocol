// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

import { LendableSharesVault } from "./LendableSharesVault.sol";
import { GasAccounting } from "./GasAccounting.sol";
import { ERC4626 } from "./ERC4626.sol";
import "../interfaces/IZeroModuleV2.sol";
import "./IQuoter.sol";
import { weth } from "./ConstantAddresses.sol";

abstract contract BtcVault is LendableSharesVault, GasAccounting {
  error ModuleNotApproved();
  error AlreadyInitialized();

  IQuoter public immutable quoter;

  mapping(IZeroModule => bool) public approvedModules;

  constructor(
    IQuoter _quoter,
    address asset,
    uint8 decimals
  ) {
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
    if (!approvedModules[module]) {
      revert ModuleNotApproved();
    }

    // Increment total loans and get ID for this loan.

    // Get estimated gas cost and collateralization ratio for a loan
    // from module.
    uint256 estimatedGas = module.estimateGas();

    // Get max allowable gas fee for the loan and convert to vault's
    // underlying asset.
    uint256 gasCostInAsset = quoter.quote(weth, asset, amount);

    // Store loan information (underlying and shares locked for lender)
    // and transfer their shares to the vault.
    uint256 loanId = uint256(_borrowFrom(msg.sender, amount - gasCostInAsset));

    // Execute module interaction
    IZeroModule(module).receiveLoan(borrower, token, amount - gasCostInAsset, loanId, data);
    // @todo Handle gas repayment
  }
}
