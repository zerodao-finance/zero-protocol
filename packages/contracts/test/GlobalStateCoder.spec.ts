import { ethers } from 'hardhat';
import { expect } from "chai";

describe('GlobalStateCoder.sol', () => {
	let externalGlobalState: any;

	before(async () => {
		const Factory = await ethers.getContractFactory('ExternalGlobalStateCoder');
		externalGlobalState = await Factory.deploy();
	})

	describe('decode', () => {
		it('Should be able to get min/max values', async () => {
			await externalGlobalState.encode("0x07ff", "0x00", "0x1fff", "0x00", "0x7fffff", "0x00", "0xffff", "0x00", "0xffffffffff", "0x00", "0x0fffffff");
			const { zeroBorrowFeeBips, renBorrowFeeBips, zeroFeeShareBips, zeroBorrowFeeStatic, renBorrowFeeStatic, satoshiPerEth, gweiPerGas, lastUpdateTimestamp, totalBitcoinBorrowed, unburnedGasReserveShares, unburnedZeroFeeShares } = await externalGlobalState.decode()
			expect(zeroBorrowFeeBips).to.eq("0x07ff");
			expect(renBorrowFeeBips).to.eq("0x00");
			expect(zeroFeeShareBips).to.eq("0x1fff");
			expect(zeroBorrowFeeStatic).to.eq("0x00");
			expect(renBorrowFeeStatic).to.eq("0x7fffff");
			expect(satoshiPerEth).to.eq("0x00");
			expect(gweiPerGas).to.eq("0xffff");
			expect(lastUpdateTimestamp).to.eq("0x00");
			expect(totalBitcoinBorrowed).to.eq("0xffffffffff");
			expect(unburnedGasReserveShares).to.eq("0x00");
			expect(unburnedZeroFeeShares).to.eq("0x0fffffff");
		});

		it('Should be able to get max/min values', async () => {
			await externalGlobalState.encode("0x00", "0x07ff", "0x00", "0x7fffff", "0x00", "0x3fffffff", "0x00", "0xffffffff", "0x00", "0x0fffffff", "0x00");
			const { zeroBorrowFeeBips, renBorrowFeeBips, zeroFeeShareBips, zeroBorrowFeeStatic, renBorrowFeeStatic, satoshiPerEth, gweiPerGas, lastUpdateTimestamp, totalBitcoinBorrowed, unburnedGasReserveShares, unburnedZeroFeeShares } = await externalGlobalState.decode()
			expect(zeroBorrowFeeBips).to.eq("0x00");
			expect(renBorrowFeeBips).to.eq("0x07ff");
			expect(zeroFeeShareBips).to.eq("0x00");
			expect(zeroBorrowFeeStatic).to.eq("0x7fffff");
			expect(renBorrowFeeStatic).to.eq("0x00");
			expect(satoshiPerEth).to.eq("0x3fffffff");
			expect(gweiPerGas).to.eq("0x00");
			expect(lastUpdateTimestamp).to.eq("0xffffffff");
			expect(totalBitcoinBorrowed).to.eq("0x00");
			expect(unburnedGasReserveShares).to.eq("0x0fffffff");
			expect(unburnedZeroFeeShares).to.eq("0x00");
		});
	})

	describe('encode', () => {
		it('Reverts when zeroBorrowFeeStatic overflows', async () => {
			await expect(
			externalGlobalState.encode("0x00", "0x00", "0x00", "0xffffff", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when renBorrowFeeStatic overflows', async () => {
			await expect(
			externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0xffffff", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when satoshiPerEth overflows', async () => {
			await expect(
			externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x7fffffff", "0x00", "0x00", "0x00", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when gweiPerGas overflows', async () => {
			await expect(
			externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x01ffff", "0x00", "0x00", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when lastUpdateTimestamp overflows', async () => {
			await expect(
			externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x01ffffffff", "0x00", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when totalBitcoinBorrowed overflows', async () => {
			await expect(
			externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x01ffffffffff", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when unburnedGasReserveShares overflows', async () => {
			await expect(
			externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x1fffffff", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when unburnedZeroFeeShares overflows', async () => {
			await expect(
			externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x1fffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min/max values', async () => {
			externalGlobalState.encode("0x07ff", "0x00", "0x1fff", "0x00", "0x7fffff", "0x00", "0xffff", "0x00", "0xffffffffff", "0x00", "0x0fffffff")
			const { zeroBorrowFeeBips, renBorrowFeeBips, zeroFeeShareBips, zeroBorrowFeeStatic, renBorrowFeeStatic, satoshiPerEth, gweiPerGas, lastUpdateTimestamp, totalBitcoinBorrowed, unburnedGasReserveShares, unburnedZeroFeeShares } = await externalGlobalState.decode();
			expect(zeroBorrowFeeBips).to.eq("0x07ff");
			expect(renBorrowFeeBips).to.eq("0x00");
			expect(zeroFeeShareBips).to.eq("0x1fff");
			expect(zeroBorrowFeeStatic).to.eq("0x00");
			expect(renBorrowFeeStatic).to.eq("0x7fffff");
			expect(satoshiPerEth).to.eq("0x00");
			expect(gweiPerGas).to.eq("0xffff");
			expect(lastUpdateTimestamp).to.eq("0x00");
			expect(totalBitcoinBorrowed).to.eq("0xffffffffff");
			expect(unburnedGasReserveShares).to.eq("0x00");
			expect(unburnedZeroFeeShares).to.eq("0x0fffffff");
		});

		it('Should be able to set max/min values', async () => {
			externalGlobalState.encode("0x00", "0x07ff", "0x00", "0x7fffff", "0x00", "0x3fffffff", "0x00", "0xffffffff", "0x00", "0x0fffffff", "0x00")
			const { zeroBorrowFeeBips, renBorrowFeeBips, zeroFeeShareBips, zeroBorrowFeeStatic, renBorrowFeeStatic, satoshiPerEth, gweiPerGas, lastUpdateTimestamp, totalBitcoinBorrowed, unburnedGasReserveShares, unburnedZeroFeeShares } = await externalGlobalState.decode();
			expect(zeroBorrowFeeBips).to.eq("0x00");
			expect(renBorrowFeeBips).to.eq("0x07ff");
			expect(zeroFeeShareBips).to.eq("0x00");
			expect(zeroBorrowFeeStatic).to.eq("0x7fffff");
			expect(renBorrowFeeStatic).to.eq("0x00");
			expect(satoshiPerEth).to.eq("0x3fffffff");
			expect(gweiPerGas).to.eq("0x00");
			expect(lastUpdateTimestamp).to.eq("0xffffffff");
			expect(totalBitcoinBorrowed).to.eq("0x00");
			expect(unburnedGasReserveShares).to.eq("0x0fffffff");
			expect(unburnedZeroFeeShares).to.eq("0x00");
		});
	})

	describe('setLoanInfo', () => {
		it('Reverts when totalBitcoinBorrowed overflows', async () => {
			await expect(
			externalGlobalState.setLoanInfo("0x01ffffffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min value', async () => {
			externalGlobalState.setLoanInfo("0xffffffffff")
			const { totalBitcoinBorrowed } = await externalGlobalState.decode();
			expect(totalBitcoinBorrowed).to.eq("0xffffffffff");
		});

		it('Should be able to set max value', async () => {
			externalGlobalState.setLoanInfo("0x00")
			const { totalBitcoinBorrowed } = await externalGlobalState.decode();
			expect(totalBitcoinBorrowed).to.eq("0x00");
		});
	})

	describe('getLoanInfo', () => {
		it('Should be able to get min value', async () => {
			await externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0xffffffffff", "0x00", "0x00");
			const totalBitcoinBorrowed = await externalGlobalState.getLoanInfo()
			expect(totalBitcoinBorrowed).to.eq("0xffffffffff");
		});

		it('Should be able to get max value', async () => {
			await externalGlobalState.encode("0x07ff", "0x07ff", "0x1fff", "0x7fffff", "0x7fffff", "0x3fffffff", "0xffff", "0xffffffff", "0x00", "0x0fffffff", "0x0fffffff");
			const totalBitcoinBorrowed = await externalGlobalState.getLoanInfo()
			expect(totalBitcoinBorrowed).to.eq("0x00");
		});
	})

	describe('setFees', () => {
		it('Reverts when zeroBorrowFeeStatic overflows', async () => {
			await expect(
			externalGlobalState.setFees("0x00", "0x00", "0xffffff", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when renBorrowFeeStatic overflows', async () => {
			await expect(
			externalGlobalState.setFees("0x00", "0x00", "0x00", "0xffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min/max values', async () => {
			externalGlobalState.setFees("0x07ff", "0x00", "0x7fffff", "0x00")
			const { zeroBorrowFeeBips, renBorrowFeeBips, zeroBorrowFeeStatic, renBorrowFeeStatic } = await externalGlobalState.decode();
			expect(zeroBorrowFeeBips).to.eq("0x07ff");
			expect(renBorrowFeeBips).to.eq("0x00");
			expect(zeroBorrowFeeStatic).to.eq("0x7fffff");
			expect(renBorrowFeeStatic).to.eq("0x00");
		});

		it('Should be able to set max/min values', async () => {
			externalGlobalState.setFees("0x00", "0x07ff", "0x00", "0x7fffff")
			const { zeroBorrowFeeBips, renBorrowFeeBips, zeroBorrowFeeStatic, renBorrowFeeStatic } = await externalGlobalState.decode();
			expect(zeroBorrowFeeBips).to.eq("0x00");
			expect(renBorrowFeeBips).to.eq("0x07ff");
			expect(zeroBorrowFeeStatic).to.eq("0x00");
			expect(renBorrowFeeStatic).to.eq("0x7fffff");
		});
	})

	describe('getFees', () => {
		it('Should be able to get min/max values', async () => {
			await externalGlobalState.encode("0x07ff", "0x00", "0x00", "0x7fffff", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00");
			const { zeroBorrowFeeBips, renBorrowFeeBips, zeroBorrowFeeStatic, renBorrowFeeStatic } = await externalGlobalState.getFees()
			expect(zeroBorrowFeeBips).to.eq("0x07ff");
			expect(renBorrowFeeBips).to.eq("0x00");
			expect(zeroBorrowFeeStatic).to.eq("0x7fffff");
			expect(renBorrowFeeStatic).to.eq("0x00");
		});

		it('Should be able to get max/min values', async () => {
			await externalGlobalState.encode("0x00", "0x07ff", "0x1fff", "0x00", "0x7fffff", "0x3fffffff", "0xffff", "0xffffffff", "0xffffffffff", "0x0fffffff", "0x0fffffff");
			const { zeroBorrowFeeBips, renBorrowFeeBips, zeroBorrowFeeStatic, renBorrowFeeStatic } = await externalGlobalState.getFees()
			expect(zeroBorrowFeeBips).to.eq("0x00");
			expect(renBorrowFeeBips).to.eq("0x07ff");
			expect(zeroBorrowFeeStatic).to.eq("0x00");
			expect(renBorrowFeeStatic).to.eq("0x7fffff");
		});
	})

	describe('setCached', () => {
		it('Reverts when satoshiPerEth overflows', async () => {
			await expect(
			externalGlobalState.setCached("0x7fffffff", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when gweiPerGas overflows', async () => {
			await expect(
			externalGlobalState.setCached("0x00", "0x01ffff", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when lastUpdateTimestamp overflows', async () => {
			await expect(
			externalGlobalState.setCached("0x00", "0x00", "0x01ffffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min/max values', async () => {
			externalGlobalState.setCached("0x3fffffff", "0x00", "0xffffffff")
			const { satoshiPerEth, gweiPerGas, lastUpdateTimestamp } = await externalGlobalState.decode();
			expect(satoshiPerEth).to.eq("0x3fffffff");
			expect(gweiPerGas).to.eq("0x00");
			expect(lastUpdateTimestamp).to.eq("0xffffffff");
		});

		it('Should be able to set max/min values', async () => {
			externalGlobalState.setCached("0x00", "0xffff", "0x00")
			const { satoshiPerEth, gweiPerGas, lastUpdateTimestamp } = await externalGlobalState.decode();
			expect(satoshiPerEth).to.eq("0x00");
			expect(gweiPerGas).to.eq("0xffff");
			expect(lastUpdateTimestamp).to.eq("0x00");
		});
	})

	describe('setParamsForModuleFees', () => {
		it('Reverts when satoshiPerEth overflows', async () => {
			await expect(
			externalGlobalState.setParamsForModuleFees("0x7fffffff", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when gweiPerGas overflows', async () => {
			await expect(
			externalGlobalState.setParamsForModuleFees("0x00", "0x01ffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min/max values', async () => {
			externalGlobalState.setParamsForModuleFees("0x3fffffff", "0x00")
			const { satoshiPerEth, gweiPerGas } = await externalGlobalState.decode();
			expect(satoshiPerEth).to.eq("0x3fffffff");
			expect(gweiPerGas).to.eq("0x00");
		});

		it('Should be able to set max/min values', async () => {
			externalGlobalState.setParamsForModuleFees("0x00", "0xffff")
			const { satoshiPerEth, gweiPerGas } = await externalGlobalState.decode();
			expect(satoshiPerEth).to.eq("0x00");
			expect(gweiPerGas).to.eq("0xffff");
		});
	})

	describe('getParamsForModuleFees', () => {
		it('Should be able to get min/max values', async () => {
			await externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x3fffffff", "0x00", "0x00", "0x00", "0x00", "0x00");
			const { satoshiPerEth, gweiPerGas } = await externalGlobalState.getParamsForModuleFees()
			expect(satoshiPerEth).to.eq("0x3fffffff");
			expect(gweiPerGas).to.eq("0x00");
		});

		it('Should be able to get max/min values', async () => {
			await externalGlobalState.encode("0x07ff", "0x07ff", "0x1fff", "0x7fffff", "0x7fffff", "0x00", "0xffff", "0xffffffff", "0xffffffffff", "0x0fffffff", "0x0fffffff");
			const { satoshiPerEth, gweiPerGas } = await externalGlobalState.getParamsForModuleFees()
			expect(satoshiPerEth).to.eq("0x00");
			expect(gweiPerGas).to.eq("0xffff");
		});
	})

	describe('setUnburnedShares', () => {
		it('Reverts when unburnedGasReserveShares overflows', async () => {
			await expect(
			externalGlobalState.setUnburnedShares("0x1fffffff", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when unburnedZeroFeeShares overflows', async () => {
			await expect(
			externalGlobalState.setUnburnedShares("0x00", "0x1fffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min/max values', async () => {
			externalGlobalState.setUnburnedShares("0x0fffffff", "0x00")
			const { unburnedGasReserveShares, unburnedZeroFeeShares } = await externalGlobalState.decode();
			expect(unburnedGasReserveShares).to.eq("0x0fffffff");
			expect(unburnedZeroFeeShares).to.eq("0x00");
		});

		it('Should be able to set max/min values', async () => {
			externalGlobalState.setUnburnedShares("0x00", "0x0fffffff")
			const { unburnedGasReserveShares, unburnedZeroFeeShares } = await externalGlobalState.decode();
			expect(unburnedGasReserveShares).to.eq("0x00");
			expect(unburnedZeroFeeShares).to.eq("0x0fffffff");
		});
	})

	describe('getUnburnedShares', () => {
		it('Should be able to get min/max values', async () => {
			await externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x0fffffff", "0x00");
			const { unburnedGasReserveShares, unburnedZeroFeeShares } = await externalGlobalState.getUnburnedShares()
			expect(unburnedGasReserveShares).to.eq("0x0fffffff");
			expect(unburnedZeroFeeShares).to.eq("0x00");
		});

		it('Should be able to get max/min values', async () => {
			await externalGlobalState.encode("0x07ff", "0x07ff", "0x1fff", "0x7fffff", "0x7fffff", "0x3fffffff", "0xffff", "0xffffffff", "0xffffffffff", "0x00", "0x0fffffff");
			const { unburnedGasReserveShares, unburnedZeroFeeShares } = await externalGlobalState.getUnburnedShares()
			expect(unburnedGasReserveShares).to.eq("0x00");
			expect(unburnedZeroFeeShares).to.eq("0x0fffffff");
		});
	})

	describe('getZeroBorrowFeeBips', () => {
		it('Should be able to get min value', async () => {
			await externalGlobalState.encode("0x07ff", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00");
			const zeroBorrowFeeBips = await externalGlobalState.getZeroBorrowFeeBips()
			expect(zeroBorrowFeeBips).to.eq("0x07ff");
		});

		it('Should be able to get max value', async () => {
			await externalGlobalState.encode("0x00", "0x07ff", "0x1fff", "0x7fffff", "0x7fffff", "0x3fffffff", "0xffff", "0xffffffff", "0xffffffffff", "0x0fffffff", "0x0fffffff");
			const zeroBorrowFeeBips = await externalGlobalState.getZeroBorrowFeeBips()
			expect(zeroBorrowFeeBips).to.eq("0x00");
		});
	})

	describe('setZeroBorrowFeeBips', () => {
		it('Should be able to set min value', async () => {
			externalGlobalState.setZeroBorrowFeeBips("0x07ff")
			const { zeroBorrowFeeBips } = await externalGlobalState.decode();
			expect(zeroBorrowFeeBips).to.eq("0x07ff");
		});

		it('Should be able to set max value', async () => {
			externalGlobalState.setZeroBorrowFeeBips("0x00")
			const { zeroBorrowFeeBips } = await externalGlobalState.decode();
			expect(zeroBorrowFeeBips).to.eq("0x00");
		});
	})

	describe('getRenBorrowFeeBips', () => {
		it('Should be able to get min value', async () => {
			await externalGlobalState.encode("0x00", "0x07ff", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00");
			const renBorrowFeeBips = await externalGlobalState.getRenBorrowFeeBips()
			expect(renBorrowFeeBips).to.eq("0x07ff");
		});

		it('Should be able to get max value', async () => {
			await externalGlobalState.encode("0x07ff", "0x00", "0x1fff", "0x7fffff", "0x7fffff", "0x3fffffff", "0xffff", "0xffffffff", "0xffffffffff", "0x0fffffff", "0x0fffffff");
			const renBorrowFeeBips = await externalGlobalState.getRenBorrowFeeBips()
			expect(renBorrowFeeBips).to.eq("0x00");
		});
	})

	describe('setRenBorrowFeeBips', () => {
		it('Should be able to set min value', async () => {
			externalGlobalState.setRenBorrowFeeBips("0x07ff")
			const { renBorrowFeeBips } = await externalGlobalState.decode();
			expect(renBorrowFeeBips).to.eq("0x07ff");
		});

		it('Should be able to set max value', async () => {
			externalGlobalState.setRenBorrowFeeBips("0x00")
			const { renBorrowFeeBips } = await externalGlobalState.decode();
			expect(renBorrowFeeBips).to.eq("0x00");
		});
	})

	describe('getZeroFeeShareBips', () => {
		it('Should be able to get min value', async () => {
			await externalGlobalState.encode("0x00", "0x00", "0x1fff", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00");
			const zeroFeeShareBips = await externalGlobalState.getZeroFeeShareBips()
			expect(zeroFeeShareBips).to.eq("0x1fff");
		});

		it('Should be able to get max value', async () => {
			await externalGlobalState.encode("0x07ff", "0x07ff", "0x00", "0x7fffff", "0x7fffff", "0x3fffffff", "0xffff", "0xffffffff", "0xffffffffff", "0x0fffffff", "0x0fffffff");
			const zeroFeeShareBips = await externalGlobalState.getZeroFeeShareBips()
			expect(zeroFeeShareBips).to.eq("0x00");
		});
	})

	describe('setZeroFeeShareBips', () => {
		it('Should be able to set min value', async () => {
			externalGlobalState.setZeroFeeShareBips("0x1fff")
			const { zeroFeeShareBips } = await externalGlobalState.decode();
			expect(zeroFeeShareBips).to.eq("0x1fff");
		});

		it('Should be able to set max value', async () => {
			externalGlobalState.setZeroFeeShareBips("0x00")
			const { zeroFeeShareBips } = await externalGlobalState.decode();
			expect(zeroFeeShareBips).to.eq("0x00");
		});
	})

	describe('getZeroBorrowFeeStatic', () => {
		it('Should be able to get min value', async () => {
			await externalGlobalState.encode("0x00", "0x00", "0x00", "0x7fffff", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00");
			const zeroBorrowFeeStatic = await externalGlobalState.getZeroBorrowFeeStatic()
			expect(zeroBorrowFeeStatic).to.eq("0x7fffff");
		});

		it('Should be able to get max value', async () => {
			await externalGlobalState.encode("0x07ff", "0x07ff", "0x1fff", "0x00", "0x7fffff", "0x3fffffff", "0xffff", "0xffffffff", "0xffffffffff", "0x0fffffff", "0x0fffffff");
			const zeroBorrowFeeStatic = await externalGlobalState.getZeroBorrowFeeStatic()
			expect(zeroBorrowFeeStatic).to.eq("0x00");
		});
	})

	describe('setZeroBorrowFeeStatic', () => {
		it('Reverts when zeroBorrowFeeStatic overflows', async () => {
			await expect(
			externalGlobalState.setZeroBorrowFeeStatic("0xffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min value', async () => {
			externalGlobalState.setZeroBorrowFeeStatic("0x7fffff")
			const { zeroBorrowFeeStatic } = await externalGlobalState.decode();
			expect(zeroBorrowFeeStatic).to.eq("0x7fffff");
		});

		it('Should be able to set max value', async () => {
			externalGlobalState.setZeroBorrowFeeStatic("0x00")
			const { zeroBorrowFeeStatic } = await externalGlobalState.decode();
			expect(zeroBorrowFeeStatic).to.eq("0x00");
		});
	})

	describe('getRenBorrowFeeStatic', () => {
		it('Should be able to get min value', async () => {
			await externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x7fffff", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00");
			const renBorrowFeeStatic = await externalGlobalState.getRenBorrowFeeStatic()
			expect(renBorrowFeeStatic).to.eq("0x7fffff");
		});

		it('Should be able to get max value', async () => {
			await externalGlobalState.encode("0x07ff", "0x07ff", "0x1fff", "0x7fffff", "0x00", "0x3fffffff", "0xffff", "0xffffffff", "0xffffffffff", "0x0fffffff", "0x0fffffff");
			const renBorrowFeeStatic = await externalGlobalState.getRenBorrowFeeStatic()
			expect(renBorrowFeeStatic).to.eq("0x00");
		});
	})

	describe('setRenBorrowFeeStatic', () => {
		it('Reverts when renBorrowFeeStatic overflows', async () => {
			await expect(
			externalGlobalState.setRenBorrowFeeStatic("0xffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min value', async () => {
			externalGlobalState.setRenBorrowFeeStatic("0x7fffff")
			const { renBorrowFeeStatic } = await externalGlobalState.decode();
			expect(renBorrowFeeStatic).to.eq("0x7fffff");
		});

		it('Should be able to set max value', async () => {
			externalGlobalState.setRenBorrowFeeStatic("0x00")
			const { renBorrowFeeStatic } = await externalGlobalState.decode();
			expect(renBorrowFeeStatic).to.eq("0x00");
		});
	})

	describe('getSatoshiPerEth', () => {
		it('Should be able to get min value', async () => {
			await externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x3fffffff", "0x00", "0x00", "0x00", "0x00", "0x00");
			const satoshiPerEth = await externalGlobalState.getSatoshiPerEth()
			expect(satoshiPerEth).to.eq("0x3fffffff");
		});

		it('Should be able to get max value', async () => {
			await externalGlobalState.encode("0x07ff", "0x07ff", "0x1fff", "0x7fffff", "0x7fffff", "0x00", "0xffff", "0xffffffff", "0xffffffffff", "0x0fffffff", "0x0fffffff");
			const satoshiPerEth = await externalGlobalState.getSatoshiPerEth()
			expect(satoshiPerEth).to.eq("0x00");
		});
	})

	describe('getGweiPerGas', () => {
		it('Should be able to get min value', async () => {
			await externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0xffff", "0x00", "0x00", "0x00", "0x00");
			const gweiPerGas = await externalGlobalState.getGweiPerGas()
			expect(gweiPerGas).to.eq("0xffff");
		});

		it('Should be able to get max value', async () => {
			await externalGlobalState.encode("0x07ff", "0x07ff", "0x1fff", "0x7fffff", "0x7fffff", "0x3fffffff", "0x00", "0xffffffff", "0xffffffffff", "0x0fffffff", "0x0fffffff");
			const gweiPerGas = await externalGlobalState.getGweiPerGas()
			expect(gweiPerGas).to.eq("0x00");
		});
	})

	describe('getLastUpdateTimestamp', () => {
		it('Should be able to get min value', async () => {
			await externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0xffffffff", "0x00", "0x00", "0x00");
			const lastUpdateTimestamp = await externalGlobalState.getLastUpdateTimestamp()
			expect(lastUpdateTimestamp).to.eq("0xffffffff");
		});

		it('Should be able to get max value', async () => {
			await externalGlobalState.encode("0x07ff", "0x07ff", "0x1fff", "0x7fffff", "0x7fffff", "0x3fffffff", "0xffff", "0x00", "0xffffffffff", "0x0fffffff", "0x0fffffff");
			const lastUpdateTimestamp = await externalGlobalState.getLastUpdateTimestamp()
			expect(lastUpdateTimestamp).to.eq("0x00");
		});
	})

	describe('getTotalBitcoinBorrowed', () => {
		it('Should be able to get min value', async () => {
			await externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0xffffffffff", "0x00", "0x00");
			const totalBitcoinBorrowed = await externalGlobalState.getTotalBitcoinBorrowed()
			expect(totalBitcoinBorrowed).to.eq("0xffffffffff");
		});

		it('Should be able to get max value', async () => {
			await externalGlobalState.encode("0x07ff", "0x07ff", "0x1fff", "0x7fffff", "0x7fffff", "0x3fffffff", "0xffff", "0xffffffff", "0x00", "0x0fffffff", "0x0fffffff");
			const totalBitcoinBorrowed = await externalGlobalState.getTotalBitcoinBorrowed()
			expect(totalBitcoinBorrowed).to.eq("0x00");
		});
	})

	describe('setTotalBitcoinBorrowed', () => {
		it('Reverts when totalBitcoinBorrowed overflows', async () => {
			await expect(
			externalGlobalState.setTotalBitcoinBorrowed("0x01ffffffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min value', async () => {
			externalGlobalState.setTotalBitcoinBorrowed("0xffffffffff")
			const { totalBitcoinBorrowed } = await externalGlobalState.decode();
			expect(totalBitcoinBorrowed).to.eq("0xffffffffff");
		});

		it('Should be able to set max value', async () => {
			externalGlobalState.setTotalBitcoinBorrowed("0x00")
			const { totalBitcoinBorrowed } = await externalGlobalState.decode();
			expect(totalBitcoinBorrowed).to.eq("0x00");
		});
	})

	describe('getUnburnedGasReserveShares', () => {
		it('Should be able to get min value', async () => {
			await externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x0fffffff", "0x00");
			const unburnedGasReserveShares = await externalGlobalState.getUnburnedGasReserveShares()
			expect(unburnedGasReserveShares).to.eq("0x0fffffff");
		});

		it('Should be able to get max value', async () => {
			await externalGlobalState.encode("0x07ff", "0x07ff", "0x1fff", "0x7fffff", "0x7fffff", "0x3fffffff", "0xffff", "0xffffffff", "0xffffffffff", "0x00", "0x0fffffff");
			const unburnedGasReserveShares = await externalGlobalState.getUnburnedGasReserveShares()
			expect(unburnedGasReserveShares).to.eq("0x00");
		});
	})

	describe('setUnburnedGasReserveShares', () => {
		it('Reverts when unburnedGasReserveShares overflows', async () => {
			await expect(
			externalGlobalState.setUnburnedGasReserveShares("0x1fffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min value', async () => {
			externalGlobalState.setUnburnedGasReserveShares("0x0fffffff")
			const { unburnedGasReserveShares } = await externalGlobalState.decode();
			expect(unburnedGasReserveShares).to.eq("0x0fffffff");
		});

		it('Should be able to set max value', async () => {
			externalGlobalState.setUnburnedGasReserveShares("0x00")
			const { unburnedGasReserveShares } = await externalGlobalState.decode();
			expect(unburnedGasReserveShares).to.eq("0x00");
		});
	})

	describe('getUnburnedZeroFeeShares', () => {
		it('Should be able to get min value', async () => {
			await externalGlobalState.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x0fffffff");
			const unburnedZeroFeeShares = await externalGlobalState.getUnburnedZeroFeeShares()
			expect(unburnedZeroFeeShares).to.eq("0x0fffffff");
		});

		it('Should be able to get max value', async () => {
			await externalGlobalState.encode("0x07ff", "0x07ff", "0x1fff", "0x7fffff", "0x7fffff", "0x3fffffff", "0xffff", "0xffffffff", "0xffffffffff", "0x0fffffff", "0x00");
			const unburnedZeroFeeShares = await externalGlobalState.getUnburnedZeroFeeShares()
			expect(unburnedZeroFeeShares).to.eq("0x00");
		});
	})

	describe('setUnburnedZeroFeeShares', () => {
		it('Reverts when unburnedZeroFeeShares overflows', async () => {
			await expect(
			externalGlobalState.setUnburnedZeroFeeShares("0x1fffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min value', async () => {
			externalGlobalState.setUnburnedZeroFeeShares("0x0fffffff")
			const { unburnedZeroFeeShares } = await externalGlobalState.decode();
			expect(unburnedZeroFeeShares).to.eq("0x0fffffff");
		});

		it('Should be able to set max value', async () => {
			externalGlobalState.setUnburnedZeroFeeShares("0x00")
			const { unburnedZeroFeeShares } = await externalGlobalState.decode();
			expect(unburnedZeroFeeShares).to.eq("0x00");
		});
	})
})