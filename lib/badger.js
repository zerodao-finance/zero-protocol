"use strict";

const ethers = require("ethers");
const fixtures = require("./fixtures");
const UNISWAP = require("@uniswap/sdk");
const { Route } = require("@uniswap/sdk");

const provider = new ethers.providers.InfuraProvider(
  "mainnet",
  "816df2901a454b18b7df259e61f92cd2"
);

const quoter = new ethers.Contract(
  "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  [
    "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) public view returns (uint256 amountOut)",
    "function quoteExactInput(bytes path, uint256 amountIn) public view returns (uint256 amountOut)",
  ],
  provider
);

const getRenBTCForOneETHPrice = async () => {
  const renBTC = new UNISWAP.Token(
    UNISWAP.ChainId.MAINNET,
    fixtures.ETHEREUM.renBTC,
    8
  );
  const pair = await UNISWAP.Fetcher.fetchPairData(
    renBTC,
    UNISWAP.WETH[renBTC.chainId],
    provider
  );
  const route = new Route([pair], UNISWAP.WETH[renBTC.chainId]);

  const renBTCForOneEth = route.midPrice.toSignificant(7);
  return ethers.utils.parseUnits(renBTCForOneEth, 8);
};

const computeRenBTCGasFee = async (gasCost, gasPrice) => {
  return gasCost
    .mul(gasPrice)
    .mul(await getRenBTCForOneETHPrice())
    .div(ethers.utils.parseEther("1"));
};

const GAS_COST = ethers.BigNumber.from("370000");
const keeperReward = ethers.utils.parseEther("0.001");

const applyRatio = (amount, ratio) => {
  return ethers.BigNumber.from(amount)
    .mul(ratio)
    .div(ethers.utils.parseEther("1"));
};

const applyFee = (exports.applyFee = async (amountIn, fee, multiplier) => {
  const gasPrice = await provider.getGasPrice();

  const gasFee = await computeRenBTCGasFee(
    GAS_COST.add(keeperReward.div(gasPrice)),
    gasPrice
  );
  const opFee = applyRatio(amountIn, fee);
  const totalFees = gasFee.add(opFee);

  return { gasFee: gasFee, opFee: opFee, totalFees: totalFees };
});

const burnFee = (exports.burnFee = ethers.utils.parseEther("0.004"));
const mintFee = (exports.mintFee = ethers.utils.parseEther("0.0025"));

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

const renCrv = (exports.renCrv = new ethers.Contract(
  "0x93054188d876f558f4a66B2EF1d97d16eDf0895B",
  ["function get_dy(int128, int128, uint256) view returns (uint256)"],
  provider
));

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

const fromUSDC = async (amount) => {
  const WETH = UNISWAP.WETH["1"];
  let output = null;
  try {
    output = await quoter.quoteExactInput(
      ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [fixtures.ETHEREUM.USDC, 500, WETH.address, 500, fixtures.ETHEREUM.WBTC]
      ),
      amount
    );
  } catch (e) {
    console.error(e);
    console.error("Insufficient USDC amount for price fetch");
    return 0;
  }
  const result = await renBTCFromWBTC(output);
  return result;
};

const toUSDC = (exports.toUSDC = async (amount) => {
  try {
    const wbtcOut = await WBTCFromRenBTC(amount);
    const WETH = UNISWAP.WETH["1"];
    return await quoter.quoteExactInput(
      ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [fixtures.ETHEREUM.WBTC, 500, WETH.address, 500, fixtures.ETHEREUM.USDC]
      ),
      wbtcOut
    );
  } catch (e) {
    console.error(e);
    return 0;
  }
});

const computeTransferOutput = (exports.computeTransferOutput = async ({
  module,
  amount,
}) => {
  switch (module) {
    case fixtures.ETHEREUM.USDC:
      return await toUSDC(await deductMintFee(applyRenVMMintFee(amount)));
    case fixtures.ETHEREUM.WBTC:
      return await deductMintFee(
        await renCrv.get_dy(0, 1, applyRenVMMintFee(amount)),
        1
      );
    case fixtures.ETHEREUM.renBTC:
      return await deductMintFee(applyRenVMMintFee(amount));
    case ethers.constants.AddressZero:
      return await renBTCToETH(await deductMintFee(applyRenVMMintFee(amount)));
    default:
      return ethers.BigNumber.from("0");
  }
});

const renBTCFromWBTC = async (amount) => {
  return await renCrv.get_dy(1, 0, amount);
};

const WBTCFromRenBTC = async (amount) => {
  return await renCrv.get_dy(0, 1, amount);
};

const WBTCFromETH = async (amount) => {
  const WETH = UNISWAP.WETH[UNISWAP.ChainId.MAINNET];
  const output = await quoter.quoteExactInputSingle(
    WETH.address,
    fixtures.ETHEREUM.WBTC,
    500,
    amount,
    0
  );
  const result = await renBTCFromWBTC(output);
  return result;
};

const renBTCToETH = (exports.renBTCToETH = async (amount) => {
  const wbtcOut = await WBTCFromRenBTC(amount);
  const WETH = UNISWAP.WETH[UNISWAP.ChainId.MAINNET];
  return await quoter.quoteExactInputSingle(
    fixtures.ETHEREUM.WBTC,
    WETH.address,
    500,
    wbtcOut,
    0
  );
});

const getConvertedAmount = (exports.getConvertedAmount = async (
  asset,
  amount
) => {
  switch (asset) {
    case fixtures.ETHEREUM.WBTC:
      return await renBTCFromWBTC(amount);
    case fixtures.ETHEREUM.renBTC:
      return amount;
    case fixtures.ETHEREUM.USDC:
      return await fromUSDC(amount);
    case ethers.constants.AddressZero:
      return await renBTCFromWBTC(await WBTCFromETH(amount));
    default:
      console.error("no asset found for getConvertedAmount:" + asset);
      return amount;
  }
});

const computeOutputBTC = (exports.computeOutputBTC = async (burnRequest) => {
  const { asset, amount } = burnRequest;
  const convertedAmount = await getConvertedAmount(asset, amount);

  switch (asset) {
    case fixtures.ETHEREUM.WBTC:
      return await deductBurnFee(applyRenVMFee(convertedAmount));
    case fixtures.ETHEREUM.renBTC:
      return await deductBurnFee(applyRenVMFee(convertedAmount));
    case fixtures.ETHEREUM.USDC:
      return await deductBurnFee(applyRenVMFee(convertedAmount));
    case ethers.constants.AddressZero:
      return await deductBurnFee(applyRenVMFee(convertedAmount));
    default:
      console.error("no asset found for computeOutputBTC:" + asset);
      return burnRequest.amount;
  }
});
