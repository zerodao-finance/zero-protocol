// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import './CoderConstants.sol';

// ============================== NOTICE ==============================
// This library was automatically generated with stackpacker.
// Be very careful about modifying it, as doing so incorrectly could
// result in corrupted reads/writes.
// ====================================================================

// struct LoanRecord {
//   address lender;
//   uint48 sharesLocked;
//   uint48 loanAmount;
// }
type LoanRecord is uint256;

library LoanRecordCoder {
	function decode(LoanRecord encoded)
		internal
		pure
		returns (
			address lender,
			uint256 sharesLocked,
			uint256 loanAmount
		)
	{
		assembly {
			lender := shr(LoanRecord_lender_bitsAfter, encoded)
			sharesLocked := and(MaxUint48, shr(LoanRecord_sharesLocked_bitsAfter, encoded))
			loanAmount := and(MaxUint48, encoded)
		}
	}

	function encode(
		address lender,
		uint256 sharesLocked,
		uint256 loanAmount
	) internal pure returns (LoanRecord encoded) {
		assembly {
			if or(gt(sharesLocked, MaxUint48), gt(loanAmount, MaxUint48)) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			encoded := or(
				shl(LoanRecord_lender_bitsAfter, lender),
				or(shl(LoanRecord_sharesLocked_bitsAfter, sharesLocked), loanAmount)
			)
		}
	}

	/*//////////////////////////////////////////////////////////////
                    LoanRecord.lender coders
//////////////////////////////////////////////////////////////*/

	function getLender(LoanRecord encoded) internal pure returns (address lender) {
		assembly {
			lender := shr(LoanRecord_lender_bitsAfter, encoded)
		}
	}

	function setLender(LoanRecord old, address lender) internal pure returns (LoanRecord updated) {
		assembly {
			updated := or(and(old, LoanRecord_lender_maskOut), shl(LoanRecord_lender_bitsAfter, lender))
		}
	}

	/*//////////////////////////////////////////////////////////////
                 LoanRecord.sharesLocked coders
//////////////////////////////////////////////////////////////*/

	function getSharesLocked(LoanRecord encoded) internal pure returns (uint256 sharesLocked) {
		assembly {
			sharesLocked := and(MaxUint48, shr(LoanRecord_sharesLocked_bitsAfter, encoded))
		}
	}

	function setSharesLocked(LoanRecord old, uint256 sharesLocked) internal pure returns (LoanRecord updated) {
		assembly {
			if gt(sharesLocked, MaxUint48) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(and(old, LoanRecord_sharesLocked_maskOut), shl(LoanRecord_sharesLocked_bitsAfter, sharesLocked))
		}
	}

	/*//////////////////////////////////////////////////////////////
                  LoanRecord.loanAmount coders
//////////////////////////////////////////////////////////////*/

	function getLoanAmount(LoanRecord encoded) internal pure returns (uint256 loanAmount) {
		assembly {
			loanAmount := and(MaxUint48, encoded)
		}
	}

	function setLoanAmount(LoanRecord old, uint256 loanAmount) internal pure returns (LoanRecord updated) {
		assembly {
			if gt(loanAmount, MaxUint48) {
				mstore(0, Panic_error_signature)
				mstore(Panic_error_offset, Panic_arithmetic)
				revert(0, Panic_error_length)
			}
			updated := or(and(old, LoanRecord_loanAmount_maskOut), loanAmount)
		}
	}
}
