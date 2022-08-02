// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import { ZeroBTCStorage, ModuleStateCoder, DefaultModuleState, ModuleType, ModuleState, GlobalStateCoder, GlobalState, LoanRecordCoder, LoanRecord } from "../storage/ZeroBTCStorage.sol";
import { IGateway, IGatewayRegistry } from "../../interfaces/IGatewayRegistry.sol";
import "../token/ERC4626.sol";
import "../utils/Governable.sol";
import "../interfaces/IZeroModule.sol";
import "../interfaces/IZeroBTC.sol";
import "../interfaces/IRenBtcEthConverter.sol";
import { IGateway, IGatewayRegistry } from "../../interfaces/IGatewayRegistry.sol";
import { IChainlinkOracle } from "../../interfaces/IChainlinkOracle.sol";

uint256 constant OneBitcoin = 1e8;

// Used to convert a price expressed as wei per btc to one expressed
// as satoshi per ETH
uint256 constant BtcEthPriceInversionNumerator = 1e26;

abstract contract ZeroBTCBase is ZeroBTCStorage, ERC4626, Governable, IZeroBTC {
  using ModuleStateCoder for ModuleState;
  using GlobalStateCoder for GlobalState;
  using LoanRecordCoder for LoanRecord;

  receive() external payable {}

  /*//////////////////////////////////////////////////////////////
                          Immutables
  //////////////////////////////////////////////////////////////*/

  // RenVM gateway registry
  IGatewayRegistry internal immutable _gatewayRegistry;
  // _btcEthPriceOracle MUST return prices expressed as wei per full bitcoin
  IChainlinkOracle internal immutable _btcEthPriceOracle;
  // _gasPriceOracle MUST return gas prices expressed as wei per unit of gas
  IChainlinkOracle internal immutable _gasPriceOracle;
  // Contract for swapping renBTC to ETH
  IRenBtcEthConverter internal immutable _renBtcConverter;
  // TTL for global cache
  uint256 internal immutable _cacheTimeToLive;
  // Maximum time a loan can remain outstanding
  uint256 internal immutable _maxLoanDuration;
  // Target ETH reserves for gas refunds
  uint256 internal immutable _targetEthReserve;
  // Target ETH reserves for gas refunds
  uint256 internal immutable _maxGasProfitShareBips;
  // Recipient of Zero DAO fees
  address internal immutable _zeroFeeRecipient;

  constructor(
    IGatewayRegistry gatewayRegistry,
    IChainlinkOracle btcEthPriceOracle,
    IChainlinkOracle gasPriceOracle,
    IRenBtcEthConverter renBtcConverter,
    uint256 cacheTimeToLive,
    uint256 maxLoanDuration,
    uint256 targetEthReserve,
    uint256 maxGasProfitShareBips,
    address zeroFeeRecipient,
    address _asset,
    address _proxyContract
  ) ERC4626(_asset, "ZeroBTC", "ZBTC", 8, _proxyContract, "v1") {
    _gatewayRegistry = gatewayRegistry;
    _btcEthPriceOracle = btcEthPriceOracle;
    _gasPriceOracle = gasPriceOracle;
    _renBtcConverter = renBtcConverter;
    _cacheTimeToLive = cacheTimeToLive;
    _maxLoanDuration = maxLoanDuration;
    _targetEthReserve = targetEthReserve;
    _maxGasProfitShareBips = maxGasProfitShareBips;
    _zeroFeeRecipient = zeroFeeRecipient;
  }

  /*//////////////////////////////////////////////////////////////
                        State Initialization
  //////////////////////////////////////////////////////////////*/

  function initialize(
    address initialGovernance,
    uint256 zeroBorrowFeeBips,
    uint256 renBorrowFeeBips,
    uint256 zeroBorrowFeeStatic,
    uint256 renBorrowFeeStatic
  ) external override {
    if (_governance != address(0)) {
      revert AlreadyInitialized();
    }
    // Initialize governance address
    Governable._initialize(initialGovernance);
    // Initialize reentrancy guard mutex
    ReentrancyGuard._initialize();
    // Ensure fees are valid
    if (
      zeroBorrowFeeBips > 2000 ||
      renBorrowFeeBips > 2000 ||
      zeroBorrowFeeBips == 0 ||
      renBorrowFeeBips == 0
    ) {
      revert InvalidDynamicBorrowFee();
    }
    // Set initial global state
    _state = _state.setFees(
      zeroBorrowFeeBips,
      renBorrowFeeBips,
      zeroBorrowFeeStatic,
      renBorrowFeeStatic
    );
  }

  /*//////////////////////////////////////////////////////////////
                          External Getters
  //////////////////////////////////////////////////////////////*/

  function getConfig()
    external
    view
    virtual
    override
    returns (
      address gatewayRegistry,
      address btcEthPriceOracle,
      address gasPriceOracle,
      address renBtcConverter,
      uint256 cacheTimeToLive,
      uint256 maxLoanDuration,
      uint256 targetEthReserve,
      uint256 maxGasProfitShareBips,
      address zeroFeeRecipient
    )
  {
    gatewayRegistry = address(_gatewayRegistry);
    btcEthPriceOracle = address(_btcEthPriceOracle);
    gasPriceOracle = address(_gasPriceOracle);
    renBtcConverter = address(_renBtcConverter);
    cacheTimeToLive = _cacheTimeToLive;
    maxLoanDuration = _maxLoanDuration;
    targetEthReserve = _targetEthReserve;
    maxGasProfitShareBips = _maxGasProfitShareBips;
    zeroFeeRecipient = _zeroFeeRecipient;
  }

  function getGlobalState()
    external
    view
    override
    returns (
      uint256 zeroBorrowFeeBips,
      uint256 renBorrowFeeBips,
      uint256 zeroFeeShareBips,
      uint256 zeroBorrowFeeStatic,
      uint256 renBorrowFeeStatic,
      uint256 satoshiPerEth,
      uint256 gweiPerGas,
      uint256 lastUpdateTimestamp,
      uint256 totalBitcoinBorrowed,
      uint256 unburnedGasReserveShares,
      uint256 unburnedZeroFeeShares
    )
  {
    return _state.decode();
  }

  function getModuleState(address module)
    external
    view
    override
    returns (
      ModuleType moduleType,
      uint256 loanGasE4,
      uint256 repayGasE4,
      uint256 ethRefundForLoanGas,
      uint256 ethRefundForRepayGas,
      uint256 btcFeeForLoanGas,
      uint256 btcFeeForRepayGas,
      uint256 lastUpdateTimestamp
    )
  {
    return _getExistingModuleState(module).decode();
  }

  function totalAssets()
    public
    view
    virtual
    override(ERC4626, IERC4626)
    returns (uint256)
  {
    return ERC4626.totalAssets() + _state.getTotalBitcoinBorrowed();
  }

  /*//////////////////////////////////////////////////////////////
                          Internal Getters
  //////////////////////////////////////////////////////////////*/

  function _getSatoshiPerEth() internal view returns (uint256) {
    uint256 ethPerBitcoin = _btcEthPriceOracle.latestAnswer();
    return BtcEthPriceInversionNumerator / ethPerBitcoin;
  }

  function _getGweiPerGas() internal view returns (uint256) {
    uint256 gasPrice = _gasPriceOracle.latestAnswer();
    return gasPrice / 1e9;
  }

  function _getGateway() internal view returns (IGateway gateway) {
    gateway = IGateway(_gatewayRegistry.getGatewayByToken(asset));
  }

  function _getExistingModuleState(address module)
    internal
    view
    returns (ModuleState moduleState)
  {
    moduleState = _moduleFees[module];
    if (moduleState.isNull()) {
      revert ModuleDoesNotExist();
    }
  }
}
