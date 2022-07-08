// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// ============================== NOTICE ==============================
// This library was automatically generated with stackpacker.
// Be very careful about modifying it, as doing so incorrectly could
// result in corrupted reads/writes.
// ====================================================================

uint256 constant GlobalFees_Cached_maskOut = 0xffffffffff0000000000000000000000ffffffffffffffffffffffffffffffff;
uint256 constant GlobalFees_Config_maskOut = 0x0000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffff;
uint256 constant GlobalFees_ParamsForModuleFees_maskOut = 0xffff00000000000000000000ffffffffffffffffffffffffffffffffffffffff;
uint256 constant GlobalFees_dynamicBorrowFeeBips_bitsAfter = 0xf0;
uint256 constant GlobalFees_dynamicBorrowFeeBips_maskOut = 0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
uint256 constant GlobalFees_gweiPerGas_bitsAfter = 0xa0;
uint256 constant GlobalFees_gweiPerGas_maskOut = 0xffffffffffffffffffff0000ffffffffffffffffffffffffffffffffffffffff;
uint256 constant GlobalFees_lastUpdateTimestamp_bitsAfter = 0x80;
uint256 constant GlobalFees_lastUpdateTimestamp_maskOut = 0xffffffffffffffffffffffff00000000ffffffffffffffffffffffffffffffff;
uint256 constant GlobalFees_satoshiPerEth_bitsAfter = 0xb0;
uint256 constant GlobalFees_satoshiPerEth_maskOut = 0xffffffffff0000000000ffffffffffffffffffffffffffffffffffffffffffff;
uint256 constant GlobalFees_staticBorrowFee_bitsAfter = 0xd8;
uint256 constant GlobalFees_staticBorrowFee_maskOut = 0xffff000000ffffffffffffffffffffffffffffffffffffffffffffffffffffff;
uint256 constant LoanRecord_lender_bitsAfter = 0x60;
uint256 constant LoanRecord_lender_maskOut = 0x0000000000000000000000000000000000000000ffffffffffffffffffffffff;
uint256 constant LoanRecord_loanAmount_maskOut = 0xffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000;
uint256 constant LoanRecord_sharesLocked_bitsAfter = 0x30;
uint256 constant LoanRecord_sharesLocked_maskOut = 0xffffffffffffffffffffffffffffffffffffffff000000000000ffffffffffff;
uint256 constant MaxUint16 = 0xffff;
uint256 constant MaxUint160 = 0xffffffffffffffffffffffffffffffffffffffff;
uint256 constant MaxUint24 = 0xffffff;
uint256 constant MaxUint32 = 0xffffffff;
uint256 constant MaxUint40 = 0xffffffffff;
uint256 constant MaxUint48 = 0xffffffffffff;
uint256 constant MaxUint64 = 0xffffffffffffffff;
uint256 constant MaxUint8 = 0xff;
uint256 constant ModuleFees_Cached_maskOut = 0xffffff0000000000000000000000000000000000000000000000ffffffffffff;
uint256 constant ModuleFees_Config_maskOut = 0xff0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
uint256 constant ModuleFees_GasParams_maskOut = 0xff0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
uint256 constant ModuleFees_LoanParams_maskOut = 0x00ffff0000000000000000ffffffffffffffff000000ffffffffffffffffffff;
uint256 constant ModuleFees_RepayParams_maskOut = 0x00ffffffffffffffffffff0000000000000000ffffffffffffffffffffffffff;
uint256 constant ModuleFees_lastUpdateTimestamp_bitsAfter = 0x30;
uint256 constant ModuleFees_lastUpdateTimestamp_maskOut = 0xffffffffffffffffffffffffffffffffffffffffffff00000000ffffffffffff;
uint256 constant ModuleFees_loanGasE4_bitsAfter = 0xf0;
uint256 constant ModuleFees_loanGasE4_maskOut = 0xff00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
uint256 constant ModuleFees_loanRefundEth_bitsAfter = 0xa8;
uint256 constant ModuleFees_loanRefundEth_maskOut = 0xffffff0000000000000000ffffffffffffffffffffffffffffffffffffffffff;
uint256 constant ModuleFees_moduleType_bitsAfter = 0xf8;
uint256 constant ModuleFees_moduleType_maskOut = 0x00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
uint256 constant ModuleFees_repayGasE4_bitsAfter = 0xe8;
uint256 constant ModuleFees_repayGasE4_maskOut = 0xffff00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
uint256 constant ModuleFees_repayRefundEth_bitsAfter = 0x68;
uint256 constant ModuleFees_repayRefundEth_maskOut = 0xffffffffffffffffffffff0000000000000000ffffffffffffffffffffffffff;
uint256 constant ModuleFees_staticBorrowFee_bitsAfter = 0x50;
uint256 constant ModuleFees_staticBorrowFee_maskOut = 0xffffffffffffffffffffffffffffffffffffff000000ffffffffffffffffffff;
uint256 constant Panic_arithmetic = 0x11;
uint256 constant Panic_error_length = 0x24;
uint256 constant Panic_error_offset = 0x04;
uint256 constant Panic_error_signature = 0x4e487b7100000000000000000000000000000000000000000000000000000000;