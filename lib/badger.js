"use strict";
const ethers = require("ethers");
const fixtures = require("./fixtures");
const Quotes = require("./quotes");
const RenJS = require("@renproject/ren");
const {
  Bitcoin,
  Zcash,
  Arbitrum,
  Avalanche,
  Polygon,
  Ethereum,
  Optimism,
} = require("@renproject/chains");
const { RPC_ENDPOINTS } = require("../dist/lib/deployment-utils");

const keeperReward = ethers.utils.parseEther("0.001");

const getProvider = (chainName) => {
  return new ethers.providers.JsonRpcProvider(RPC_ENDPOINTS[chainName]);
};

const getChainName = (chainId) => {
  switch (chainId) {
    case "42161":
      return "Arbitrum";
    case "43114":
      return "Avalanche";
    case "137":
      return "Polygon";
    case "1":
      return "Mainnet";
    case "10":
      return "Optimism";
    default:
      return "Unsupported Chain";
  }
};

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

  const bitcoin = new Bitcoin({ network: "mainnet" });
  const zcash = new Zcash({ network: "mainnet" });
  const arbitrum = new Arbitrum({
    provider: getProvider("Arbitrum"),
    network: "mainnet",
  });
  const avalanche = new Avalanche({
    provider: getProvider("Avalanche"),
    network: "mainnet",
  });
  const polygon = new Polygon({
    provider: getProvider("Polygon"),
    network: "mainnet",
  });
  const optimism = new Optimism({
    provider: getProvider("Optimism"),
    network: "mainnet",
  });
  const ethereum = new Ethereum({
    provider: getProvider("Ethereum"),
    network: "mainnet",
  });
  const renJS = new RenJS.RenJS("mainnet").withChains(
    bitcoin,
    zcash,
    arbitrum,
    avalanche,
    polygon,
    optimism,
    ethereum
  );

  const computeTransferOutput = async ({ module, amount, primaryToken }) => {
    if (primaryToken == "ZEC") {
      switch (module) {
        case fixtures["ETHEREUM"].renZEC:
          return await deductMintFee(amount, primaryToken);
        case fixtures["ETHEREUM"].ETH:
          return await quotes.renZECToETH(
            await deductMintFee(amount, primaryToken)
          );
        default:
          console.error("no asset found for getConvertedAmount:" + module);
          return ethers.BigNumber.from("0");
      }
    }
    switch (module) {
      case fixtures[quotes.chain.name].USDC:
        return await quotes.toUSDC(await deductMintFee(amount, primaryToken));
      case fixtures[quotes.chain.name].WBTC:
        return await deductMintFee(await quotes.getWbtcQuote(true, amount), 1);
      case fixtures[quotes.chain.name].renBTC:
        return await deductMintFee(amount);
      case fixtures[quotes.chain.name].USDT:
        return await quotes.getUSDTQuote(true, await deductMintFee(amount, primaryToken));
      case ethers.constants.AddressZero:
        return await quotes.renBTCToETH(
          await deductMintFee(amount, primaryToken)
        );
      default:
        return ethers.BigNumber.from("0");
    }
  };

  const computeGasFee = (gasCost, gasPrice, primaryToken) => {
    switch (primaryToken) {
      case "ZEC":
        return computeRenZECGasFee(gasCost, gasPrice);
      default:
        return computeRenBTCGasFee(gasCost, gasPrice);
    }
  };

  const computeRenBTCGasFee = async (gasCost, gasPrice) => {
    return gasCost
      .mul(gasPrice)
      .mul(await quotes.getRenBTCForOneETHPrice())
      .div(ethers.utils.parseEther("1"));
  };

  const computeRenZECGasFee = async (gasCost, gasPrice) => {
    return gasCost
      .mul(gasPrice)
      .mul(await quotes.ETHToRenZEC(ethers.utils.parseEther("1")))
      .div(ethers.utils.parseEther("1"));
  };

  const deductBurnFee = async (amount, primaryToken) => {
    amount = ethers.BigNumber.from(amount);

    const feeAmounts = await applyFee(
      amount,
      burnFee,
      renVmFeeBurn,
      primaryToken
    );
    const amountAfterDeduction = amount.sub(feeAmounts.totalFees);
    return amountAfterDeduction <= 0 ? 0 : amountAfterDeduction;
  };

  const deductMintFee = async (amount, primaryToken) => {
    amount = ethers.BigNumber.from(amount);

    const feeAmounts = await applyFee(
      amount,
      mintFee,
      renVmFeeMint,
      primaryToken
    );
    const amountAfterDeduction = amount.sub(feeAmounts.totalFees);
    return amountAfterDeduction <= 0 ? 0 : amountAfterDeduction;
  };

  const getConvertedAmount = (exports.getConvertedAmount = async (
    asset,
    amount,
    primaryToken
  ) => {
    if (primaryToken == "ZEC") {
      switch (asset) {
        case fixtures["ETHEREUM"].renZEC:
          return amount;
        case fixtures["ETHEREUM"].ETH:
          return await quotes.ETHToRenZEC(amount);
        default:
          console.error("no asset found for getConvertedAmount:" + asset);
          return amount;
      }
    }
    switch (asset) {
      case fixtures[quotes.chain.name].WBTC:
        return await quotes.getWbtcQuote(false, amount);
      case fixtures[quotes.chain.name].renBTC:
        return amount;
      case fixtures[quotes.chain.name].USDC:
        return await quotes.fromUSDC(amount);
      case fixtures[quotes.chain.name].USDT:
        return await quotes.getUSDTQuote(false, amount);
      case ethers.constants.AddressZero:
        return await quotes.ETHtoRenBTC(amount);
      default:
        console.error("no asset found for getConvertedAmount:" + asset);
        return amount;
    }
  });

  const computeOutputBTC = async (burnRequest) => {
    const { asset, amount, primaryToken } = burnRequest;
    const convertedAmount = await getConvertedAmount(
      asset,
      amount,
      primaryToken
    );

    return await deductBurnFee(convertedAmount, primaryToken);
  };

  const selectNetwork = (primaryToken) => {
    switch (primaryToken) {
      case "ZEC":
        return { network: "Zcash", asset: "ZEC" };
      default:
        return { network: "Bitcoin", asset: "BTC" };
    }
  };

  const applyFee = async (amountIn, zeroFee, renVmFee, primaryToken) => {
    const gasPrice = await quotes.chain.provider.getGasPrice();
    const { network, asset } = selectNetwork(primaryToken);

    const gasFee = await computeGasFee(
      GAS_COST.add(keeperReward.div(gasPrice)),
      gasPrice,
      primaryToken
    );

    const evmChain =
      getChainName(CHAIN) == "Mainnet" ? "Ethereum" : getChainName(CHAIN);
    let renOutput = ethers.utils.parseUnits("0", 8);

    try {
      const renVmFees = await renJS.getFees({
        asset: asset,
        from: zeroFee == mintFee ? network : evmChain,
        to: zeroFee == burnFee ? network : evmChain,
      });
      renOutput = ethers.BigNumber.from(
        renVmFees.estimateOutput(amountIn.toString()).toFixed()
      );
    } catch (e) {
      console.error("error getting renVM fees", e);
      renOutput = amountIn.sub(ethers.utils.parseUnits("0.004", 8));
    }

    const zeroProtocolFeeAmt = applyRatio(amountIn, zeroFee);
    const renVmFeeAmt = applyRatio(amountIn, renVmFee);
    const renVmBtcNetworkFee = amountIn.sub(renOutput).sub(renVmFeeAmt);
    const opFee = zeroProtocolFeeAmt.add(renVmFeeAmt);

    var totalFees = gasFee.add(opFee);
    totalFees = totalFees.add(renVmBtcNetworkFee);

    return {
      gasFee,
      zeroProtocolFeeAmt,
      renVmFeeAmt,
      renVmBtcNetworkFee,
      opFee,
      totalFees,
    };
  };

  const burnFee = ethers.utils.parseEther("0.003");
  const renVmFeeBurn = ethers.utils.parseEther("0.001");
  const mintFee = ethers.utils.parseEther("0.002");
  const renVmFeeMint = ethers.utils.parseEther("0.002");

  return {
    computeTransferOutput,
    computeOutputBTC,
    applyFee,
    burnFee,
    mintFee,
    renVmFeeBurn,
    renVmFeeMint,
    computeRenBTCGasFee,
    getConvertedAmount,
  };
};
