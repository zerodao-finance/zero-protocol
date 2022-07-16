// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import { ZeroBTCBase } from "./ZeroBTCBase.sol";
import { ZeroBTCCache } from "./ZeroBTCCache.sol";
import { ZeroBTCConfig } from "./ZeroBTCConfig.sol";
import { ZeroBTCLoans } from "./ZeroBTCLoans.sol";

contract ZeroBTC is ZeroBTCBase, ZeroBTCCache, ZeroBTCConfig, ZeroBTCLoans {
  constructor(
    IGatewayRegistry gatewayRegistry,
    IChainlinkOracle btcEthPriceOracle,
    IChainlinkOracle gasPriceOracle,
    uint256 cacheTimeToLive,
    uint256 maxLoanDuration,
    address _asset,
    address _proxyContract
  )
    ZeroBTCBase(
      gatewayRegistry,
      btcEthPriceOracle,
      gasPriceOracle,
      cacheTimeToLive,
      maxLoanDuration,
      _asset,
      _proxyContract
    )
  {}
}
