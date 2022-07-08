import { expect } from "chai";
import {
  BigNumber,
  BigNumberish,
  constants,
  ContractTransaction,
  Wallet,
} from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { ethers, waffle } from "hardhat";
import keccak256 from "keccak256";
import _ from "lodash";
import {
  BtcVault,
  MockGatewayRegistry,
  TestERC20,
  MockBtcEthPriceOracle,
  MockGasPriceOracle,
  TestSignatureVerification,
  TestModule,
} from "../typechain-types";
import { expectTransfers } from "./shared/assertions";
import {
  e18,
  gwei,
  HALF_E18,
  ONE_E18,
  ONE_E8,
  toBN,
  TWO_E18,
} from "./shared/bn";
import {
  createBalanceCheckpoint,
  createSnapshot,
  faucet,
} from "./shared/chain";
import { deployContract } from "./shared/contracts";
import {
  EIP712_TransferRequestType,
  getApprovalDigest,
  getDomainSeparator,
  getTransferRequestDigest,
} from "./shared/eip712";
import {
  calculateBorrowFee,
  divE4RoundUp,
  getExpectedGlobalFees,
  getExpectedModuleFees,
  GlobalFees,
  makeArrayObject,
  ModuleFees,
} from "./shared/fees";
import { advanceTime } from "./shared/time";

const feesTimeToLive = 3600;
const DefaultDynamicBorrowFeeBips = 100;
const DefaultStaticBorrowFee = 1e5;
const DefaultWeiPerBitcoin = toBN(2, 19);
const DefaultGasPrice = gwei(10);

const omitNumericProperties = (obj: any) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => !key.match(/^\d+$/))
  );

const DefaultLoanGas = 200000;
const DefaultRepayGas = 300000;

