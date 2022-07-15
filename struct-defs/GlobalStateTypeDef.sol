struct GlobalState {
  // Fraction of borrow amounts taken as a fee for Zero (set by governance)
  // Expressed in basis points (unit = 0.01%)
  // Can not exceed 20.47%
  uint11 zeroBorrowFeeBips unchecked;

  // Fraction of borrow amounts taken as a fee for RenVM (set by governance)
  // Expressed in basis points (unit = 0.01%)
  // Can not exceed 20.47%
  uint11 renBorrowFeeBips unchecked;

  // Fraction of profit
  uint13 zeroFeeShareBips unchecked;

  // Amount of Bitcoin taken as a fee for Zero (set by governance)
  // Supports fees up to 0.08388607 Bitcoin
  uint23 zeroBorrowFeeStatic;

  // Amount of Bitcoin taken as a fee for RenVM (set by governance)
  // Supports fees up to 0.08388607 Bitcoin
  uint23 renBorrowFeeStatic;

  // Total amount of bitcoin that has been borrowed
  uint48 totalBitcoinBorrowed;

  // Last recorded price of ETH in Bitcoin (cached)
  // Supports prices up to 10995.11627776 BTC per ETH
  // Expressed in satoshi per full ETH (1e18 wei)
  uint40 satoshiPerEth { get; };

  // Gas price in gigawei (cached)
  // Runs out of space at gas price of 65535 gwei, which would make
  // basic ether transfers cost 1.376235 ETH
  uint16 gweiPerGas { get; };

  // Last time the cached values were updated
  // Cache must update if it is lower than global update timestamp
  // or is older than the cache ttl
  uint32 lastUpdateTimestamp { get; };

  group LoanInfo {
    totalBitcoinBorrowed;
  }

  group Fees {
    zeroBorrowFeeBips;
    renBorrowFeeBips;
    zeroBorrowFeeStatic;
    renBorrowFeeStatic;
  }

  group Cached {
    set;

    satoshiPerEth;
    gweiPerGas;
    lastUpdateTimestamp;
  }

  group ParamsForModuleFees {
    satoshiPerEth;
    gweiPerGas;
  }
}