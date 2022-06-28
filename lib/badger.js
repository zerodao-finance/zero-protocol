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

exports.makeCompute = (CHAIN = "1") => {
  const quotes = Quotes(CHAIN);
  const GAS_COST = ethers.BigNumber.from(
    (() => {
      switch (CHAIN) {
        case "42161":
          return "480000";
        case "137":
          return "642000";
        case "43114":
          return "1240000";
        default:
          return "420000";
      }
    })()
  );
  const computeTransferOutput = async ({ module, amount }) => {
    switch (module) {
      case fixtures[quotes.chain.name].USDC:
        return await quotes.toUSDC(await deductMintFee(amount));
      case fixtures[quotes.chain.name].WBTC:
        return await deductMintFee(await quotes.getWbtcQuote(true, amount), 1);
      case fixtures[quotes.chain.name].renBTC:
        return await deductMintFee(amount);
      case ethers.constants.AddressZero:
        return await quotes.renBTCToETH(await deductMintFee(amount));
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

  const deductMintFee = async (amount) => {
    amount = ethers.BigNumber.from(amount);

    const feeAmounts = await applyFee(amount, mintFee);
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

    return await deductBurnFee(convertedAmount);
  };

  const applyFee = async (amountIn) => {
    const gasPrice = await quotes.chain.provider.getGasPrice();

    const gasFee = await computeRenBTCGasFee(
      GAS_COST.add(keeperReward.div(gasPrice)),
      gasPrice
    );

    const zeroProtocolFeeAmt = applyRatio(amountIn, burnFee);
    const renVmFeeAmt = applyRatio(amountIn, renVmFee);
    const opFee = zeroProtocolFeeAmt.add(renVmFeeAmt);

    const totalFees = gasFee.add(opFee);

    return { gasFee, zeroProtocolFeeAmt, renVmFeeAmt, opFee, totalFees };
  };

  const burnFee = (exports.burnFee = ethers.utils.parseEther("0.004"));
  const mintFee = (exports.mintFee = ethers.utils.parseEther("0.0025"));
  const renVmFee = (exports.mintFee = ethers.utils.parseEther("0.0015"));

  return {
    computeTransferOutput,
    computeOutputBTC,
    applyFee,
    computeRenBTCGasFee,
    getConvertedAmount,
  };
};
