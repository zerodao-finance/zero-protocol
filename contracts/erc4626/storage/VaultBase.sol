// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import "./ERC4626Base.sol";
import "./EIP2612Base.sol";
import { ModuleStateCoder, ModuleType, ModuleState, DefaultModuleState } from "../utils/ModuleStateCoder.sol";
import { GlobalStateCoder, GlobalState, DefaultGlobalState } from "../utils/GlobalStateCoder.sol";
import { LoanRecordCoder, LoanRecord, DefaultLoanRecord } from "../utils/LoanRecordCoder.sol";
import { IGateway, IGatewayRegistry } from "../../interfaces/IGatewayRegistry.sol";
import { IChainlinkOracle } from "../../interfaces/IChainlinkOracle.sol";

contract VaultBase is ERC4626Base, EIP2612Base {
  /*//////////////////////////////////////////////////////////////
                          Immutables
//////////////////////////////////////////////////////////////*/

  // RenVM gateway registry
  IGatewayRegistry internal immutable gatewayRegistry;
  // btcEthPriceOracle MUST return prices expressed as wei per full bitcoin
  IChainlinkOracle internal immutable btcEthPriceOracle;
  // gasPriceOracle MUST return gas prices expressed as wei per unit of gas
  IChainlinkOracle internal immutable gasPriceOracle;
  // TTL for global cache
  uint256 internal immutable cacheTimeToLive;
  // Maximum time a loan can remain outstanding
  uint256 internal immutable maxLoanDuration;

  /*//////////////////////////////////////////////////////////////
                          Storage
  //////////////////////////////////////////////////////////////*/

  GlobalState internal _state;

  mapping(address => ModuleState) internal _moduleFees;

  // Maps lender => loanId => LoanRecord
  mapping(address => mapping(uint256 => LoanRecord)) internal _outstandingLoans;

  /*//////////////////////////////////////////////////////////////
                          Constructor
  //////////////////////////////////////////////////////////////*/

  constructor(
    IGatewayRegistry _gatewayRegistry,
    IChainlinkOracle _btcEthPriceOracle,
    IChainlinkOracle _gasPriceOracle,
    uint256 _feesTimeToLive,
    uint256 _maxLoanDuration
  ) {
    gatewayRegistry = _gatewayRegistry;
    btcEthPriceOracle = _btcEthPriceOracle;
    gasPriceOracle = _gasPriceOracle;
    cacheTimeToLive = _feesTimeToLive;
    maxLoanDuration = _maxLoanDuration;
  }

  /*//////////////////////////////////////////////////////////////
                            ERRORS
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

  /*//////////////////////////////////////////////////////////////
                          EVENTS
  //////////////////////////////////////////////////////////////*/

  event LoanCreated(address lender, address borrower, uint256 loanId, uint256 assetsBorrowed, uint256 sharesLocked);

  event LoanClosed(uint256 loanId, uint256 assetsRepaid, uint256 sharesUnlocked, uint256 sharesBurned);

  event ModuleStateUpdated(address module, ModuleType moduleType, uint256 loanGasE4, uint256 repayGasE4);

  event GlobalStateConfigUpdated(uint256 dynamicBorrowFee, uint256 staticBorrowFee);

  event GlobalStateCacheUpdated(uint256 satoshiPerEth, uint256 getGweiPerGas);
}
