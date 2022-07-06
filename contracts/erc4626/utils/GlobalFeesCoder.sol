// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './CoderConstants.sol';

// ============================== NOTICE ==============================
// This library was automatically generated with stackpacker.
// Be very careful about modifying it, as doing so incorrectly could
// result in corrupted reads/writes.
// ====================================================================

// struct GlobalFees {
//   uint16 dynamicBorrowFeeBips;
//   uint24 staticBorrowFee;
//   uint40 satoshiPerEth;
//   uint16 gweiPerGas;
//   uint32 lastUpdateTimestamp;
// }
type GlobalFees is uint256;

library GlobalFeesCoder {
	function decode(GlobalFees encoded)
		internal
		pure
		returns (
			uint256 dynamicBorrowFeeBips,
			uint256 staticBorrowFee,
			uint256 satoshiPerEth,
			uint256 gweiPerGas,
			uint256 lastUpdateTimestamp
		)
	{
		assembly {
			dynamicBorrowFeeBips := shr(GlobalFees_dynamicBorrowFeeBips_bitsAfter, encoded)
			staticBorrowFee := and(MaxUint24, shr(GlobalFees_staticBorrowFee_bitsAfter, encoded))
			satoshiPerEth := and(MaxUint40, shr(GlobalFees_satoshiPerEth_bitsAfter, encoded))
			gweiPerGas := and(MaxUint16, shr(GlobalFees_gweiPerGas_bitsAfter, encoded))
			lastUpdateTimestamp := and(MaxUint32, shr(GlobalFees_lastUpdateTimestamp_bitsAfter, encoded))
		}
	}

	function encode(
		uint256 dynamicBorrowFeeBips,
		uint256 staticBorrowFee,
		uint256 satoshiPerEth,
		uint256 gweiPerGas,
		uint256 lastUpdateTimestamp
	) internal pure returns (GlobalFees encoded) {
		assembly {
			if or(
				gt(dynamicBorrowFeeBips, MaxUint16),
				or(
					gt(staticBorrowFee, MaxUint24),
					or(gt(satoshiPerEth, MaxUint40), or(gt(gweiPerGas, MaxUint16), gt(lastUpdateTimestamp, MaxUint32)))
				)
			) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			encoded := or(
				shl(GlobalFees_dynamicBorrowFeeBips_bitsAfter, dynamicBorrowFeeBips),
				or(
					shl(GlobalFees_staticBorrowFee_bitsAfter, staticBorrowFee),
					or(
						shl(GlobalFees_satoshiPerEth_bitsAfter, satoshiPerEth),
						or(
							shl(GlobalFees_gweiPerGas_bitsAfter, gweiPerGas),
							shl(GlobalFees_lastUpdateTimestamp_bitsAfter, lastUpdateTimestamp)
						)
					)
				)
			)
		}
	}

	/*//////////////////////////////////////////////////////////////
             GlobalFees.dynamicBorrowFeeBips coders
//////////////////////////////////////////////////////////////*/

	function getDynamicBorrowFeeBips(GlobalFees encoded) internal pure returns (uint256 dynamicBorrowFeeBips) {
		assembly {
			dynamicBorrowFeeBips := shr(GlobalFees_dynamicBorrowFeeBips_bitsAfter, encoded)
		}
	}

	function setDynamicBorrowFeeBips(GlobalFees old, uint256 dynamicBorrowFeeBips)
		internal
		pure
		returns (GlobalFees updated)
	{
		assembly {
			if gt(dynamicBorrowFeeBips, MaxUint16) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(
				and(old, GlobalFees_dynamicBorrowFeeBips_maskOut),
				shl(GlobalFees_dynamicBorrowFeeBips_bitsAfter, dynamicBorrowFeeBips)
			)
		}
	}

	/*//////////////////////////////////////////////////////////////
                GlobalFees.staticBorrowFee coders
//////////////////////////////////////////////////////////////*/

	function getStaticBorrowFee(GlobalFees encoded) internal pure returns (uint256 staticBorrowFee) {
		assembly {
			staticBorrowFee := and(MaxUint24, shr(GlobalFees_staticBorrowFee_bitsAfter, encoded))
		}
	}

	function setStaticBorrowFee(GlobalFees old, uint256 staticBorrowFee) internal pure returns (GlobalFees updated) {
		assembly {
			if gt(staticBorrowFee, MaxUint24) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(
				and(old, GlobalFees_staticBorrowFee_maskOut),
				shl(GlobalFees_staticBorrowFee_bitsAfter, staticBorrowFee)
			)
		}
	}

	/*//////////////////////////////////////////////////////////////
                 GlobalFees.satoshiPerEth coders
//////////////////////////////////////////////////////////////*/

	function getSatoshiPerEth(GlobalFees encoded) internal pure returns (uint256 satoshiPerEth) {
		assembly {
			satoshiPerEth := and(MaxUint40, shr(GlobalFees_satoshiPerEth_bitsAfter, encoded))
		}
	}

	function setSatoshiPerEth(GlobalFees old, uint256 satoshiPerEth) internal pure returns (GlobalFees updated) {
		assembly {
			if gt(satoshiPerEth, MaxUint40) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(and(old, GlobalFees_satoshiPerEth_maskOut), shl(GlobalFees_satoshiPerEth_bitsAfter, satoshiPerEth))
		}
	}

	/*//////////////////////////////////////////////////////////////
                  GlobalFees.gweiPerGas coders
//////////////////////////////////////////////////////////////*/

	function getGweiPerGas(GlobalFees encoded) internal pure returns (uint256 gweiPerGas) {
		assembly {
			gweiPerGas := and(MaxUint16, shr(GlobalFees_gweiPerGas_bitsAfter, encoded))
		}
	}

	function setGweiPerGas(GlobalFees old, uint256 gweiPerGas) internal pure returns (GlobalFees updated) {
		assembly {
			if gt(gweiPerGas, MaxUint16) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(and(old, GlobalFees_gweiPerGas_maskOut), shl(GlobalFees_gweiPerGas_bitsAfter, gweiPerGas))
		}
	}

	/*//////////////////////////////////////////////////////////////
              GlobalFees.lastUpdateTimestamp coders
//////////////////////////////////////////////////////////////*/

	function getLastUpdateTimestamp(GlobalFees encoded) internal pure returns (uint256 lastUpdateTimestamp) {
		assembly {
			lastUpdateTimestamp := and(MaxUint32, shr(GlobalFees_lastUpdateTimestamp_bitsAfter, encoded))
		}
	}

	function setLastUpdateTimestamp(GlobalFees old, uint256 lastUpdateTimestamp)
		internal
		pure
		returns (GlobalFees updated)
	{
		assembly {
			if gt(lastUpdateTimestamp, MaxUint32) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(
				and(old, GlobalFees_lastUpdateTimestamp_maskOut),
				shl(GlobalFees_lastUpdateTimestamp_bitsAfter, lastUpdateTimestamp)
			)
		}
	}

	/*//////////////////////////////////////////////////////////////
                     GlobalFees Cached Group
//////////////////////////////////////////////////////////////*/

	function setCached(
		GlobalFees old,
		uint256 satoshiPerEth,
		uint256 gweiPerGas,
		uint256 lastUpdateTimestamp
	) internal pure returns (GlobalFees updated) {
		assembly {
			if or(gt(satoshiPerEth, MaxUint40), or(gt(gweiPerGas, MaxUint16), gt(lastUpdateTimestamp, MaxUint32))) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(
				and(old, GlobalFees_Cached_maskOut),
				or(
					shl(GlobalFees_satoshiPerEth_bitsAfter, satoshiPerEth),
					or(
						shl(GlobalFees_gweiPerGas_bitsAfter, gweiPerGas),
						shl(GlobalFees_lastUpdateTimestamp_bitsAfter, lastUpdateTimestamp)
					)
				)
			)
		}
	}

	function getCached(GlobalFees encoded)
		internal
		pure
		returns (
			uint256 satoshiPerEth,
			uint256 gweiPerGas,
			uint256 lastUpdateTimestamp
		)
	{
		assembly {
			satoshiPerEth := and(MaxUint40, shr(GlobalFees_satoshiPerEth_bitsAfter, encoded))
			gweiPerGas := and(MaxUint16, shr(GlobalFees_gweiPerGas_bitsAfter, encoded))
			lastUpdateTimestamp := and(MaxUint32, shr(GlobalFees_lastUpdateTimestamp_bitsAfter, encoded))
		}
	}

	/*//////////////////////////////////////////////////////////////
              GlobalFees ParamsForModuleFees Group
//////////////////////////////////////////////////////////////*/

	function setParamsForModuleFees(
		GlobalFees old,
		uint256 staticBorrowFee,
		uint256 satoshiPerEth,
		uint256 gweiPerGas
	) internal pure returns (GlobalFees updated) {
		assembly {
			if or(gt(staticBorrowFee, MaxUint24), or(gt(satoshiPerEth, MaxUint40), gt(gweiPerGas, MaxUint16))) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(
				and(old, GlobalFees_ParamsForModuleFees_maskOut),
				or(
					shl(GlobalFees_staticBorrowFee_bitsAfter, staticBorrowFee),
					or(shl(GlobalFees_satoshiPerEth_bitsAfter, satoshiPerEth), shl(GlobalFees_gweiPerGas_bitsAfter, gweiPerGas))
				)
			)
		}
	}

	function getParamsForModuleFees(GlobalFees encoded)
		internal
		pure
		returns (
			uint256 staticBorrowFee,
			uint256 satoshiPerEth,
			uint256 gweiPerGas
		)
	{
		assembly {
			staticBorrowFee := and(MaxUint24, shr(GlobalFees_staticBorrowFee_bitsAfter, encoded))
			satoshiPerEth := and(MaxUint40, shr(GlobalFees_satoshiPerEth_bitsAfter, encoded))
			gweiPerGas := and(MaxUint16, shr(GlobalFees_gweiPerGas_bitsAfter, encoded))
		}
	}

	/*//////////////////////////////////////////////////////////////
                     GlobalFees Config Group
//////////////////////////////////////////////////////////////*/

	function setConfig(
		GlobalFees old,
		uint256 dynamicBorrowFeeBips,
		uint256 staticBorrowFee
	) internal pure returns (GlobalFees updated) {
		assembly {
			if or(gt(dynamicBorrowFeeBips, MaxUint16), gt(staticBorrowFee, MaxUint24)) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(
				and(old, GlobalFees_Config_maskOut),
				or(
					shl(GlobalFees_dynamicBorrowFeeBips_bitsAfter, dynamicBorrowFeeBips),
					shl(GlobalFees_staticBorrowFee_bitsAfter, staticBorrowFee)
				)
			)
		}
	}

	function getConfig(GlobalFees encoded) internal pure returns (uint256 dynamicBorrowFeeBips, uint256 staticBorrowFee) {
		assembly {
			dynamicBorrowFeeBips := shr(GlobalFees_dynamicBorrowFeeBips_bitsAfter, encoded)
			staticBorrowFee := and(MaxUint24, shr(GlobalFees_staticBorrowFee_bitsAfter, encoded))
		}
	}
}
