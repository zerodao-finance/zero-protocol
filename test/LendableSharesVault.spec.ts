import { expect } from "chai";
import { BigNumber, constants } from "ethers";
import { ethers, waffle } from "hardhat";
import { TestLendableSharesVault, TestERC20 } from "../typechain-types";
import { expectOverflowPanic, expectTransfers } from "./shared/assertions";
import { HALF_E18, MaxUint128, ONE_E18, TWO_E18 } from "./shared/bn";
import { createSnapshot } from "./shared/chain";
import { deployContract } from "./shared/contracts";

describe("BtcVault", () => {
  const [wallet, wallet1] = waffle.provider.getWallets();

  let vault: TestLendableSharesVault;
  let wbtc: TestERC20;
  let reset: () => Promise<void>;

  before(async () => {
    wbtc = await deployContract("TestERC20", 8);
    vault = await deployContract("TestLendableSharesVault", wbtc.address);
    reset = await createSnapshot();
  });

  beforeEach(async () => {
    await reset();
  });
  const prepareDeposit = async (amount: BigNumber = ONE_E18) => {
    await wbtc.approve(vault.address, amount);
    await wbtc.mint(wallet.address, amount);
  };

  describe("_borrowFrom", () => {
    // it("Reverts if lender has insufficient shares", async () => {
    //   await expectOverflowPanic(
    //     vault.borrowFrom(ONE_E18, wallet.address, wallet1.address, ONE_E18)
    //   );
    // });

    it("Transfers shares from lender to contract", async () => {
      await prepareDeposit(TWO_E18);
      await vault.deposit(ONE_E18, wallet.address);
      // (lender, borrower, loanId, borrowAmount, shares)
      const tx = vault.borrowFrom(
        ONE_E18,
        wallet.address,
        wallet1.address,
        ONE_E18
      );
      await expectTransfers(tx, [
        // Verify transfer of lender => vault
        [vault, wallet.address, vault.address, ONE_E18],
        // Verify transfer of vault => borrower to make sure test contract works
        [wbtc, vault.address, wallet1.address, ONE_E18],
      ]);
      await expect(tx)
        .to.emit(vault, "LoanCreated")
        .withArgs(wallet.address, wallet1.address, ONE_E18, ONE_E18, ONE_E18);
      // Verify totalAssets compensates for borrowed assets
      expect(await vault.totalAssets()).to.eq(ONE_E18);
      // Verify totalBorrowedAssets increases
      expect(await vault.totalBorrowedAssets()).to.eq(ONE_E18);
      const { assetsBorrowed, sharesLocked } = await vault.outstandingLoans(
        wallet.address,
        ONE_E18
      );
      expect(assetsBorrowed).to.eq(ONE_E18);
      expect(sharesLocked).to.eq(ONE_E18);
      // Check deposit functions as expected
      await expectTransfers(vault.deposit(ONE_E18, wallet.address), [
        // Verify transfer of lender => vault
        [vault, constants.AddressZero, wallet.address, ONE_E18],
        // Verify transfer of vault => borrower to make sure test contract works
        [wbtc, wallet.address, vault.address, ONE_E18],
      ]);
      expect(await vault.totalAssets()).to.eq(TWO_E18);
    });

    it("Reverts if loan id not unique", async () => {
      await prepareDeposit(TWO_E18);
      await vault.deposit(TWO_E18, wallet.address);
      await vault.borrowFrom(
        BigNumber.from(1),
        wallet.address,
        wallet1.address,
        ONE_E18
      );
      await expect(
        vault.borrowFrom(
          BigNumber.from(1),
          wallet.address,
          wallet1.address,
          ONE_E18
        )
      ).to.be.revertedWith("LoanIdNotUnique(1)");
    });

    it("Reverts if borrowAmount exceeds max uint128", async () => {
      await prepareDeposit(ONE_E18);
      await vault.deposit(ONE_E18, wallet.address);
      await wbtc.mint(vault.address, MaxUint128);
      await expectOverflowPanic(
        vault.borrowFrom(ONE_E18, wallet.address, wallet1.address, MaxUint128)
      );
    });

    it("Reverts if shares exceeds max uint128", async () => {
      await prepareDeposit(ONE_E18);
      await vault.deposit(ONE_E18, wallet.address);
      await vault.freeMint(vault.address, MaxUint128);

      await expectOverflowPanic(
        vault.borrowFrom(ONE_E18, wallet.address, wallet1.address, ONE_E18)
      );
    });

    it("Reverts if totalBorrowedAmount exceeds max uint128", async () => {
      await prepareDeposit(ONE_E18);
      await vault.deposit(ONE_E18, wallet.address);
      await wbtc.mint(vault.address, MaxUint128);
      await vault.borrowFrom(
        ONE_E18,
        wallet.address,
        wallet1.address,
        MaxUint128.div(2)
      );
      await expectOverflowPanic(
        vault.borrowFrom(
          TWO_E18,
          wallet.address,
          wallet1.address,
          MaxUint128.div(2)
        )
      );
    });
  });

  describe("_repayTo", () => {
    it("Repays and deletes an existing loan", async () => {
      await prepareDeposit(TWO_E18);
      await vault.deposit(ONE_E18, wallet.address);
      let gasCost = await vault.estimateGas.borrowFrom(
        1,
        wallet.address,
        wallet1.address,
        ONE_E18
      );
      console.log(`Borrow Gas Cost: ${gasCost.toNumber()}`);
      await vault.borrowFrom(1, wallet.address, wallet1.address, ONE_E18);
      gasCost = await vault.estimateGas.repayTo(wallet.address, 1, ONE_E18);
      const tx = vault.repayTo(wallet.address, 1, ONE_E18);
      console.log(`Repay Gas Cost: ${gasCost.toNumber()}`);
      await expectTransfers(tx, [
        // Verify transfer of lender => vault to make sure test contract works
        [wbtc, wallet.address, vault.address, ONE_E18],
        // Verify transfer of vault => lender
        [vault, vault.address, wallet.address, ONE_E18],
      ]);
      await expect(tx)
        .to.emit(vault, "LoanClosed")
        .withArgs(1, ONE_E18, ONE_E18, 0);
      // Verify borrowed assets are reduced
      expect(await vault.totalBorrowedAssets()).to.eq(0);
      expect(await vault.totalAssets()).to.eq(ONE_E18);
      const { assetsBorrowed, sharesLocked } = await vault.outstandingLoans(
        wallet.address,
        1
      );
      expect(sharesLocked).to.eq(0);
      expect(assetsBorrowed).to.eq(0);
    });

    it("Reverts if loan does not exist", async () => {
      await prepareDeposit(TWO_E18);
      await vault.deposit(ONE_E18, wallet.address);
      await expect(
        vault.repayTo(wallet.address, 1, ONE_E18)
      ).to.be.revertedWith("LoanDoesNotExist(1)");
    });

    it("Burns shares on partial repayment", async () => {
      await prepareDeposit(TWO_E18);
      await vault.deposit(ONE_E18, wallet.address);
      await vault.borrowFrom(1, wallet.address, wallet1.address, ONE_E18);
      const tx = vault.repayTo(wallet.address, 1, HALF_E18);
      await expectTransfers(tx, [
        // Verify transfer of lender => vault to make sure test contract works
        [wbtc, wallet.address, vault.address, ONE_E18],
        // Verify transfer of vault => lender
        [vault, vault.address, wallet.address, HALF_E18],
        // Verify partial burn
        [vault, vault.address, constants.AddressZero, HALF_E18],
      ]);
      await expect(tx)
        .to.emit(vault, "LoanClosed")
        .withArgs(1, HALF_E18, HALF_E18, HALF_E18);
      expect(await vault.totalBorrowedAssets()).to.eq(0);
      expect(await vault.totalAssets()).to.eq(HALF_E18);
      expect(await vault.totalSupply()).to.eq(HALF_E18);
    });

    it("Works with null repayment", async () => {
      await prepareDeposit(TWO_E18);
      await vault.deposit(ONE_E18, wallet.address);
      await vault.borrowFrom(1, wallet.address, wallet1.address, ONE_E18);
      const tx = vault.repayTo(wallet.address, 1, 0);
      await expectTransfers(tx, [
        // Verify transfer of lender => vault to make sure test contract works
        [wbtc, wallet.address, vault.address, 0],
        // Verify partial burn
        [vault, vault.address, constants.AddressZero, ONE_E18],
      ]);
      await expect(tx).to.emit(vault, "LoanClosed").withArgs(1, 0, 0, ONE_E18);
      expect(await vault.totalBorrowedAssets()).to.eq(0);
      expect(await vault.totalAssets()).to.eq(0);
      expect(await vault.totalSupply()).to.eq(0);
    });

    it("Works with overpayment", async () => {
      await prepareDeposit(TWO_E18);
      await vault.deposit(ONE_E18, wallet.address);
      await vault.borrowFrom(1, wallet.address, wallet1.address, HALF_E18);
      const tx = vault.repayTo(wallet.address, 1, ONE_E18);
      await expectTransfers(tx, [
        // Verify transfer of lender => vault to make sure test contract works
        [wbtc, wallet.address, vault.address, ONE_E18],
        // Verify transfer of vault => lender
        [vault, vault.address, constants.AddressZero, HALF_E18],
      ]);
      await expect(tx).to.emit(vault, "LoanClosed").withArgs(1, 0, 0, ONE_E18);
      expect(await vault.totalBorrowedAssets()).to.eq(0);
      expect(await vault.totalAssets()).to.eq(ONE_E18.add(HALF_E18));
      expect(await vault.totalSupply()).to.eq(ONE_E18);
    });
  });
});
