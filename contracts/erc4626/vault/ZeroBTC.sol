// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import { ZeroBTCBase } from "./ZeroBTCBase.sol";
import { ZeroBTCCache } from "./ZeroBTCCache.sol";
import { ZeroBTCConfig } from "./ZeroBTCConfig.sol";
import { ZeroBTCLoans } from "./ZeroBTCLoans.sol";
import { IGateway, IGatewayRegistry } from "../../interfaces/IGatewayRegistry.sol";
import { IChainlinkOracle } from "../../interfaces/IChainlinkOracle.sol";
import "../interfaces/IRenBtcEthConverter.sol";

contract ZeroBTC is ZeroBTCBase, ZeroBTCCache, ZeroBTCConfig, ZeroBTCLoans {
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
  )
    ZeroBTCBase(
      gatewayRegistry,
      btcEthPriceOracle,
      gasPriceOracle,
      renBtcConverter,
      cacheTimeToLive,
      maxLoanDuration,
      targetEthReserve,
      maxGasProfitShareBips,
      zeroFeeRecipient,
      _asset,
      _proxyContract
    )
  {}
}
