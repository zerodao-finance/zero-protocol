// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Math } from "@openzeppelin/contracts/math/Math.sol";
import "../interfaces/IChainlinkOracle.sol";
import "../interfaces/IZeroModule.sol";
import { Governable } from "./Governable.sol";
import { GasParameters } from "./VaultStructs.sol";

contract GasAccounting is Governable {
  GasParameters public gasParameters;

  function _init(GasParameters memory _gasParameters) internal {
    gasParameters = _gasParameters;
  }

  function setGasParameters(GasParameters memory _gasParameters) public onlyGovernance {
    gasParameters = _gasParameters;
  }

  function getEthRefundForRepayGas(uint256 gasEstimate) internal view returns (uint256) {
    GasParameters memory params = gasParameters;
    return getEthRefund(params, gasEstimate, params.maxGasRefundForRepayCall);
  }

  function getEthRefundForLoanGas(uint256 gasEstimate) internal view returns (uint256) {
    GasParameters memory params = gasParameters;
    return getEthRefund(params, gasEstimate, params.maxGasRefundForLoanCall);
  }

  function getEthRefundForBurnGas(uint256 gasEstimate) internal view returns (uint256) {
    GasParameters memory params = gasParameters;
    return getEthRefund(params, gasEstimate, params.maxGasRefundForBurnCall);
  }

  function getEthRefundForMetaGas(uint256 gasEstimate) internal view returns (uint256) {
    GasParameters memory params = gasParameters;
    return getEthRefund(params, gasEstimate, params.maxGasRefundForMetaCall);
  }

  function getEthRefund(
    GasParameters memory params,
    uint256 estimatedGas,
    uint256 maxGas
  ) private view returns (uint256) {
    uint256 reportedGasPrice = params.fastGasOracle.latestAnswer();
    uint256 acceptableGasPrice = Math.min(reportedGasPrice * 2, tx.gasPrice);
    uint256 gasToRefund = Math.min(estimatedGas, maxGas);
    return gasToRefund * acceptableGasPrice;
  }
}
