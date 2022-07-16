// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import { ModuleType } from "../utils/ModuleStateCoder.sol";
import { IERC4626 } from "./IERC4626.sol";
import "./IGovernable.sol";
import "./InitializationErrors.sol";

interface IZeroBTC is IERC4626, IGovernable, InitializationErrors {
  /*//////////////////////////////////////////////////////////////
                               Actions
  //////////////////////////////////////////////////////////////*/

  function loan(
    address module,
    address borrower,
    uint256 borrowAmount,
    uint256 nonce,
    bytes memory signature,
    bytes memory data
  ) external;

  function repay(
    address lender,
    address borrower,
    uint256 borrowAmount,
    uint256 nonce,
    address module,
    bytes32 nHash,
    bytes memory renSignature,
    bytes memory data
  ) external;

  function setGlobalFees(
    uint256 zeroBorrowFeeBips,
    uint256 renBorrowFeeBips,
    uint256 zeroBorrowFeeStatic,
    uint256 renBorrowFeeStatic
  ) external;

  function setModuleGasFees(
    address module,
    uint256 loanGas,
    uint256 repayGas
  ) external;

  function addModule(
    address module,
    ModuleType moduleType,
    uint256 loanGas,
    uint256 repayGas
  ) external;

  function removeModule(address module) external;

  function pokeGlobalCache() external;

  function pokeModuleCache(address module) external;

  function initialize(
    address initialGovernance,
    uint256 zeroBorrowFeeBips,
    uint256 renBorrowFeeBips,
    uint256 zeroBorrowFeeStatic,
    uint256 renBorrowFeeStatic
  ) external;

  /*//////////////////////////////////////////////////////////////
                               Getters
  //////////////////////////////////////////////////////////////*/

  function getConfig()
    external
    view
    returns (
      address gatewayRegistry,
      address btcEthPriceOracle,
      address gasPriceOracle,
      uint256 cacheTimeToLive,
      uint256 maxLoanDuration
    );

  function getGlobalState()
    external
    view
    returns (
      uint256 zeroBorrowFeeBips,
      uint256 renBorrowFeeBips,
      uint256 zeroBorrowFeeStatic,
      uint256 renBorrowFeeStatic,
      uint256 zeroFeeShareBips,
      uint256 totalBitcoinBorrowed,
      uint256 satoshiPerEth,
      uint256 gweiPerGas,
      uint256 lastUpdateTimestamp
    );

  function getModuleState(address module)
    external
    view
    returns (
      ModuleType moduleType,
      uint256 loanGasE4,
      uint256 repayGasE4,
      uint256 ethRefundForLoanGas,
      uint256 ethRefundForRepayGas,
      uint256 btcFeeForLoanGas,
      uint256 btcFeeForRepayGas,
      uint256 lastUpdateTimestamp
    );

  function getOutstandingLoan(address lender, uint256 loanId)
    external
    view
    returns (
      uint256 sharesLocked,
      uint256 actualBorrowAmount,
      uint256 lenderDebt,
      uint256 vaultExpenseWithoutRepayFee,
      uint256 expiry
    );

  /*//////////////////////////////////////////////////////////////
                               Errors
  //////////////////////////////////////////////////////////////*/

  error ModuleDoesNotExist();

  error ReceiveLoanError(address module, address borrower, uint256 borrowAmount, uint256 loanId, bytes data);

  error RepayLoanError(address module, address borrower, uint256 repaidAmount, uint256 loanId, bytes data);

  error ModuleAssetDoesNotMatch(address moduleAsset);

  error InvalidModuleType();

  error InvalidDynamicBorrowFee();

  error LoanDoesNotExist(uint256 loanId);

  error LoanIdNotUnique(uint256 loanId);

  error InvalidNullValue();

  error InvalidSelector();

  /*//////////////////////////////////////////////////////////////
                                Events
  //////////////////////////////////////////////////////////////*/

  event LoanCreated(address lender, address borrower, uint256 loanId, uint256 assetsBorrowed, uint256 sharesLocked);

  event LoanClosed(uint256 loanId, uint256 assetsRepaid, uint256 sharesUnlocked, uint256 sharesBurned);

  event ModuleStateUpdated(address module, ModuleType moduleType, uint256 loanGasE4, uint256 repayGasE4);

  event GlobalStateConfigUpdated(uint256 dynamicBorrowFee, uint256 staticBorrowFee);

  event GlobalStateCacheUpdated(uint256 satoshiPerEth, uint256 getGweiPerGas);
}