// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../erc4626/utils/ModuleStateCoder.sol";

// ============================== NOTICE ==============================
// This library was automatically generated with stackpacker.
// Be very careful about modifying it, as doing so incorrectly could
// result in corrupted reads/writes.
// ====================================================================

contract ExternalModuleStateCoder {
  ModuleState internal _moduleState;

  function decode()
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
    )
  {
    (
      moduleType,
      loanGasE4,
      repayGasE4,
      ethRefundForLoanGas,
      ethRefundForRepayGas,
      btcFeeForLoanGas,
      btcFeeForRepayGas,
      lastUpdateTimestamp
    ) = ModuleStateCoder.decode(_moduleState);
  }

  function encode(
    ModuleType moduleType,
    uint256 loanGasE4,
    uint256 repayGasE4,
    uint256 ethRefundForLoanGas,
    uint256 ethRefundForRepayGas,
    uint256 btcFeeForLoanGas,
    uint256 btcFeeForRepayGas,
    uint256 lastUpdateTimestamp
  ) external {
    (_moduleState) = ModuleStateCoder.encode(
      moduleType,
      loanGasE4,
      repayGasE4,
      ethRefundForLoanGas,
      ethRefundForRepayGas,
      btcFeeForLoanGas,
      btcFeeForRepayGas,
      lastUpdateTimestamp
    );
  }

  function getLoanParams() external view returns (ModuleType moduleType, uint256 ethRefundForLoanGas) {
    (moduleType, ethRefundForLoanGas) = ModuleStateCoder.getLoanParams(_moduleState);
  }

  function getBitcoinGasFees() external view returns (uint256 btcFeeForLoanGas, uint256 btcFeeForRepayGas) {
    (btcFeeForLoanGas, btcFeeForRepayGas) = ModuleStateCoder.getBitcoinGasFees(_moduleState);
  }

  function setRepayParams(
    ModuleType moduleType,
    uint256 ethRefundForRepayGas,
    uint256 btcFeeForRepayGas
  ) external {
    (_moduleState) = ModuleStateCoder.setRepayParams(_moduleState, moduleType, ethRefundForRepayGas, btcFeeForRepayGas);
  }

  function getRepayParams()
    external
    view
    returns (
      ModuleType moduleType,
      uint256 ethRefundForRepayGas,
      uint256 btcFeeForRepayGas
    )
  {
    (moduleType, ethRefundForRepayGas, btcFeeForRepayGas) = ModuleStateCoder.getRepayParams(_moduleState);
  }

  function setCached(
    uint256 ethRefundForLoanGas,
    uint256 ethRefundForRepayGas,
    uint256 btcFeeForLoanGas,
    uint256 btcFeeForRepayGas,
    uint256 lastUpdateTimestamp
  ) external {
    (_moduleState) = ModuleStateCoder.setCached(
      _moduleState,
      ethRefundForLoanGas,
      ethRefundForRepayGas,
      btcFeeForLoanGas,
      btcFeeForRepayGas,
      lastUpdateTimestamp
    );
  }

  function getCached()
    external
    view
    returns (
      uint256 ethRefundForLoanGas,
      uint256 ethRefundForRepayGas,
      uint256 btcFeeForLoanGas,
      uint256 btcFeeForRepayGas,
      uint256 lastUpdateTimestamp
    )
  {
    (
      ethRefundForLoanGas,
      ethRefundForRepayGas,
      btcFeeForLoanGas,
      btcFeeForRepayGas,
      lastUpdateTimestamp
    ) = ModuleStateCoder.getCached(_moduleState);
  }

  function setGasParams(uint256 loanGasE4, uint256 repayGasE4) external {
    (_moduleState) = ModuleStateCoder.setGasParams(_moduleState, loanGasE4, repayGasE4);
  }

  function getGasParams() external view returns (uint256 loanGasE4, uint256 repayGasE4) {
    (loanGasE4, repayGasE4) = ModuleStateCoder.getGasParams(_moduleState);
  }

  function getModuleType() external view returns (ModuleType moduleType) {
    (moduleType) = ModuleStateCoder.getModuleType(_moduleState);
  }

  function setModuleType(ModuleType moduleType) external {
    (_moduleState) = ModuleStateCoder.setModuleType(_moduleState, moduleType);
  }

  function getLoanGasE4() external view returns (uint256 loanGasE4) {
    (loanGasE4) = ModuleStateCoder.getLoanGasE4(_moduleState);
  }

  function setLoanGasE4(uint256 loanGasE4) external {
    (_moduleState) = ModuleStateCoder.setLoanGasE4(_moduleState, loanGasE4);
  }

  function getRepayGasE4() external view returns (uint256 repayGasE4) {
    (repayGasE4) = ModuleStateCoder.getRepayGasE4(_moduleState);
  }

  function setRepayGasE4(uint256 repayGasE4) external {
    (_moduleState) = ModuleStateCoder.setRepayGasE4(_moduleState, repayGasE4);
  }

  function getEthRefundForLoanGas() external view returns (uint256 ethRefundForLoanGas) {
    (ethRefundForLoanGas) = ModuleStateCoder.getEthRefundForLoanGas(_moduleState);
  }

  function setEthRefundForLoanGas(uint256 ethRefundForLoanGas) external {
    (_moduleState) = ModuleStateCoder.setEthRefundForLoanGas(_moduleState, ethRefundForLoanGas);
  }

  function getEthRefundForRepayGas() external view returns (uint256 ethRefundForRepayGas) {
    (ethRefundForRepayGas) = ModuleStateCoder.getEthRefundForRepayGas(_moduleState);
  }

  function setEthRefundForRepayGas(uint256 ethRefundForRepayGas) external {
    (_moduleState) = ModuleStateCoder.setEthRefundForRepayGas(_moduleState, ethRefundForRepayGas);
  }

  function getBtcFeeForLoanGas() external view returns (uint256 btcFeeForLoanGas) {
    (btcFeeForLoanGas) = ModuleStateCoder.getBtcFeeForLoanGas(_moduleState);
  }

  function setBtcFeeForLoanGas(uint256 btcFeeForLoanGas) external {
    (_moduleState) = ModuleStateCoder.setBtcFeeForLoanGas(_moduleState, btcFeeForLoanGas);
  }

  function getBtcFeeForRepayGas() external view returns (uint256 btcFeeForRepayGas) {
    (btcFeeForRepayGas) = ModuleStateCoder.getBtcFeeForRepayGas(_moduleState);
  }

  function setBtcFeeForRepayGas(uint256 btcFeeForRepayGas) external {
    (_moduleState) = ModuleStateCoder.setBtcFeeForRepayGas(_moduleState, btcFeeForRepayGas);
  }

  function getLastUpdateTimestamp() external view returns (uint256 lastUpdateTimestamp) {
    (lastUpdateTimestamp) = ModuleStateCoder.getLastUpdateTimestamp(_moduleState);
  }

  function setLastUpdateTimestamp(uint256 lastUpdateTimestamp) external {
    (_moduleState) = ModuleStateCoder.setLastUpdateTimestamp(_moduleState, lastUpdateTimestamp);
  }
}
