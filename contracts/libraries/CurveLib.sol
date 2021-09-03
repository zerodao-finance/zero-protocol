pragma solidity >=0.6.0;


import { ICurveInt128 } from "../interfaces/CurvePools/ICurveInt128.sol";
import { ICurveUInt128 } from "../interfaces/CurvePools/ICurveUInt128.sol";

import { ICurveInt256 } from "../interfaces/CurvePools/ICurveInt256.sol";

import { ICurveUInt256 } from "../interfaces/CurvePools/ICurveUInt256.sol";
import { ICurveUnderlyingUInt128 } from "../interfaces/CurvePools/ICurveUnderlyingUInt128.sol";
import { ICurveUnderlyingUInt256 } from "../interfaces/CurvePools/ICurveUnderlyingUInt256.sol";
import { ICurveUnderlyingInt128 } from "../interfaces/CurvePools/ICurveUnderlyingInt128.sol";
import { ICurveUnderlyingInt256 } from "../interfaces/CurvePools/ICurveUnderlyingInt256.sol";
import { RevertCaptureLib } from "./RevertCaptureLib.sol";


library CurveLib { 
  struct ICurve {
    address pool;
    bytes4 coinsSelector;
    bytes4 exchangeSelector;
    bytes4 getDySelector;
    bytes4 coinsUnderlyingSelector;
  }
  function coins(ICurve memory curve, uint256 i) internal view returns (address result) {
    (bool success, bytes memory returnData) = curve.pool.staticcall(abi.encodeWithSelector(curve.coinsSelector, i));
    require(success, "!coins");
    (result) = abi.decode(returnData, (address));
  }
  function underlying_coins(ICurve memory curve, uint256 i) internal view returns (address result) {
    (bool success, bytes memory returnData) = curve.pool.staticcall(abi.encodeWithSelector(curve.coinsUnderlyingSelector, i));
    require(success, "!underlying_coins");
    (result) = abi.decode(returnData, (address));
  }
  function get_dy(ICurve memory curve, uint256 i, uint256 j, uint256 amount) internal view returns (uint256 result) {
    (bool success, bytes memory returnData) = curve.pool.staticcall(abi.encodeWithSelector(curve.getDySelector, i, j, amount));
    require(success, "!get_dy");
    (result) = abi.decode(returnData, (uint256));
  }
  function exchange(ICurve memory curve, uint256 i, uint256 j, uint256 dx, uint256 min_dy) internal {
    (bool success, bytes memory returnData) = curve.pool.call(abi.encodeWithSelector(curve.exchangeSelector, i, j, dx, min_dy));
    if (!success) revert(RevertCaptureLib.decodeError(returnData));
  }
  function testSignatures(address target, bytes4[4] memory signatures, bytes memory callData) internal view returns (bytes4 result) {
    for (uint256 i = 0; i < signatures.length; i++) {
      (, bytes memory returnData) = target.staticcall(abi.encodePacked(signatures[i], callData));
      if (returnData.length != 0) return signatures[i];
    }
    revert("signature not found in contract");
  }
  function duckPool(address pool) internal view returns (ICurve memory result) {
    result.pool = pool;
    result.exchangeSelector = testSignatures(pool, [ ICurveInt128.exchange.selector, ICurveInt256.exchange.selector, ICurveUInt128.exchange.selector, ICurveUInt256.exchange.selector ], abi.encode(0, 1, 1, type(uint256).max));
    result.getDySelector = testSignatures(pool, [ ICurveInt128.get_dy.selector, ICurveInt256.get_dy.selector, ICurveUInt128.get_dy.selector, ICurveUInt256.get_dy.selector ], abi.encode(0, 1, 1));
    result.coinsSelector = testSignatures(pool, [ ICurveInt128.coins.selector, ICurveInt256.coins.selector, ICurveUInt128.coins.selector, ICurveUInt256.coins.selector ], abi.encode(0));
    result.coinsUnderlyingSelector = testSignatures(pool, [ ICurveUnderlyingInt128.underlying_coins.selector, ICurveUnderlyingInt256.underlying_coins.selector, ICurveUnderlyingUInt128.underlying_coins.selector, ICurveUnderlyingUInt256.underlying_coins.selector ], abi.encode(0));
   }
   function fromSelectors(address pool, bytes4 coinsSelector, bytes4 coinsUnderlyingSelector, bytes4 exchangeSelector, bytes4 getDySelector) internal pure returns (ICurve memory result) {
     result.pool = pool;
     result.coinsSelector = coinsSelector;
     result.coinsUnderlyingSelector = coinsUnderlyingSelector;
     result.exchangeSelector = exchangeSelector;
     result.getDySelector = getDySelector;
   }
} 
