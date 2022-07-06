struct GlobalFees {
  // Fraction of borrow amounts taken as a fee (set by governance)
  // Expressed in basis points (unit = 0.01%)
  uint16 dynamicBorrowFeeBips;
  // Amount of Bitcoin taken as a fee on borrow amounts (set by governance)
  // Supports fees up to 0.16777216 Bitcoin
  uint24 staticBorrowFee;
  // Last recorded price of ETH in Bitcoin (cached)
  // Supports prices up to 10995.11627776 BTC per ETH
  // Expressed in satoshi per full ETH (1e18 wei)
  uint40 satoshiPerEth;
  // Gas price in gigawei (cached)
  // Runs out of space at gas price of 65535 gwei, which would make
  // basic ether transfers cost 1.376235 ETH
  uint16 gweiPerGas;
  // Last time the cached values were updated
  // Cache must update if it is lower than global update timestamp
  // or is older than the cache ttl
  uint32 lastUpdateTimestamp;

  group Cached {
    satoshiPerEth;
    gweiPerGas;
    lastUpdateTimestamp;
  }

  group ParamsForModuleFees {
    staticBorrowFee;
    satoshiPerEth;
    gweiPerGas;
  }

  group Config {
    dynamicBorrowFeeBips;
    staticBorrowFee;
  }
}