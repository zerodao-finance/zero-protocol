// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './CoderConstants.sol';

// ============================== NOTICE ==============================
// This library was automatically generated with stackpacker.
// Be very careful about modifying it, as doing so incorrectly could
// result in corrupted reads/writes.
// ====================================================================

// struct ModuleFees {
//   ModuleType moduleType;
//   uint8 loanGasE4;
//   uint8 repayGasE4;
//   uint64 loanRefundEth;
//   uint64 repayRefundEth;
//   uint24 staticBorrowFee;
//   uint32 lastUpdateTimestamp;
// }
type ModuleFees is uint256;

library ModuleFeesCoder {
	function decode(ModuleFees encoded)
		internal
		pure
		returns (
			ModuleType moduleType,
			uint256 loanGasE4,
			uint256 repayGasE4,
			uint256 loanRefundEth,
			uint256 repayRefundEth,
			uint256 staticBorrowFee,
			uint256 lastUpdateTimestamp
		)
	{
		assembly {
			moduleType := shr(ModuleFees_moduleType_bitsAfter, encoded)
			loanGasE4 := and(MaxUint8, shr(ModuleFees_loanGasE4_bitsAfter, encoded))
			repayGasE4 := and(MaxUint8, shr(ModuleFees_repayGasE4_bitsAfter, encoded))
			loanRefundEth := and(MaxUint64, shr(ModuleFees_loanRefundEth_bitsAfter, encoded))
			repayRefundEth := and(MaxUint64, shr(ModuleFees_repayRefundEth_bitsAfter, encoded))
			staticBorrowFee := and(MaxUint24, shr(ModuleFees_staticBorrowFee_bitsAfter, encoded))
			lastUpdateTimestamp := and(MaxUint32, shr(ModuleFees_lastUpdateTimestamp_bitsAfter, encoded))
		}
	}

	function encode(
		ModuleType moduleType,
		uint256 loanGasE4,
		uint256 repayGasE4,
		uint256 loanRefundEth,
		uint256 repayRefundEth,
		uint256 staticBorrowFee,
		uint256 lastUpdateTimestamp
	) internal pure returns (ModuleFees encoded) {
		assembly {
			if or(
				gt(loanGasE4, MaxUint8),
				or(
					gt(repayGasE4, MaxUint8),
					or(
						gt(loanRefundEth, MaxUint64),
						or(gt(repayRefundEth, MaxUint64), or(gt(staticBorrowFee, MaxUint24), gt(lastUpdateTimestamp, MaxUint32)))
					)
				)
			) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			encoded := or(
				shl(ModuleFees_moduleType_bitsAfter, moduleType),
				or(
					shl(ModuleFees_loanGasE4_bitsAfter, loanGasE4),
					or(
						shl(ModuleFees_repayGasE4_bitsAfter, repayGasE4),
						or(
							shl(ModuleFees_loanRefundEth_bitsAfter, loanRefundEth),
							or(
								shl(ModuleFees_repayRefundEth_bitsAfter, repayRefundEth),
								or(
									shl(ModuleFees_staticBorrowFee_bitsAfter, staticBorrowFee),
									shl(ModuleFees_lastUpdateTimestamp_bitsAfter, lastUpdateTimestamp)
								)
							)
						)
					)
				)
			)
		}
	}

	/*//////////////////////////////////////////////////////////////
                  ModuleFees.moduleType coders
//////////////////////////////////////////////////////////////*/

	function getModuleType(ModuleFees encoded) internal pure returns (ModuleType moduleType) {
		assembly {
			moduleType := shr(ModuleFees_moduleType_bitsAfter, encoded)
		}
	}

	function setModuleType(ModuleFees old, ModuleType moduleType) internal pure returns (ModuleFees updated) {
		assembly {
			updated := or(and(old, ModuleFees_moduleType_maskOut), shl(ModuleFees_moduleType_bitsAfter, moduleType))
		}
	}

	/*//////////////////////////////////////////////////////////////
                   ModuleFees.loanGasE4 coders
//////////////////////////////////////////////////////////////*/

	function getLoanGasE4(ModuleFees encoded) internal pure returns (uint256 loanGasE4) {
		assembly {
			loanGasE4 := and(MaxUint8, shr(ModuleFees_loanGasE4_bitsAfter, encoded))
		}
	}

	function setLoanGasE4(ModuleFees old, uint256 loanGasE4) internal pure returns (ModuleFees updated) {
		assembly {
			if gt(loanGasE4, MaxUint8) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(and(old, ModuleFees_loanGasE4_maskOut), shl(ModuleFees_loanGasE4_bitsAfter, loanGasE4))
		}
	}

	/*//////////////////////////////////////////////////////////////
                  ModuleFees.repayGasE4 coders
//////////////////////////////////////////////////////////////*/

	function getRepayGasE4(ModuleFees encoded) internal pure returns (uint256 repayGasE4) {
		assembly {
			repayGasE4 := and(MaxUint8, shr(ModuleFees_repayGasE4_bitsAfter, encoded))
		}
	}

	function setRepayGasE4(ModuleFees old, uint256 repayGasE4) internal pure returns (ModuleFees updated) {
		assembly {
			if gt(repayGasE4, MaxUint8) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(and(old, ModuleFees_repayGasE4_maskOut), shl(ModuleFees_repayGasE4_bitsAfter, repayGasE4))
		}
	}

	/*//////////////////////////////////////////////////////////////
                 ModuleFees.loanRefundEth coders
//////////////////////////////////////////////////////////////*/

	function getLoanRefundEth(ModuleFees encoded) internal pure returns (uint256 loanRefundEth) {
		assembly {
			loanRefundEth := and(MaxUint64, shr(ModuleFees_loanRefundEth_bitsAfter, encoded))
		}
	}

	function setLoanRefundEth(ModuleFees old, uint256 loanRefundEth) internal pure returns (ModuleFees updated) {
		assembly {
			if gt(loanRefundEth, MaxUint64) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(and(old, ModuleFees_loanRefundEth_maskOut), shl(ModuleFees_loanRefundEth_bitsAfter, loanRefundEth))
		}
	}

	/*//////////////////////////////////////////////////////////////
                ModuleFees.repayRefundEth coders
//////////////////////////////////////////////////////////////*/

	function getRepayRefundEth(ModuleFees encoded) internal pure returns (uint256 repayRefundEth) {
		assembly {
			repayRefundEth := and(MaxUint64, shr(ModuleFees_repayRefundEth_bitsAfter, encoded))
		}
	}

	function setRepayRefundEth(ModuleFees old, uint256 repayRefundEth) internal pure returns (ModuleFees updated) {
		assembly {
			if gt(repayRefundEth, MaxUint64) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(
				and(old, ModuleFees_repayRefundEth_maskOut),
				shl(ModuleFees_repayRefundEth_bitsAfter, repayRefundEth)
			)
		}
	}

	/*//////////////////////////////////////////////////////////////
                ModuleFees.staticBorrowFee coders
//////////////////////////////////////////////////////////////*/

	function getStaticBorrowFee(ModuleFees encoded) internal pure returns (uint256 staticBorrowFee) {
		assembly {
			staticBorrowFee := and(MaxUint24, shr(ModuleFees_staticBorrowFee_bitsAfter, encoded))
		}
	}

	function setStaticBorrowFee(ModuleFees old, uint256 staticBorrowFee) internal pure returns (ModuleFees updated) {
		assembly {
			if gt(staticBorrowFee, MaxUint24) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(
				and(old, ModuleFees_staticBorrowFee_maskOut),
				shl(ModuleFees_staticBorrowFee_bitsAfter, staticBorrowFee)
			)
		}
	}

	/*//////////////////////////////////////////////////////////////
              ModuleFees.lastUpdateTimestamp coders
//////////////////////////////////////////////////////////////*/

	function getLastUpdateTimestamp(ModuleFees encoded) internal pure returns (uint256 lastUpdateTimestamp) {
		assembly {
			lastUpdateTimestamp := and(MaxUint32, shr(ModuleFees_lastUpdateTimestamp_bitsAfter, encoded))
		}
	}

	function setLastUpdateTimestamp(ModuleFees old, uint256 lastUpdateTimestamp)
		internal
		pure
		returns (ModuleFees updated)
	{
		assembly {
			if gt(lastUpdateTimestamp, MaxUint32) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(
				and(old, ModuleFees_lastUpdateTimestamp_maskOut),
				shl(ModuleFees_lastUpdateTimestamp_bitsAfter, lastUpdateTimestamp)
			)
		}
	}

	/*//////////////////////////////////////////////////////////////
                   ModuleFees LoanParams Group
//////////////////////////////////////////////////////////////*/

	function setLoanParams(
		ModuleFees old,
		ModuleType moduleType,
		uint256 loanRefundEth,
		uint256 staticBorrowFee
	) internal pure returns (ModuleFees updated) {
		assembly {
			if or(gt(loanRefundEth, MaxUint64), gt(staticBorrowFee, MaxUint24)) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(
				and(old, ModuleFees_LoanParams_maskOut),
				or(
					shl(ModuleFees_moduleType_bitsAfter, moduleType),
					or(
						shl(ModuleFees_loanRefundEth_bitsAfter, loanRefundEth),
						shl(ModuleFees_staticBorrowFee_bitsAfter, staticBorrowFee)
					)
				)
			)
		}
	}

	function getLoanParams(ModuleFees encoded)
		internal
		pure
		returns (
			ModuleType moduleType,
			uint256 loanRefundEth,
			uint256 staticBorrowFee
		)
	{
		assembly {
			moduleType := shr(ModuleFees_moduleType_bitsAfter, encoded)
			loanRefundEth := and(MaxUint64, shr(ModuleFees_loanRefundEth_bitsAfter, encoded))
			staticBorrowFee := and(MaxUint24, shr(ModuleFees_staticBorrowFee_bitsAfter, encoded))
		}
	}

	/*//////////////////////////////////////////////////////////////
                  ModuleFees RepayParams Group
//////////////////////////////////////////////////////////////*/

	function setRepayParams(
		ModuleFees old,
		ModuleType moduleType,
		uint256 repayRefundEth
	) internal pure returns (ModuleFees updated) {
		assembly {
			if gt(repayRefundEth, MaxUint64) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(
				and(old, ModuleFees_RepayParams_maskOut),
				or(shl(ModuleFees_moduleType_bitsAfter, moduleType), shl(ModuleFees_repayRefundEth_bitsAfter, repayRefundEth))
			)
		}
	}

	function getRepayParams(ModuleFees encoded) internal pure returns (ModuleType moduleType, uint256 repayRefundEth) {
		assembly {
			moduleType := shr(ModuleFees_moduleType_bitsAfter, encoded)
			repayRefundEth := and(MaxUint64, shr(ModuleFees_repayRefundEth_bitsAfter, encoded))
		}
	}

	/*//////////////////////////////////////////////////////////////
                     ModuleFees Cached Group
//////////////////////////////////////////////////////////////*/

	function setCached(
		ModuleFees old,
		uint256 loanRefundEth,
		uint256 repayRefundEth,
		uint256 staticBorrowFee,
		uint256 lastUpdateTimestamp
	) internal pure returns (ModuleFees updated) {
		assembly {
			if or(
				gt(loanRefundEth, MaxUint64),
				or(gt(repayRefundEth, MaxUint64), or(gt(staticBorrowFee, MaxUint24), gt(lastUpdateTimestamp, MaxUint32)))
			) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(
				and(old, ModuleFees_Cached_maskOut),
				or(
					shl(ModuleFees_loanRefundEth_bitsAfter, loanRefundEth),
					or(
						shl(ModuleFees_repayRefundEth_bitsAfter, repayRefundEth),
						or(
							shl(ModuleFees_staticBorrowFee_bitsAfter, staticBorrowFee),
							shl(ModuleFees_lastUpdateTimestamp_bitsAfter, lastUpdateTimestamp)
						)
					)
				)
			)
		}
	}

	function getCached(ModuleFees encoded)
		internal
		pure
		returns (
			uint256 loanRefundEth,
			uint256 repayRefundEth,
			uint256 staticBorrowFee,
			uint256 lastUpdateTimestamp
		)
	{
		assembly {
			loanRefundEth := and(MaxUint64, shr(ModuleFees_loanRefundEth_bitsAfter, encoded))
			repayRefundEth := and(MaxUint64, shr(ModuleFees_repayRefundEth_bitsAfter, encoded))
			staticBorrowFee := and(MaxUint24, shr(ModuleFees_staticBorrowFee_bitsAfter, encoded))
			lastUpdateTimestamp := and(MaxUint32, shr(ModuleFees_lastUpdateTimestamp_bitsAfter, encoded))
		}
	}

	/*//////////////////////////////////////////////////////////////
                     ModuleFees Config Group
//////////////////////////////////////////////////////////////*/

	function setConfig(
		ModuleFees old,
		uint256 loanGasE4,
		uint256 repayGasE4
	) internal pure returns (ModuleFees updated) {
		assembly {
			if or(gt(loanGasE4, MaxUint8), gt(repayGasE4, MaxUint8)) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(
				and(old, ModuleFees_Config_maskOut),
				or(shl(ModuleFees_loanGasE4_bitsAfter, loanGasE4), shl(ModuleFees_repayGasE4_bitsAfter, repayGasE4))
			)
		}
	}

	function getConfig(ModuleFees encoded) internal pure returns (uint256 loanGasE4, uint256 repayGasE4) {
		assembly {
			loanGasE4 := and(MaxUint8, shr(ModuleFees_loanGasE4_bitsAfter, encoded))
			repayGasE4 := and(MaxUint8, shr(ModuleFees_repayGasE4_bitsAfter, encoded))
		}
	}

	/*//////////////////////////////////////////////////////////////
                   ModuleFees GasParams Group
//////////////////////////////////////////////////////////////*/

	function setGasParams(
		ModuleFees old,
		uint256 loanGasE4,
		uint256 repayGasE4
	) internal pure returns (ModuleFees updated) {
		assembly {
			if or(gt(loanGasE4, MaxUint8), gt(repayGasE4, MaxUint8)) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(
				and(old, ModuleFees_GasParams_maskOut),
				or(shl(ModuleFees_loanGasE4_bitsAfter, loanGasE4), shl(ModuleFees_repayGasE4_bitsAfter, repayGasE4))
			)
		}
	}

	function getGasParams(ModuleFees encoded) internal pure returns (uint256 loanGasE4, uint256 repayGasE4) {
		assembly {
			loanGasE4 := and(MaxUint8, shr(ModuleFees_loanGasE4_bitsAfter, encoded))
			repayGasE4 := and(MaxUint8, shr(ModuleFees_repayGasE4_bitsAfter, encoded))
		}
	}
}

enum ModuleType {
	Null,
	LoanOverride,
	LoanAndRepayOverride
}
