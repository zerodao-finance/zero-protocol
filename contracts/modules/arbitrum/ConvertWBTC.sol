// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import { BaseConvert } from "../BaseConvert.sol";
import { IRenCrvArbitrum } from "../../interfaces/CurvePools/IRenCrvArbitrum.sol";
import { SafeMath } from "@openzeppelin/contracts-new/utils/math/SafeMath.sol";
import { SafeERC20 } from "@openzeppelin/contracts-new/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts-new/token/ERC20/IERC20.sol";

contract ConvertWBTCArbitrum is BaseConvert {
  using SafeMath for *;
  using SafeERC20 for IERC20;
  uint256 public constant override maxBurnGas = 0;
  uint256 public constant override maxLoanGas = 0;
  uint256 public constant override maxRepayGas = 0;

  IRenCrvArbitrum constant renCrv = IRenCrvArbitrum(0x3E01dD8a5E1fb3481F0F589056b428Fc308AF0Fb);
  IERC20 constant wbtc = IERC20(0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f);

  constructor(address asset) BaseConvert(asset) {}

  function swap(bytes32 ptr) internal override returns (uint256 amountOut) {
    ConvertLocals memory locals;
    assembly {
      locals := ptr
    }
    amountOut = renCrv.exchange(1, 0, locals.amount, 1, address(this));
  }

  function swapBack(bytes32) internal override returns (uint256 amountOut) {
    //no-op
  }

  function transfer(address to, uint256 amount) internal override {
    wbtc.transfer(to, amount);
  }
}
