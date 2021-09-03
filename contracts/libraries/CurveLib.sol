pragma solidity >=0.6.0;


import { ICurveInt128 } from "../interfaces/CurvePools/ICurveInt128.sol";
import "hardhat/console.sol";
import { ICurveUInt128 } from "../interfaces/CurvePools/ICurveUInt128.sol";

import { ICurveInt256 } from "../interfaces/CurvePools/ICurveInt256.sol";

import { ICurveUInt256 } from "../interfaces/CurvePools/ICurveUInt256.sol";
import { ICurveETHUInt256 } from "../interfaces/CurvePools/ICurveETHUInt256.sol";
import { ICurveUnderlyingUInt128 } from "../interfaces/CurvePools/ICurveUnderlyingUInt128.sol";
import { ICurveUnderlyingUInt256 } from "../interfaces/CurvePools/ICurveUnderlyingUInt256.sol";
import { ICurveUnderlyingInt128 } from "../interfaces/CurvePools/ICurveUnderlyingInt128.sol";
import { ICurveUnderlyingInt256 } from "../interfaces/CurvePools/ICurveUnderlyingInt256.sol";
import { RevertCaptureLib } from "./RevertCaptureLib.sol";

library CurveLib { 
  address constant weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
  struct ICurve {
    address pool;
    bool underlying;
    bytes4 coinsSelector;
    bytes4 exchangeSelector;
    bytes4 getDySelector;
    bytes4 coinsUnderlyingSelector;
  }
  function hasWETH(address pool, bytes4 coinsSelector) internal returns (bool) {
    for (uint256 i = 0;; i++) {
      (bool success, bytes memory result) = pool.staticcall(abi.encodePacked(coinsSelector, i));
      if (!success) return false;
      (address coin) = abi.decode(result, (address));
      if (coin == weth) return true;
    }
  }
  function coins(ICurve memory curve, uint256 i) internal view returns (address result) {
    (bool success, bytes memory returnData) = curve.pool.staticcall(abi.encodeWithSelector(curve.underlying ? curve.coinsUnderlyingSelector : curve.coinsSelector, i));
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
  function callOrStaticCall(bool _static, address target, bytes memory callData) internal returns (bytes memory returnData) {
    if (_static) {
      (, returnData) = target.staticcall(callData);
    } else {
      (, returnData) = target.call(callData);
    }
  }
  function toDynamic(bytes4[4] memory ary) internal pure returns (bytes4[] memory result) {
    result = new bytes4[](ary.length);
    for (uint256 i = 0; i < ary.length; i++) {
      result[i] = ary[i];
    }
  }
  function toDynamic(bytes4[5] memory ary) internal pure returns (bytes4[] memory result) {
    result = new bytes4[](ary.length);
    for (uint256 i = 0; i < ary.length; i++) {
      result[i] = ary[i];
    }
  }
  function testSignatures(address target, bool staticCall, bytes4[] memory signatures, bytes memory callData) internal returns (bytes4 result) {
    for (uint256 i = 0; i < signatures.length; i++) {
      bytes memory returnData = callOrStaticCall(staticCall, target, abi.encodePacked(signatures[i], callData));
      if (returnData.length != 0) return signatures[i];
    }
    revert("signature not found in contract");
  }
  function duckPool(address pool, bool underlying) internal returns (ICurve memory result) {
    result.pool = pool;
    result.underlying = underlying;
    console.log("pool ", result.pool);
    result.coinsSelector = testSignatures(pool, true, toDynamic([ ICurveInt128.coins.selector, ICurveInt256.coins.selector, ICurveUInt128.coins.selector, ICurveUInt256.coins.selector ]), abi.encode(0));
    console.log("got coinsSelector");
    if (underlying) {
    console.log("getting coinsUnderlyingSelector");
	    result.coinsUnderlyingSelector = testSignatures(pool, true, toDynamic([ ICurveUnderlyingInt128.underlying_coins.selector, ICurveUnderlyingInt256.underlying_coins.selector, ICurveUnderlyingUInt128.underlying_coins.selector, ICurveUnderlyingUInt256.underlying_coins.selector ]), abi.encode(0));
    console.log("got coinsUnderlyingSelector");
    }
    result.exchangeSelector = hasWETH(pool, result.coinsSelector) ? ICurveETHUInt256.exchange.selector : testSignatures(pool, false, toDynamic([ ICurveInt128.exchange.selector, ICurveInt256.exchange.selector, ICurveUInt128.exchange.selector, ICurveUInt256.exchange.selector ]), abi.encode(0, 1, 1, type(uint256).max, false));
    console.log("got exchangeSelector");
    result.getDySelector = testSignatures(pool, true, toDynamic([ ICurveInt128.get_dy.selector, ICurveInt256.get_dy.selector, ICurveUInt128.get_dy.selector, ICurveUInt256.get_dy.selector ]), abi.encode(0, 1, 1));
    console.log("got getDySelector");
   }
   function fromSelectors(address pool, bool underlying, bytes4 coinsSelector, bytes4 coinsUnderlyingSelector, bytes4 exchangeSelector, bytes4 getDySelector) internal pure returns (ICurve memory result) {
     result.pool = pool;
     result.coinsSelector = coinsSelector;
     result.coinsUnderlyingSelector = coinsUnderlyingSelector;
     result.exchangeSelector = exchangeSelector;
     result.getDySelector = getDySelector;
   }
} 
