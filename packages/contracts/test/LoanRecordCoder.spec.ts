import { ethers } from 'hardhat';
import { expect } from "chai";

describe('LoanRecordCoder.sol', () => {
	let externalLoanRecord: any;

	before(async () => {
		const Factory = await ethers.getContractFactory('ExternalLoanRecordCoder');
		externalLoanRecord = await Factory.deploy();
	})

	describe('decode', () => {
		it('Should be able to get min/max values', async () => {
			await externalLoanRecord.encode("0xffffffffffff", "0x00", "0xffffffffffff", "0x00", "0xffffffff");
			const { sharesLocked, actualBorrowAmount, lenderDebt, btcFeeForLoanGas, expiry } = await externalLoanRecord.decode()
			expect(sharesLocked).to.eq("0xffffffffffff");
			expect(actualBorrowAmount).to.eq("0x00");
			expect(lenderDebt).to.eq("0xffffffffffff");
			expect(btcFeeForLoanGas).to.eq("0x00");
			expect(expiry).to.eq("0xffffffff");
		});

		it('Should be able to get max/min values', async () => {
			await externalLoanRecord.encode("0x00", "0xffffffffffff", "0x00", "0xffffffffffff", "0x00");
			const { sharesLocked, actualBorrowAmount, lenderDebt, btcFeeForLoanGas, expiry } = await externalLoanRecord.decode()
			expect(sharesLocked).to.eq("0x00");
			expect(actualBorrowAmount).to.eq("0xffffffffffff");
			expect(lenderDebt).to.eq("0x00");
			expect(btcFeeForLoanGas).to.eq("0xffffffffffff");
			expect(expiry).to.eq("0x00");
		});
	})

	describe('encode', () => {
		it('Reverts when sharesLocked overflows', async () => {
			await expect(
			externalLoanRecord.encode("0x01ffffffffffff", "0x00", "0x00", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when actualBorrowAmount overflows', async () => {
			await expect(
			externalLoanRecord.encode("0x00", "0x01ffffffffffff", "0x00", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when lenderDebt overflows', async () => {
			await expect(
			externalLoanRecord.encode("0x00", "0x00", "0x01ffffffffffff", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when btcFeeForLoanGas overflows', async () => {
			await expect(
			externalLoanRecord.encode("0x00", "0x00", "0x00", "0x01ffffffffffff", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when expiry overflows', async () => {
			await expect(
			externalLoanRecord.encode("0x00", "0x00", "0x00", "0x00", "0x01ffffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min/max values', async () => {
			externalLoanRecord.encode("0xffffffffffff", "0x00", "0xffffffffffff", "0x00", "0xffffffff")
			const { sharesLocked, actualBorrowAmount, lenderDebt, btcFeeForLoanGas, expiry } = await externalLoanRecord.decode();
			expect(sharesLocked).to.eq("0xffffffffffff");
			expect(actualBorrowAmount).to.eq("0x00");
			expect(lenderDebt).to.eq("0xffffffffffff");
			expect(btcFeeForLoanGas).to.eq("0x00");
			expect(expiry).to.eq("0xffffffff");
		});

		it('Should be able to set max/min values', async () => {
			externalLoanRecord.encode("0x00", "0xffffffffffff", "0x00", "0xffffffffffff", "0x00")
			const { sharesLocked, actualBorrowAmount, lenderDebt, btcFeeForLoanGas, expiry } = await externalLoanRecord.decode();
			expect(sharesLocked).to.eq("0x00");
			expect(actualBorrowAmount).to.eq("0xffffffffffff");
			expect(lenderDebt).to.eq("0x00");
			expect(btcFeeForLoanGas).to.eq("0xffffffffffff");
			expect(expiry).to.eq("0x00");
		});
	})

	describe('getSharesAndDebt', () => {
		it('Should be able to get min/max values', async () => {
			await externalLoanRecord.encode("0xffffffffffff", "0x00", "0x00", "0x00", "0x00");
			const { sharesLocked, lenderDebt } = await externalLoanRecord.getSharesAndDebt()
			expect(sharesLocked).to.eq("0xffffffffffff");
			expect(lenderDebt).to.eq("0x00");
		});

		it('Should be able to get max/min values', async () => {
			await externalLoanRecord.encode("0x00", "0xffffffffffff", "0xffffffffffff", "0xffffffffffff", "0xffffffff");
			const { sharesLocked, lenderDebt } = await externalLoanRecord.getSharesAndDebt()
			expect(sharesLocked).to.eq("0x00");
			expect(lenderDebt).to.eq("0xffffffffffff");
		});
	})

	describe('getActualBorrowAmount', () => {
		it('Should be able to get min value', async () => {
			await externalLoanRecord.encode("0x00", "0xffffffffffff", "0x00", "0x00", "0x00");
			const actualBorrowAmount = await externalLoanRecord.getActualBorrowAmount()
			expect(actualBorrowAmount).to.eq("0xffffffffffff");
		});

		it('Should be able to get max value', async () => {
			await externalLoanRecord.encode("0xffffffffffff", "0x00", "0xffffffffffff", "0xffffffffffff", "0xffffffff");
			const actualBorrowAmount = await externalLoanRecord.getActualBorrowAmount()
			expect(actualBorrowAmount).to.eq("0x00");
		});
	})

	describe('getBtcFeeForLoanGas', () => {
		it('Should be able to get min value', async () => {
			await externalLoanRecord.encode("0x00", "0x00", "0x00", "0xffffffffffff", "0x00");
			const btcFeeForLoanGas = await externalLoanRecord.getBtcFeeForLoanGas()
			expect(btcFeeForLoanGas).to.eq("0xffffffffffff");
		});

		it('Should be able to get max value', async () => {
			await externalLoanRecord.encode("0xffffffffffff", "0xffffffffffff", "0xffffffffffff", "0x00", "0xffffffff");
			const btcFeeForLoanGas = await externalLoanRecord.getBtcFeeForLoanGas()
			expect(btcFeeForLoanGas).to.eq("0x00");
		});
	})

	describe('getExpiry', () => {
		it('Should be able to get min value', async () => {
			await externalLoanRecord.encode("0x00", "0x00", "0x00", "0x00", "0xffffffff");
			const expiry = await externalLoanRecord.getExpiry()
			expect(expiry).to.eq("0xffffffff");
		});

		it('Should be able to get max value', async () => {
			await externalLoanRecord.encode("0xffffffffffff", "0xffffffffffff", "0xffffffffffff", "0xffffffffffff", "0x00");
			const expiry = await externalLoanRecord.getExpiry()
			expect(expiry).to.eq("0x00");
		});
	})
})