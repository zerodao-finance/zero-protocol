// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import "../utils/Math.sol";
import { IChainlinkOracle } from "../../interfaces/IChainlinkOracle.sol";

/**
 * @dev ChainLink does not currently have a feed on Optimism for the price
 * of BTC/ETH. This contract uses the BTC/USD and ETH/USD feeds to create
 * an equivalent feed which is usable by ZeroBTC on Optimism.
 */
contract OptimismBtcEthPriceOracle {
  // Oracle for price of ETH in USD with 8 decimals.
  IChainlinkOracle internal immutable _ethUsdPriceOracle;
  // Oracle for price of BTC in USD with 8 decimals.
  IChainlinkOracle internal immutable _btcUsdPriceOracle;

  constructor(
    IChainlinkOracle ethUsdPriceOracle,
    IChainlinkOracle btcUsdPriceOracle
  ) {
    _ethUsdPriceOracle = ethUsdPriceOracle;
    _btcUsdPriceOracle = btcUsdPriceOracle;
  }

  /**
   * @dev Uses BTC/USD and ETH/USD price feeds to calculate the BTC/ETH price
   * in wei per bitcoin.
   */
  function latestAnswer() external view returns (uint256) {
    return
      (_btcUsdPriceOracle.latestAnswer() * 1e18) /
      _ethUsdPriceOracle.latestAnswer();
  }
}