describe("BtcVault", () => {
  const [lender, borrower] = waffle.provider.getWallets();

  let vault: BtcVault;
  let wbtc: TestERC20;
  let registry: MockGatewayRegistry;
  let btcEthPriceOracle: MockBtcEthPriceOracle;
  let gasPriceOracle: MockGasPriceOracle;
  let eip712: TestSignatureVerification;
  let reset: () => Promise<void>;
  let globalFees: GlobalFees;
  let moduleFees: ModuleFees;
  let module: TestModule;
  let dynamicBorrowFeeBips = DefaultDynamicBorrowFeeBips;
  let staticBorrowFee = DefaultStaticBorrowFee;
  let weiPerBitcoin = DefaultWeiPerBitcoin;
  let gasPrice = DefaultGasPrice;
  let domainSeparator: any;

  before(async () => {
    wbtc = await deployContract("TestERC20", 8);
    btcEthPriceOracle = await deployContract("MockBtcEthPriceOracle");
    gasPriceOracle = await deployContract("MockGasPriceOracle");
    registry = await deployContract("MockGatewayRegistry", wbtc.address);
    vault = await deployContract(
      "BtcVault",
      registry.address,
      wbtc.address,
      btcEthPriceOracle.address,
      gasPriceOracle.address,
      feesTimeToLive,
      dynamicBorrowFeeBips,
      staticBorrowFee
    );
    module = await deployContract("TestModule", wbtc.address);
    eip712 = await deployContract("TestSignatureVerification");
    reset = await createSnapshot();
    domainSeparator = getDomainSeparator("ZeroBTC", vault.address, "v0.1");
  });

  const addModule = async (
    defaultModule?: boolean,
    overrideRepay?: boolean
  ) => {
    const [address, moduleType] = defaultModule
      ? [constants.AddressZero, 0]
      : [module.address, overrideRepay ? 2 : 1];
    const tx = await vault.addModule(
      address,
      moduleType,
      DefaultLoanGas,
      DefaultRepayGas
    );
    moduleFees = await getExpectedModuleFees(
      globalFees,
      moduleType,
      DefaultLoanGas,
      DefaultRepayGas,
      tx
    );
    return tx;
  };

  const updatePrices = async (
    newWeiPerBitcoin: BigNumber,
    newGasPrice: BigNumber
  ) => {
    weiPerBitcoin = newWeiPerBitcoin;
    gasPrice = newGasPrice;
    await btcEthPriceOracle.setLatestAnswer(weiPerBitcoin);
    await gasPriceOracle.setLatestAnswer(gasPrice);
  };

  const updateGlobalFees = async (
    tx:
      | Promise<ContractTransaction>
      | ContractTransaction = vault.deployTransaction
  ) => {
    globalFees = await getExpectedGlobalFees(
      dynamicBorrowFeeBips,
      staticBorrowFee,
      weiPerBitcoin,
      gasPrice,
      tx
    );
  };

  const deposit = async (signer: Wallet, amount: BigNumber) => {
    await wbtc.mint(signer.address, amount);
    await wbtc.connect(signer).approve(vault.address, amount);
    await vault.connect(signer).deposit(amount, signer.address);
  };

  beforeEach(async () => {
    dynamicBorrowFeeBips = DefaultDynamicBorrowFeeBips;
    staticBorrowFee = DefaultStaticBorrowFee;
    weiPerBitcoin = DefaultWeiPerBitcoin;
    gasPrice = DefaultGasPrice;
    await updateGlobalFees();
    await reset();
  });

  describe("EIP712", () => {
    it("digestPermit", async () => {
      const permitTypeHash = await getApprovalDigest(
        eip712,
        { owner: lender.address, spender: lender.address, value: e18(1) },
        BigNumber.from(0),
        BigNumber.from(1000)
      );
      expect(
        await eip712.getPermitDigest(
          lender.address,
          lender.address,
          ONE_E18,
          1000,
          1,
          "0x".padEnd(66, "0"),
          "0x".padEnd(66, "0")
        )
      ).to.eq(permitTypeHash);
    });

    it("digestTransferRequest", async () => {
      const transferRequestDigest = await getTransferRequestDigest(
        eip712,
        lender.address,
        ONE_E18,
        borrower.address,
        TWO_E18,
        "0x".padEnd(66, "a")
      );
      expect(
        await eip712.getTransferRequestDigest(
          lender.address,
          ONE_E18,
          borrower.address,
          TWO_E18,
          "0x00",
          "0x".padEnd(66, "a")
        )
      ).to.eq(transferRequestDigest);
    });
  });

  describe("Constants", () => {
    it("name", async () => {
      expect(await vault.name()).to.eq("ZeroBTC");
    });

    it("symbol", async () => {
      expect(await vault.symbol()).to.eq("ZBTC");
    });

    it("version", async () => {
      expect(await vault.version()).to.eq("v0.1");
    });

    it("gasPriceOracle", async () => {
      expect(await vault.gasPriceOracle()).to.eq(gasPriceOracle.address);
    });
    it("btcEthPriceOracle", async () => {
      expect(await vault.btcEthPriceOracle()).to.eq(btcEthPriceOracle.address);
    });
    it("feesTimeToLive", async () => {
      expect(await vault.feesTimeToLive()).to.eq(feesTimeToLive);
    });
    it("gatewayRegistry", async () => {
      expect(await vault.gatewayRegistry()).to.eq(registry.address);
    });
  });

  describe("ERC4626", () => {
    const prepareDeposit = async (amount: BigNumber = ONE_E18) => {
      await wbtc.approve(vault.address, amount);
      await wbtc.mint(lender.address, amount);
    };

    describe("deposit", () => {
      it("Starts at 1:1", async () => {
        await prepareDeposit(ONE_E18);
        const tx = vault.deposit(ONE_E18, lender.address);
        await expectTransfers(tx, [
          [wbtc, lender.address, vault.address, ONE_E18],
          [vault, constants.AddressZero, lender.address, ONE_E18],
        ]);
        await expect(tx)
          .to.emit(vault, "Deposit")
          .withArgs(lender.address, lender.address, ONE_E18, ONE_E18);
        expect(await vault.balanceOf(lender.address)).to.eq(ONE_E18);
        expect(await vault.totalSupply()).to.eq(ONE_E18);
      });

      it("Mints tokens at conversion ratio", async () => {
        await prepareDeposit(TWO_E18);
        await expectTransfers(vault.deposit(ONE_E18, lender.address), [
          [wbtc, lender.address, vault.address, ONE_E18],
          [vault, constants.AddressZero, lender.address, ONE_E18],
        ]);
        await wbtc.mint(vault.address, ONE_E18);
        const tx = vault.deposit(ONE_E18, lender.address);
        await expect(tx)
          .to.emit(vault, "Deposit")
          .withArgs(lender.address, lender.address, ONE_E18, HALF_E18);
        expect(await vault.balanceOf(lender.address)).to.eq(
          ONE_E18.add(HALF_E18)
        );
        expect(await vault.totalSupply()).to.eq(ONE_E18.add(HALF_E18));
      });

      it("Reverts if transfer fails", async () => {
        await expect(vault.deposit(1, lender.address)).to.be.revertedWith(
          "TRANSFER_FROM_FAILED"
        );
      });
    });

    describe("mint", () => {
      it("Starts at 1:1", async () => {
        await prepareDeposit(ONE_E18);
        const tx = vault.mint(ONE_E18, lender.address);
        await expectTransfers(tx, [
          [wbtc, lender.address, vault.address, ONE_E18],
          [vault, constants.AddressZero, lender.address, ONE_E18],
        ]);
        await expect(tx)
          .to.emit(vault, "Deposit")
          .withArgs(lender.address, lender.address, ONE_E18, ONE_E18);
        expect(await vault.balanceOf(lender.address)).to.eq(ONE_E18);
        expect(await vault.totalSupply()).to.eq(ONE_E18);
      });

      it("Mints tokens at conversion ratio", async () => {
        await prepareDeposit(TWO_E18);
        await expectTransfers(vault.mint(ONE_E18, lender.address), [
          [wbtc, lender.address, vault.address, ONE_E18],
          [vault, constants.AddressZero, lender.address, ONE_E18],
        ]);
        await wbtc.mint(vault.address, ONE_E18);
        const tx = vault.mint(HALF_E18, lender.address);
        await expect(tx)
          .to.emit(vault, "Deposit")
          .withArgs(lender.address, lender.address, ONE_E18, HALF_E18);
        expect(await vault.balanceOf(lender.address)).to.eq(
          ONE_E18.add(HALF_E18)
        );
        expect(await vault.totalSupply()).to.eq(ONE_E18.add(HALF_E18));
      });

      it("Reverts if transfer fails", async () => {
        await expect(vault.mint(1, lender.address)).to.be.revertedWith(
          "TRANSFER_FROM_FAILED"
        );
      });
    });
  });

  describe("getGlobalFees", () => {
    it("getGlobalFees", async () => {
      const { ...fees } = omitNumericProperties(await vault.getGlobalFees());
      expect(fees).to.deep.eq(globalFees);
    });
  });

  describe("pokeGlobalFees", () => {
    it("Does nothing if cache is not expired", async () => {
      await expect(vault.pokeGlobalFees()).to.not.emit(
        vault,
        "GlobalFeesCacheUpdated"
      );
    });

    it("Updates cache if it has expired", async () => {
      await updatePrices(weiPerBitcoin.div(2), gasPrice.div(2));
      await advanceTime(feesTimeToLive);
      const tx = vault.pokeGlobalFees();
      await updateGlobalFees(tx);
      await expect(tx)
        .to.emit(vault, "GlobalFeesCacheUpdated")
        .withArgs(globalFees.satoshiPerEth, globalFees.gweiPerGas);

      const { ...fees } = omitNumericProperties(await vault.getGlobalFees());
      expect(fees).to.deep.eq(globalFees);
    });
  });

  describe("addModule", () => {
    it("Reverts if module asset does not match", async () => {
      const badModule = await deployContract(
        "TestModule",
        constants.AddressZero
      );
      await expect(
        vault.addModule(badModule.address, 0, 0, 0)
      ).to.be.revertedWith(
        'ModuleAssetDoesNotMatch("0x0000000000000000000000000000000000000000")'
      );
    });

    it("Reverts if module type is null and address is not zero", async () => {
      await expect(vault.addModule(module.address, 0, 0, 0)).to.be.revertedWith(
        "InvalidModuleType()"
      );
    });

    it("Reverts if module type is not null and address is zero", async () => {
      await expect(
        vault.addModule(constants.AddressZero, 2, 0, 0)
      ).to.be.revertedWith("InvalidModuleType()");
    });

    it("Initializes module fees", async () => {
      const tx = await addModule(false, false);

      await expect(tx)
        .to.emit(vault, "ModuleFeesUpdated")
        .withArgs(
          module.address,
          1,
          moduleFees.loanGasE4,
          moduleFees.repayGasE4
        );
      const { ...fees } = omitNumericProperties(
        await vault.getModuleFees(module.address)
      );
      expect(fees).to.deep.eq(moduleFees);
    });
  });

  describe("loan", () => {
    describe("Module with loan override", () => {
      let defaultTransferRequest: any;
      let domainSeparator: any;
      before(() => {
        domainSeparator = getDomainSeparator("ZeroBTC", vault.address, "v0.1");
        defaultTransferRequest = {
          asset: wbtc.address,
          amount: ONE_E8,
          module: module.address,
          nonce: 0,
          data: defaultAbiCoder.encode(["uint256"], [toBN(1, 7)]),
        };
      });
      it("Reverts if module not approved", async () => {
        await expect(
          vault.loan(
            constants.AddressZero,
            borrower.address,
            lender.address,
            0,
            "0x00",
            "0x00"
          )
        ).to.be.revertedWith("ModuleNotApproved");
      });

      it("Reverts if signature is invalid", async () => {
        await addModule();
        await expect(
          vault.loan(
            module.address,
            borrower.address,
            lender.address,
            0,
            "0x00",
            "0x00"
          )
        ).to.be.revertedWith("ECDSA: invalid signature length");
      });

      it("Reverts if signature not from borrower", async () => {
        await addModule();
        const signature = await lender._signTypedData(
          domainSeparator,
          EIP712_TransferRequestType,
          defaultTransferRequest
        );
        await expect(
          vault.loan(
            module.address,
            borrower.address,
            ONE_E18,
            0,
            signature,
            defaultTransferRequest.data
          )
        ).to.be.revertedWith("InvalidSigner");
      });

      it("Should accept loan with valid signature", async () => {
        await addModule(false, true);
        await deposit(lender, ONE_E8);
        const signature = await borrower._signTypedData(
          domainSeparator,
          EIP712_TransferRequestType,
          defaultTransferRequest
        );
        const getBalanceDifference = await createBalanceCheckpoint(
          null,
          lender.address
        );
        await faucet(vault.address);
        const tx = await vault.loan(
          module.address,
          borrower.address,
          ONE_E8,
          0,
          signature,
          defaultTransferRequest.data
        );
        const fees = await calculateBorrowFee(globalFees, moduleFees, ONE_E8);
        const realBorrowAmount = ONE_E8.sub(fees);
        const moduleBurnAmount = ONE_E8.div(10);
        await expect(tx)
          // Check module executed correctly
          .to.emit(wbtc, "Transfer")
          .withArgs(vault.address, constants.AddressZero, moduleBurnAmount)
          .to.emit(wbtc, "Transfer")
          .withArgs(
            vault.address,
            borrower.address,
            realBorrowAmount.sub(moduleBurnAmount)
          )
          // Check loaned shares were transferred
          .to.emit(vault, "Transfer")
          .withArgs(lender.address, vault.address, realBorrowAmount);
        expect(await getBalanceDifference(tx)).to.eq(moduleFees.loanRefundEth);
      });
    });

    describe("Default module", () => {
      let defaultTransferRequest: any;
      let domainSeparator: any;
      let digest: BigNumber;
      before(() => {
        domainSeparator = getDomainSeparator("ZeroBTC", vault.address, "v0.1");
        defaultTransferRequest = {
          asset: wbtc.address,
          amount: ONE_E8,
          module: constants.AddressZero,
          nonce: 0,
          data: "0x",
        };
        digest = BigNumber.from(
          getTransferRequestDigest(
            vault,
            wbtc.address,
            ONE_E8,
            constants.AddressZero,
            BigNumber.from(0),
            "0x"
          )
        );
      });
      it("Reverts if module not approved", async () => {
        await expect(
          vault.loan(
            constants.AddressZero,
            borrower.address,
            lender.address,
            0,
            "0x00",
            "0x00"
          )
        ).to.be.revertedWith("ModuleNotApproved");
      });

      it("Reverts if signature not from borrower", async () => {
        await addModule(true);
        const signature = await lender._signTypedData(
          domainSeparator,
          EIP712_TransferRequestType,
          defaultTransferRequest
        );
        await expect(
          vault.loan(
            constants.AddressZero,
            borrower.address,
            ONE_E18,
            0,
            signature,
            defaultTransferRequest.data
          )
        ).to.be.revertedWith("InvalidSigner");
      });

      it("Should accept loan with valid signature", async () => {
        await addModule(true);
        await deposit(lender, ONE_E8);
        const signature = await borrower._signTypedData(
          domainSeparator,
          EIP712_TransferRequestType,
          defaultTransferRequest
        );
        const getBalanceDifference = await createBalanceCheckpoint(
          null,
          lender.address
        );
        await faucet(vault.address);
        const tx = await vault.loan(
          constants.AddressZero,
          borrower.address,
          ONE_E8,
          0,
          signature,
          defaultTransferRequest.data
        );
        const fees = await calculateBorrowFee(globalFees, moduleFees, ONE_E8);
        const realBorrowAmount = ONE_E8.sub(fees);
        await expect(tx)
          .to.emit(wbtc, "Transfer")
          .withArgs(vault.address, borrower.address, realBorrowAmount)
          // Check loaned shares were transferred
          .to.emit(vault, "Transfer")
          .withArgs(lender.address, vault.address, realBorrowAmount)
          .to.emit(vault, "LoanCreated")
          .withArgs(
            lender.address,
            borrower.address,
            digest,
            realBorrowAmount,
            realBorrowAmount
          );
        expect(await getBalanceDifference(tx)).to.eq(moduleFees.loanRefundEth);
      });
    });
  });

  describe("repay", () => {
    const takeLoan = async (module: string, data: string) => {
      const transferRequest = {
        asset: wbtc.address,
        amount: ONE_E8,
        module,
        nonce: 0,
        data,
      };
      const loanId = BigNumber.from(
        getTransferRequestDigest(
          vault,
          wbtc.address,
          ONE_E8,
          module,
          BigNumber.from(0),
          data
        )
      );
      await deposit(lender, ONE_E8);
      const signature = await lender._signTypedData(
        domainSeparator,
        EIP712_TransferRequestType,
        transferRequest
      );
      await vault.loan(module, borrower.address, ONE_E8, 0, signature, data);
      return loanId;
    };
    describe("Default module", () => {});
  });
});
