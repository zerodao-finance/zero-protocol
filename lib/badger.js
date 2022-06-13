"use strict";

const ethers = require("ethers");
const fixtures = require("./fixtures");
const UNISWAP = require("@uniswap/sdk");
const Quotes = require("./quotes");
const { Route } = require("@uniswap/sdk");

const keeperReward = ethers.utils.parseEther("0.001");

const applyRatio = (amount, ratio) => {
  return ethers.BigNumber.from(amount)
    .mul(ratio)
    .div(ethers.utils.parseEther("1"));
};

const burnFee = (exports.burnFee = ethers.utils.parseEther("0.004"));
const mintFee = (exports.mintFee = ethers.utils.parseEther("0.0025"));

const applyRenVMFee = (exports.applyRenVMFee = (input) => {
  input = ethers.BigNumber.from(input);
  return input
    .mul(ethers.utils.parseEther("0.9985"))
    .div(ethers.utils.parseEther("1"));
});

const applyRenVMMintFee = (exports.applyRenVMMintFee = (input) => {
  input = ethers.BigNumber.from(input);
  const result = input
    .mul(ethers.utils.parseEther("0.9985"))
    .div(ethers.utils.parseEther("1"))
    .sub(ethers.utils.parseUnits("0.001", 8));
  return result;
});

exports.makeCompute = (CHAIN) => {
  const quotes = Quotes(CHAIN);
  const GAS_COST = ethers.BigNumber.from(
    (() => {
      switch (CHAIN) {
        case "ARBITRUM":
          return "480000";
        case "AVALANCHE":
          return "124000";
        default:
          return "420000";
      }
    })()
  );
  const computeTransferOutput = async ({ module, amount }) => {
    switch (module) {
      case fixtures[quotes.chain.name].USDC:
        return await quotes.toUSDC(
          await deductMintFee(applyRenVMMintFee(amount))
        );
      case fixtures[quotes.chain.name].WBTC:
        return await deductMintFee(
          await quotes.getWbtcQuote(true, applyRenVMMintFee(amount)),
          1
        );
      case fixtures[quotes.chain.name].renBTC:
        return await deductMintFee(applyRenVMMintFee(amount));
      case ethers.constants.AddressZero:
        return await quotes.renBTCToETH(
          await deductMintFee(applyRenVMMintFee(amount))
        );
      default:
        return ethers.BigNumber.from("0");
    }
  };

  const computeRenBTCGasFee = async (gasCost, gasPrice) => {
    return gasCost
      .mul(gasPrice)
      .mul(await quotes.getRenBTCForOneETHPrice())
      .div(ethers.utils.parseEther("1"));
  };
  const deductBurnFee = async (amount, multiplier) => {
    amount = ethers.BigNumber.from(amount);

    const feeAmounts = await applyFee(amount, burnFee, multiplier);
    const amountAfterDeduction = amount.sub(feeAmounts.totalFees);
    return amountAfterDeduction <= 0 ? 0 : amountAfterDeduction;
  };

  const deductMintFee = async (amount, multiplier) => {
    amount = ethers.BigNumber.from(amount);

    const feeAmounts = await applyFee(amount, mintFee, multiplier);
    const amountAfterDeduction = amount.sub(feeAmounts.totalFees);
    return amountAfterDeduction <= 0 ? 0 : amountAfterDeduction;
  };
  const getConvertedAmount = (exports.getConvertedAmount = async (
    asset,
    amount
  ) => {
    switch (asset) {
      case fixtures[quotes.chain.name].WBTC:
        return await quotes.getWbtcQuote(false, amount);
      case fixtures[quotes.chain.name].renBTC:
        return amount;
      case fixtures[quotes.chain.name].USDC:
        return await quotes.fromUSDC(amount);
      case ethers.constants.AddressZero:
        return await quotes.ETHtoRenBTC(amount);
      default:
        console.error("no asset found for getConvertedAmount:" + asset);
        return amount;
    }
  });

  const computeOutputBTC = async (burnRequest) => {
    const { asset, amount } = burnRequest;
    const convertedAmount = await getConvertedAmount(asset, amount);

    switch (asset) {
      case fixtures[quotes.chain.name].WBTC:
        return await deductBurnFee(applyRenVMFee(convertedAmount));
      case fixtures[quotes.chain.name].renBTC:
        return await deductBurnFee(applyRenVMFee(convertedAmount));
      case fixtures[quotes.chain.name].USDC:
        return await deductBurnFee(applyRenVMFee(convertedAmount));
      case ethers.constants.AddressZero:
        return await deductBurnFee(applyRenVMFee(convertedAmount));
      default:
        console.error("no asset found for computeOutputBTC:" + asset);
        return burnRequest.amount;
    }
  };

  const applyFee = async (amountIn, fee, multiplier) => {
    const gasPrice = await quotes.chain.provider.getGasPrice();

    const gasFee = await computeRenBTCGasFee(
      GAS_COST.add(keeperReward.div(gasPrice)),
      gasPrice
    );
    const opFee = applyRatio(amountIn, fee);
    const totalFees = gasFee.add(opFee);

    return { gasFee: gasFee, opFee: opFee, totalFees: totalFees };
  };

  return {
    computeTransferOutput,
    computeOutputBTC,
    applyFee,
    computeRenBTCGasFee,
  };
};
