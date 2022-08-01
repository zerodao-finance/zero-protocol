import { ethers } from 'hardhat';
import { expect } from "chai";

describe('ModuleFeesCoder.sol', () => {
	let externalModuleFees: any;

	before(async () => {
		const Factory = await ethers.getContractFactory('ExternalModuleFeesCoder');
		externalModuleFees = await Factory.deploy();
	})

	describe('decode', () => {
		it('Should be able to get min/max values', async () => {
			await externalModuleFees.encode("0x03", "0x00", "0xff", "0x00", "0xffffffffffffffff", "0x00", "0xffffff", "0x00");
			const { moduleType, loanGasE4, repayGasE4, ethRefundForLoanGas, ethRefundForRepayGas, btcFeeForLoanGas, btcFeeForRepayGas, lastUpdateTimestamp } = await externalModuleFees.decode()
			expect(moduleType).to.eq("0x03");
			expect(loanGasE4).to.eq("0x00");
			expect(repayGasE4).to.eq("0xff");
			expect(ethRefundForLoanGas).to.eq("0x00");
			expect(ethRefundForRepayGas).to.eq("0xffffffffffffffff");
			expect(btcFeeForLoanGas).to.eq("0x00");
			expect(btcFeeForRepayGas).to.eq("0xffffff");
			expect(lastUpdateTimestamp).to.eq("0x00");
		});

		it('Should be able to get max/min values', async () => {
			await externalModuleFees.encode("0x00", "0xff", "0x00", "0xffffffffffffffff", "0x00", "0xffffff", "0x00", "0xffffffff");
			const { moduleType, loanGasE4, repayGasE4, ethRefundForLoanGas, ethRefundForRepayGas, btcFeeForLoanGas, btcFeeForRepayGas, lastUpdateTimestamp } = await externalModuleFees.decode()
			expect(moduleType).to.eq("0x00");
			expect(loanGasE4).to.eq("0xff");
			expect(repayGasE4).to.eq("0x00");
			expect(ethRefundForLoanGas).to.eq("0xffffffffffffffff");
			expect(ethRefundForRepayGas).to.eq("0x00");
			expect(btcFeeForLoanGas).to.eq("0xffffff");
			expect(btcFeeForRepayGas).to.eq("0x00");
			expect(lastUpdateTimestamp).to.eq("0xffffffff");
		});
	})

	describe('encode', () => {
		it('Reverts when loanGasE4 overflows', async () => {
			await expect(
			externalModuleFees.encode("0x00", "0x01ff", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when repayGasE4 overflows', async () => {
			await expect(
			externalModuleFees.encode("0x00", "0x00", "0x01ff", "0x00", "0x00", "0x00", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when ethRefundForLoanGas overflows', async () => {
			await expect(
			externalModuleFees.encode("0x00", "0x00", "0x00", "0x01ffffffffffffffff", "0x00", "0x00", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when ethRefundForRepayGas overflows', async () => {
			await expect(
			externalModuleFees.encode("0x00", "0x00", "0x00", "0x00", "0x01ffffffffffffffff", "0x00", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when btcFeeForLoanGas overflows', async () => {
			await expect(
			externalModuleFees.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x01ffffff", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when btcFeeForRepayGas overflows', async () => {
			await expect(
			externalModuleFees.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x01ffffff", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when lastUpdateTimestamp overflows', async () => {
			await expect(
			externalModuleFees.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x01ffffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min/max values', async () => {
			externalModuleFees.encode("0x03", "0x00", "0xff", "0x00", "0xffffffffffffffff", "0x00", "0xffffff", "0x00")
			const { moduleType, loanGasE4, repayGasE4, ethRefundForLoanGas, ethRefundForRepayGas, btcFeeForLoanGas, btcFeeForRepayGas, lastUpdateTimestamp } = await externalModuleFees.decode();
			expect(moduleType).to.eq("0x03");
			expect(loanGasE4).to.eq("0x00");
			expect(repayGasE4).to.eq("0xff");
			expect(ethRefundForLoanGas).to.eq("0x00");
			expect(ethRefundForRepayGas).to.eq("0xffffffffffffffff");
			expect(btcFeeForLoanGas).to.eq("0x00");
			expect(btcFeeForRepayGas).to.eq("0xffffff");
			expect(lastUpdateTimestamp).to.eq("0x00");
		});

		it('Should be able to set max/min values', async () => {
			externalModuleFees.encode("0x00", "0xff", "0x00", "0xffffffffffffffff", "0x00", "0xffffff", "0x00", "0xffffffff")
			const { moduleType, loanGasE4, repayGasE4, ethRefundForLoanGas, ethRefundForRepayGas, btcFeeForLoanGas, btcFeeForRepayGas, lastUpdateTimestamp } = await externalModuleFees.decode();
			expect(moduleType).to.eq("0x00");
			expect(loanGasE4).to.eq("0xff");
			expect(repayGasE4).to.eq("0x00");
			expect(ethRefundForLoanGas).to.eq("0xffffffffffffffff");
			expect(ethRefundForRepayGas).to.eq("0x00");
			expect(btcFeeForLoanGas).to.eq("0xffffff");
			expect(btcFeeForRepayGas).to.eq("0x00");
			expect(lastUpdateTimestamp).to.eq("0xffffffff");
		});
	})

	describe('getLoanParams', () => {
		it('Should be able to get min/max values', async () => {
			await externalModuleFees.encode("0x03", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00");
			const { moduleType, ethRefundForLoanGas } = await externalModuleFees.getLoanParams()
			expect(moduleType).to.eq("0x03");
			expect(ethRefundForLoanGas).to.eq("0x00");
		});

		it('Should be able to get max/min values', async () => {
			await externalModuleFees.encode("0x00", "0xff", "0xff", "0xffffffffffffffff", "0xffffffffffffffff", "0xffffff", "0xffffff", "0xffffffff");
			const { moduleType, ethRefundForLoanGas } = await externalModuleFees.getLoanParams()
			expect(moduleType).to.eq("0x00");
			expect(ethRefundForLoanGas).to.eq("0xffffffffffffffff");
		});
	})

	describe('getBitcoinGasFees', () => {
		it('Should be able to get min/max values', async () => {
			await externalModuleFees.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0xffffff", "0x00", "0x00");
			const { btcFeeForLoanGas, btcFeeForRepayGas } = await externalModuleFees.getBitcoinGasFees()
			expect(btcFeeForLoanGas).to.eq("0xffffff");
			expect(btcFeeForRepayGas).to.eq("0x00");
		});

		it('Should be able to get max/min values', async () => {
			await externalModuleFees.encode("0x03", "0xff", "0xff", "0xffffffffffffffff", "0xffffffffffffffff", "0x00", "0xffffff", "0xffffffff");
			const { btcFeeForLoanGas, btcFeeForRepayGas } = await externalModuleFees.getBitcoinGasFees()
			expect(btcFeeForLoanGas).to.eq("0x00");
			expect(btcFeeForRepayGas).to.eq("0xffffff");
		});
	})

	describe('setRepayParams', () => {
		it('Reverts when ethRefundForRepayGas overflows', async () => {
			await expect(
			externalModuleFees.setRepayParams("0x00", "0x01ffffffffffffffff", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when btcFeeForRepayGas overflows', async () => {
			await expect(
			externalModuleFees.setRepayParams("0x00", "0x00", "0x01ffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min/max values', async () => {
			externalModuleFees.setRepayParams("0x03", "0x00", "0xffffff")
			const { moduleType, ethRefundForRepayGas, btcFeeForRepayGas } = await externalModuleFees.decode();
			expect(moduleType).to.eq("0x03");
			expect(ethRefundForRepayGas).to.eq("0x00");
			expect(btcFeeForRepayGas).to.eq("0xffffff");
		});

		it('Should be able to set max/min values', async () => {
			externalModuleFees.setRepayParams("0x00", "0xffffffffffffffff", "0x00")
			const { moduleType, ethRefundForRepayGas, btcFeeForRepayGas } = await externalModuleFees.decode();
			expect(moduleType).to.eq("0x00");
			expect(ethRefundForRepayGas).to.eq("0xffffffffffffffff");
			expect(btcFeeForRepayGas).to.eq("0x00");
		});
	})

	describe('getRepayParams', () => {
		it('Should be able to get min/max values', async () => {
			await externalModuleFees.encode("0x03", "0x00", "0x00", "0x00", "0x00", "0x00", "0xffffff", "0x00");
			const { moduleType, ethRefundForRepayGas, btcFeeForRepayGas } = await externalModuleFees.getRepayParams()
			expect(moduleType).to.eq("0x03");
			expect(ethRefundForRepayGas).to.eq("0x00");
			expect(btcFeeForRepayGas).to.eq("0xffffff");
		});

		it('Should be able to get max/min values', async () => {
			await externalModuleFees.encode("0x00", "0xff", "0xff", "0xffffffffffffffff", "0xffffffffffffffff", "0xffffff", "0x00", "0xffffffff");
			const { moduleType, ethRefundForRepayGas, btcFeeForRepayGas } = await externalModuleFees.getRepayParams()
			expect(moduleType).to.eq("0x00");
			expect(ethRefundForRepayGas).to.eq("0xffffffffffffffff");
			expect(btcFeeForRepayGas).to.eq("0x00");
		});
	})

	describe('setCached', () => {
		it('Reverts when ethRefundForLoanGas overflows', async () => {
			await expect(
			externalModuleFees.setCached("0x01ffffffffffffffff", "0x00", "0x00", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when ethRefundForRepayGas overflows', async () => {
			await expect(
			externalModuleFees.setCached("0x00", "0x01ffffffffffffffff", "0x00", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when btcFeeForLoanGas overflows', async () => {
			await expect(
			externalModuleFees.setCached("0x00", "0x00", "0x01ffffff", "0x00", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when btcFeeForRepayGas overflows', async () => {
			await expect(
			externalModuleFees.setCached("0x00", "0x00", "0x00", "0x01ffffff", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when lastUpdateTimestamp overflows', async () => {
			await expect(
			externalModuleFees.setCached("0x00", "0x00", "0x00", "0x00", "0x01ffffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min/max values', async () => {
			externalModuleFees.setCached("0xffffffffffffffff", "0x00", "0xffffff", "0x00", "0xffffffff")
			const { ethRefundForLoanGas, ethRefundForRepayGas, btcFeeForLoanGas, btcFeeForRepayGas, lastUpdateTimestamp } = await externalModuleFees.decode();
			expect(ethRefundForLoanGas).to.eq("0xffffffffffffffff");
			expect(ethRefundForRepayGas).to.eq("0x00");
			expect(btcFeeForLoanGas).to.eq("0xffffff");
			expect(btcFeeForRepayGas).to.eq("0x00");
			expect(lastUpdateTimestamp).to.eq("0xffffffff");
		});

		it('Should be able to set max/min values', async () => {
			externalModuleFees.setCached("0x00", "0xffffffffffffffff", "0x00", "0xffffff", "0x00")
			const { ethRefundForLoanGas, ethRefundForRepayGas, btcFeeForLoanGas, btcFeeForRepayGas, lastUpdateTimestamp } = await externalModuleFees.decode();
			expect(ethRefundForLoanGas).to.eq("0x00");
			expect(ethRefundForRepayGas).to.eq("0xffffffffffffffff");
			expect(btcFeeForLoanGas).to.eq("0x00");
			expect(btcFeeForRepayGas).to.eq("0xffffff");
			expect(lastUpdateTimestamp).to.eq("0x00");
		});
	})

	describe('getCached', () => {
		it('Should be able to get min/max values', async () => {
			await externalModuleFees.encode("0x00", "0x00", "0x00", "0xffffffffffffffff", "0x00", "0xffffff", "0x00", "0xffffffff");
			const { ethRefundForLoanGas, ethRefundForRepayGas, btcFeeForLoanGas, btcFeeForRepayGas, lastUpdateTimestamp } = await externalModuleFees.getCached()
			expect(ethRefundForLoanGas).to.eq("0xffffffffffffffff");
			expect(ethRefundForRepayGas).to.eq("0x00");
			expect(btcFeeForLoanGas).to.eq("0xffffff");
			expect(btcFeeForRepayGas).to.eq("0x00");
			expect(lastUpdateTimestamp).to.eq("0xffffffff");
		});

		it('Should be able to get max/min values', async () => {
			await externalModuleFees.encode("0x03", "0xff", "0xff", "0x00", "0xffffffffffffffff", "0x00", "0xffffff", "0x00");
			const { ethRefundForLoanGas, ethRefundForRepayGas, btcFeeForLoanGas, btcFeeForRepayGas, lastUpdateTimestamp } = await externalModuleFees.getCached()
			expect(ethRefundForLoanGas).to.eq("0x00");
			expect(ethRefundForRepayGas).to.eq("0xffffffffffffffff");
			expect(btcFeeForLoanGas).to.eq("0x00");
			expect(btcFeeForRepayGas).to.eq("0xffffff");
			expect(lastUpdateTimestamp).to.eq("0x00");
		});
	})

	describe('setGasParams', () => {
		it('Reverts when loanGasE4 overflows', async () => {
			await expect(
			externalModuleFees.setGasParams("0x01ff", "0x00")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Reverts when repayGasE4 overflows', async () => {
			await expect(
			externalModuleFees.setGasParams("0x00", "0x01ff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min/max values', async () => {
			externalModuleFees.setGasParams("0xff", "0x00")
			const { loanGasE4, repayGasE4 } = await externalModuleFees.decode();
			expect(loanGasE4).to.eq("0xff");
			expect(repayGasE4).to.eq("0x00");
		});

		it('Should be able to set max/min values', async () => {
			externalModuleFees.setGasParams("0x00", "0xff")
			const { loanGasE4, repayGasE4 } = await externalModuleFees.decode();
			expect(loanGasE4).to.eq("0x00");
			expect(repayGasE4).to.eq("0xff");
		});
	})

	describe('getGasParams', () => {
		it('Should be able to get min/max values', async () => {
			await externalModuleFees.encode("0x00", "0xff", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00");
			const { loanGasE4, repayGasE4 } = await externalModuleFees.getGasParams()
			expect(loanGasE4).to.eq("0xff");
			expect(repayGasE4).to.eq("0x00");
		});

		it('Should be able to get max/min values', async () => {
			await externalModuleFees.encode("0x03", "0x00", "0xff", "0xffffffffffffffff", "0xffffffffffffffff", "0xffffff", "0xffffff", "0xffffffff");
			const { loanGasE4, repayGasE4 } = await externalModuleFees.getGasParams()
			expect(loanGasE4).to.eq("0x00");
			expect(repayGasE4).to.eq("0xff");
		});
	})

	describe('getModuleType', () => {
		it('Should be able to get min value', async () => {
			await externalModuleFees.encode("0x03", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00");
			const moduleType = await externalModuleFees.getModuleType()
			expect(moduleType).to.eq("0x03");
		});

		it('Should be able to get max value', async () => {
			await externalModuleFees.encode("0x00", "0xff", "0xff", "0xffffffffffffffff", "0xffffffffffffffff", "0xffffff", "0xffffff", "0xffffffff");
			const moduleType = await externalModuleFees.getModuleType()
			expect(moduleType).to.eq("0x00");
		});
	})

	describe('setModuleType', () => {
		it('Should be able to set min value', async () => {
			externalModuleFees.setModuleType("0x03")
			const { moduleType } = await externalModuleFees.decode();
			expect(moduleType).to.eq("0x03");
		});

		it('Should be able to set max value', async () => {
			externalModuleFees.setModuleType("0x00")
			const { moduleType } = await externalModuleFees.decode();
			expect(moduleType).to.eq("0x00");
		});
	})

	describe('getLoanGasE4', () => {
		it('Should be able to get min value', async () => {
			await externalModuleFees.encode("0x00", "0xff", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00");
			const loanGasE4 = await externalModuleFees.getLoanGasE4()
			expect(loanGasE4).to.eq("0xff");
		});

		it('Should be able to get max value', async () => {
			await externalModuleFees.encode("0x03", "0x00", "0xff", "0xffffffffffffffff", "0xffffffffffffffff", "0xffffff", "0xffffff", "0xffffffff");
			const loanGasE4 = await externalModuleFees.getLoanGasE4()
			expect(loanGasE4).to.eq("0x00");
		});
	})

	describe('setLoanGasE4', () => {
		it('Reverts when loanGasE4 overflows', async () => {
			await expect(
			externalModuleFees.setLoanGasE4("0x01ff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min value', async () => {
			externalModuleFees.setLoanGasE4("0xff")
			const { loanGasE4 } = await externalModuleFees.decode();
			expect(loanGasE4).to.eq("0xff");
		});

		it('Should be able to set max value', async () => {
			externalModuleFees.setLoanGasE4("0x00")
			const { loanGasE4 } = await externalModuleFees.decode();
			expect(loanGasE4).to.eq("0x00");
		});
	})

	describe('getRepayGasE4', () => {
		it('Should be able to get min value', async () => {
			await externalModuleFees.encode("0x00", "0x00", "0xff", "0x00", "0x00", "0x00", "0x00", "0x00");
			const repayGasE4 = await externalModuleFees.getRepayGasE4()
			expect(repayGasE4).to.eq("0xff");
		});

		it('Should be able to get max value', async () => {
			await externalModuleFees.encode("0x03", "0xff", "0x00", "0xffffffffffffffff", "0xffffffffffffffff", "0xffffff", "0xffffff", "0xffffffff");
			const repayGasE4 = await externalModuleFees.getRepayGasE4()
			expect(repayGasE4).to.eq("0x00");
		});
	})

	describe('setRepayGasE4', () => {
		it('Reverts when repayGasE4 overflows', async () => {
			await expect(
			externalModuleFees.setRepayGasE4("0x01ff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min value', async () => {
			externalModuleFees.setRepayGasE4("0xff")
			const { repayGasE4 } = await externalModuleFees.decode();
			expect(repayGasE4).to.eq("0xff");
		});

		it('Should be able to set max value', async () => {
			externalModuleFees.setRepayGasE4("0x00")
			const { repayGasE4 } = await externalModuleFees.decode();
			expect(repayGasE4).to.eq("0x00");
		});
	})

	describe('getEthRefundForLoanGas', () => {
		it('Should be able to get min value', async () => {
			await externalModuleFees.encode("0x00", "0x00", "0x00", "0xffffffffffffffff", "0x00", "0x00", "0x00", "0x00");
			const ethRefundForLoanGas = await externalModuleFees.getEthRefundForLoanGas()
			expect(ethRefundForLoanGas).to.eq("0xffffffffffffffff");
		});

		it('Should be able to get max value', async () => {
			await externalModuleFees.encode("0x03", "0xff", "0xff", "0x00", "0xffffffffffffffff", "0xffffff", "0xffffff", "0xffffffff");
			const ethRefundForLoanGas = await externalModuleFees.getEthRefundForLoanGas()
			expect(ethRefundForLoanGas).to.eq("0x00");
		});
	})

	describe('setEthRefundForLoanGas', () => {
		it('Reverts when ethRefundForLoanGas overflows', async () => {
			await expect(
			externalModuleFees.setEthRefundForLoanGas("0x01ffffffffffffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min value', async () => {
			externalModuleFees.setEthRefundForLoanGas("0xffffffffffffffff")
			const { ethRefundForLoanGas } = await externalModuleFees.decode();
			expect(ethRefundForLoanGas).to.eq("0xffffffffffffffff");
		});

		it('Should be able to set max value', async () => {
			externalModuleFees.setEthRefundForLoanGas("0x00")
			const { ethRefundForLoanGas } = await externalModuleFees.decode();
			expect(ethRefundForLoanGas).to.eq("0x00");
		});
	})

	describe('getEthRefundForRepayGas', () => {
		it('Should be able to get min value', async () => {
			await externalModuleFees.encode("0x00", "0x00", "0x00", "0x00", "0xffffffffffffffff", "0x00", "0x00", "0x00");
			const ethRefundForRepayGas = await externalModuleFees.getEthRefundForRepayGas()
			expect(ethRefundForRepayGas).to.eq("0xffffffffffffffff");
		});

		it('Should be able to get max value', async () => {
			await externalModuleFees.encode("0x03", "0xff", "0xff", "0xffffffffffffffff", "0x00", "0xffffff", "0xffffff", "0xffffffff");
			const ethRefundForRepayGas = await externalModuleFees.getEthRefundForRepayGas()
			expect(ethRefundForRepayGas).to.eq("0x00");
		});
	})

	describe('setEthRefundForRepayGas', () => {
		it('Reverts when ethRefundForRepayGas overflows', async () => {
			await expect(
			externalModuleFees.setEthRefundForRepayGas("0x01ffffffffffffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min value', async () => {
			externalModuleFees.setEthRefundForRepayGas("0xffffffffffffffff")
			const { ethRefundForRepayGas } = await externalModuleFees.decode();
			expect(ethRefundForRepayGas).to.eq("0xffffffffffffffff");
		});

		it('Should be able to set max value', async () => {
			externalModuleFees.setEthRefundForRepayGas("0x00")
			const { ethRefundForRepayGas } = await externalModuleFees.decode();
			expect(ethRefundForRepayGas).to.eq("0x00");
		});
	})

	describe('getBtcFeeForLoanGas', () => {
		it('Should be able to get min value', async () => {
			await externalModuleFees.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0xffffff", "0x00", "0x00");
			const btcFeeForLoanGas = await externalModuleFees.getBtcFeeForLoanGas()
			expect(btcFeeForLoanGas).to.eq("0xffffff");
		});

		it('Should be able to get max value', async () => {
			await externalModuleFees.encode("0x03", "0xff", "0xff", "0xffffffffffffffff", "0xffffffffffffffff", "0x00", "0xffffff", "0xffffffff");
			const btcFeeForLoanGas = await externalModuleFees.getBtcFeeForLoanGas()
			expect(btcFeeForLoanGas).to.eq("0x00");
		});
	})

	describe('setBtcFeeForLoanGas', () => {
		it('Reverts when btcFeeForLoanGas overflows', async () => {
			await expect(
			externalModuleFees.setBtcFeeForLoanGas("0x01ffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min value', async () => {
			externalModuleFees.setBtcFeeForLoanGas("0xffffff")
			const { btcFeeForLoanGas } = await externalModuleFees.decode();
			expect(btcFeeForLoanGas).to.eq("0xffffff");
		});

		it('Should be able to set max value', async () => {
			externalModuleFees.setBtcFeeForLoanGas("0x00")
			const { btcFeeForLoanGas } = await externalModuleFees.decode();
			expect(btcFeeForLoanGas).to.eq("0x00");
		});
	})

	describe('getBtcFeeForRepayGas', () => {
		it('Should be able to get min value', async () => {
			await externalModuleFees.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0xffffff", "0x00");
			const btcFeeForRepayGas = await externalModuleFees.getBtcFeeForRepayGas()
			expect(btcFeeForRepayGas).to.eq("0xffffff");
		});

		it('Should be able to get max value', async () => {
			await externalModuleFees.encode("0x03", "0xff", "0xff", "0xffffffffffffffff", "0xffffffffffffffff", "0xffffff", "0x00", "0xffffffff");
			const btcFeeForRepayGas = await externalModuleFees.getBtcFeeForRepayGas()
			expect(btcFeeForRepayGas).to.eq("0x00");
		});
	})

	describe('setBtcFeeForRepayGas', () => {
		it('Reverts when btcFeeForRepayGas overflows', async () => {
			await expect(
			externalModuleFees.setBtcFeeForRepayGas("0x01ffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min value', async () => {
			externalModuleFees.setBtcFeeForRepayGas("0xffffff")
			const { btcFeeForRepayGas } = await externalModuleFees.decode();
			expect(btcFeeForRepayGas).to.eq("0xffffff");
		});

		it('Should be able to set max value', async () => {
			externalModuleFees.setBtcFeeForRepayGas("0x00")
			const { btcFeeForRepayGas } = await externalModuleFees.decode();
			expect(btcFeeForRepayGas).to.eq("0x00");
		});
	})

	describe('getLastUpdateTimestamp', () => {
		it('Should be able to get min value', async () => {
			await externalModuleFees.encode("0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0xffffffff");
			const lastUpdateTimestamp = await externalModuleFees.getLastUpdateTimestamp()
			expect(lastUpdateTimestamp).to.eq("0xffffffff");
		});

		it('Should be able to get max value', async () => {
			await externalModuleFees.encode("0x03", "0xff", "0xff", "0xffffffffffffffff", "0xffffffffffffffff", "0xffffff", "0xffffff", "0x00");
			const lastUpdateTimestamp = await externalModuleFees.getLastUpdateTimestamp()
			expect(lastUpdateTimestamp).to.eq("0x00");
		});
	})

	describe('setLastUpdateTimestamp', () => {
		it('Reverts when lastUpdateTimestamp overflows', async () => {
			await expect(
			externalModuleFees.setLastUpdateTimestamp("0x01ffffffff")
			).to.be.revertedWith("0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)");
		});

		it('Should be able to set min value', async () => {
			externalModuleFees.setLastUpdateTimestamp("0xffffffff")
			const { lastUpdateTimestamp } = await externalModuleFees.decode();
			expect(lastUpdateTimestamp).to.eq("0xffffffff");
		});

		it('Should be able to set max value', async () => {
			externalModuleFees.setLastUpdateTimestamp("0x00")
			const { lastUpdateTimestamp } = await externalModuleFees.decode();
			expect(lastUpdateTimestamp).to.eq("0x00");
		});
	})
})