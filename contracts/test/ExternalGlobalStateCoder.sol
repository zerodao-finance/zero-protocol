// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../erc4626/utils/GlobalStateCoder.sol";

// ============================== NOTICE ==============================
// This library was automatically generated with stackpacker.
// Be very careful about modifying it, as doing so incorrectly could
// result in corrupted reads/writes.
// ====================================================================

contract ExternalGlobalStateCoder {
  GlobalState internal _globalState;

  function decode()
    external
    view
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
    (
      zeroBorrowFeeBips,
      renBorrowFeeBips,
      zeroFeeShareBips,
      zeroBorrowFeeStatic,
      renBorrowFeeStatic,
      satoshiPerEth,
      gweiPerGas,
      lastUpdateTimestamp,
      totalBitcoinBorrowed,
      unburnedGasReserveShares,
      unburnedZeroFeeShares
    ) = GlobalStateCoder.decode(_globalState);
  }

  function encode(
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
  ) external {
    (_globalState) = GlobalStateCoder.encode(
      zeroBorrowFeeBips,
      renBorrowFeeBips,
      zeroFeeShareBips,
      zeroBorrowFeeStatic,
      renBorrowFeeStatic,
      satoshiPerEth,
      gweiPerGas,
      lastUpdateTimestamp,
      totalBitcoinBorrowed,
      unburnedGasReserveShares,
      unburnedZeroFeeShares
    );
  }

  function setLoanInfo(uint256 totalBitcoinBorrowed) external {
    (_globalState) = GlobalStateCoder.setLoanInfo(_globalState, totalBitcoinBorrowed);
  }

  function getLoanInfo() external view returns (uint256 totalBitcoinBorrowed) {
    (totalBitcoinBorrowed) = GlobalStateCoder.getLoanInfo(_globalState);
  }

  function setFees(
    uint256 zeroBorrowFeeBips,
    uint256 renBorrowFeeBips,
    uint256 zeroBorrowFeeStatic,
    uint256 renBorrowFeeStatic
  ) external {
    (_globalState) = GlobalStateCoder.setFees(
      _globalState,
      zeroBorrowFeeBips,
      renBorrowFeeBips,
      zeroBorrowFeeStatic,
      renBorrowFeeStatic
    );
  }

  function getFees()
    external
    view
    returns (
      uint256 zeroBorrowFeeBips,
      uint256 renBorrowFeeBips,
      uint256 zeroBorrowFeeStatic,
      uint256 renBorrowFeeStatic
    )
  {
    (zeroBorrowFeeBips, renBorrowFeeBips, zeroBorrowFeeStatic, renBorrowFeeStatic) = GlobalStateCoder.getFees(
      _globalState
    );
  }

  function setCached(
    uint256 satoshiPerEth,
    uint256 gweiPerGas,
    uint256 lastUpdateTimestamp
  ) external {
    (_globalState) = GlobalStateCoder.setCached(_globalState, satoshiPerEth, gweiPerGas, lastUpdateTimestamp);
  }

  function setParamsForModuleFees(uint256 satoshiPerEth, uint256 gweiPerGas) external {
    (_globalState) = GlobalStateCoder.setParamsForModuleFees(_globalState, satoshiPerEth, gweiPerGas);
  }

  function getParamsForModuleFees() external view returns (uint256 satoshiPerEth, uint256 gweiPerGas) {
    (satoshiPerEth, gweiPerGas) = GlobalStateCoder.getParamsForModuleFees(_globalState);
  }

  function setUnburnedShares(uint256 unburnedGasReserveShares, uint256 unburnedZeroFeeShares) external {
    (_globalState) = GlobalStateCoder.setUnburnedShares(_globalState, unburnedGasReserveShares, unburnedZeroFeeShares);
  }

  function getUnburnedShares() external view returns (uint256 unburnedGasReserveShares, uint256 unburnedZeroFeeShares) {
    (unburnedGasReserveShares, unburnedZeroFeeShares) = GlobalStateCoder.getUnburnedShares(_globalState);
  }

  function getZeroBorrowFeeBips() external view returns (uint256 zeroBorrowFeeBips) {
    (zeroBorrowFeeBips) = GlobalStateCoder.getZeroBorrowFeeBips(_globalState);
  }

  function setZeroBorrowFeeBips(uint256 zeroBorrowFeeBips) external {
    (_globalState) = GlobalStateCoder.setZeroBorrowFeeBips(_globalState, zeroBorrowFeeBips);
  }

  function getRenBorrowFeeBips() external view returns (uint256 renBorrowFeeBips) {
    (renBorrowFeeBips) = GlobalStateCoder.getRenBorrowFeeBips(_globalState);
  }

  function setRenBorrowFeeBips(uint256 renBorrowFeeBips) external {
    (_globalState) = GlobalStateCoder.setRenBorrowFeeBips(_globalState, renBorrowFeeBips);
  }

  function getZeroFeeShareBips() external view returns (uint256 zeroFeeShareBips) {
    (zeroFeeShareBips) = GlobalStateCoder.getZeroFeeShareBips(_globalState);
  }

  function setZeroFeeShareBips(uint256 zeroFeeShareBips) external {
    (_globalState) = GlobalStateCoder.setZeroFeeShareBips(_globalState, zeroFeeShareBips);
  }

  function getZeroBorrowFeeStatic() external view returns (uint256 zeroBorrowFeeStatic) {
    (zeroBorrowFeeStatic) = GlobalStateCoder.getZeroBorrowFeeStatic(_globalState);
  }

  function setZeroBorrowFeeStatic(uint256 zeroBorrowFeeStatic) external {
    (_globalState) = GlobalStateCoder.setZeroBorrowFeeStatic(_globalState, zeroBorrowFeeStatic);
  }

  function getRenBorrowFeeStatic() external view returns (uint256 renBorrowFeeStatic) {
    (renBorrowFeeStatic) = GlobalStateCoder.getRenBorrowFeeStatic(_globalState);
  }

  function setRenBorrowFeeStatic(uint256 renBorrowFeeStatic) external {
    (_globalState) = GlobalStateCoder.setRenBorrowFeeStatic(_globalState, renBorrowFeeStatic);
  }

  function getSatoshiPerEth() external view returns (uint256 satoshiPerEth) {
    (satoshiPerEth) = GlobalStateCoder.getSatoshiPerEth(_globalState);
  }

  function getGweiPerGas() external view returns (uint256 gweiPerGas) {
    (gweiPerGas) = GlobalStateCoder.getGweiPerGas(_globalState);
  }

  function getLastUpdateTimestamp() external view returns (uint256 lastUpdateTimestamp) {
    (lastUpdateTimestamp) = GlobalStateCoder.getLastUpdateTimestamp(_globalState);
  }

  function getTotalBitcoinBorrowed() external view returns (uint256 totalBitcoinBorrowed) {
    (totalBitcoinBorrowed) = GlobalStateCoder.getTotalBitcoinBorrowed(_globalState);
  }

  function setTotalBitcoinBorrowed(uint256 totalBitcoinBorrowed) external {
    (_globalState) = GlobalStateCoder.setTotalBitcoinBorrowed(_globalState, totalBitcoinBorrowed);
  }

  function getUnburnedGasReserveShares() external view returns (uint256 unburnedGasReserveShares) {
    (unburnedGasReserveShares) = GlobalStateCoder.getUnburnedGasReserveShares(_globalState);
  }

  function setUnburnedGasReserveShares(uint256 unburnedGasReserveShares) external {
    (_globalState) = GlobalStateCoder.setUnburnedGasReserveShares(_globalState, unburnedGasReserveShares);
  }

  function getUnburnedZeroFeeShares() external view returns (uint256 unburnedZeroFeeShares) {
    (unburnedZeroFeeShares) = GlobalStateCoder.getUnburnedZeroFeeShares(_globalState);
  }

  function setUnburnedZeroFeeShares(uint256 unburnedZeroFeeShares) external {
    (_globalState) = GlobalStateCoder.setUnburnedZeroFeeShares(_globalState, unburnedZeroFeeShares);
  }
}
