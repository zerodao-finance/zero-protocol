'use strict';

const ethers = require('ethers');
const fixtures = require('./fixtures');
const UNISWAP = require('@uniswap/sdk');
const { Route } = require('@uniswap/sdk');

const provider = new ethers.providers.InfuraProvider('mainnet', '816df2901a454b18b7df259e61f92cd2');

const getRenBTCForOneETHPrice = async () => {
  const renBTC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.renBTC, 8);
  const pair = await UNISWAP.Fetcher.fetchPairData(renBTC, UNISWAP.WETH[renBTC.chainId], provider);
  const route = new Route([pair], UNISWAP.WETH[renBTC.chainId])

  const renBTCForOneEth = route.midPrice.toSignificant(7);
  return ethers.utils.parseUnits(renBTCForOneEth, 8);
};

const computeRenBTCGasFee = async (gasCost, gasPrice) => {
  return gasCost.mul(gasPrice).mul(await getRenBTCForOneETHPrice()).div(ethers.utils.parseEther('1'));
};

const GAS_COST = ethers.BigNumber.from('370000');
const keeperReward = ethers.utils.parseEther('0.001');

const applyRatio = (amount, ratio) => {
  return ethers.BigNumber.from(amount).mul(ratio).div(ethers.utils.parseEther('1'));
};

const applyFee = async (amountIn, fee, multiplier, gasPrice) => {
  return (await computeRenBTCGasFee(GAS_COST.add(keeperReward.div(gasPrice)), gasPrice)).add(applyRatio(amountIn, fee));
};
const burnFee = ethers.utils.parseEther('0.004');
const mintFee = ethers.utils.parseEther('0.0025');

const deductBurnFee = async (amount, multiplier) => {
  amount = ethers.BigNumber.from(amount);
  const gasPrice = await provider.getGasPrice();

  const amountAfterDeduction = amount.sub(await applyFee(amount, burnFee, multiplier, gasPrice));
  return amountAfterDeduction <= 0 ? 0 : amountAfterDeduction;
};

const deductMintFee = async (amount, multiplier) => {
  amount = ethers.BigNumber.from(amount);
  const gasPrice = await provider.getGasPrice();

  const amountAfterDeduction = amount.sub(await applyFee(amount, mintFee, multiplier, gasPrice));
  return amountAfterDeduction <= 0 ? 0 : amountAfterDeduction;
};

const renCrv = new ethers.Contract('0x93054188d876f558f4a66B2EF1d97d16eDf0895B', [ 'function get_dy(int128, int128, uint256) view returns (uint256)' ], provider);

const applyRenVMFee = (input) => {
  input = ethers.BigNumber.from(input);
  return input.mul(ethers.utils.parseEther('0.9985')).div(ethers.utils.parseEther('1'));
};
const applyRenVMMintFee = (input) => {
  input = ethers.BigNumber.from(input);
  return input.mul(ethers.utils.parseEther('0.9985')).div(ethers.utils.parseEther('1')).sub(ethers.utils.parseUnits('0.001', 8));
};

const fromUSDC = async (amount) => {
  const USDC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.USDC, 6);
  const WBTC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.WBTC, 8);
  const route = new UNISWAP.Route([await UNISWAP.Fetcher.fetchPairData(USDC, WBTC, provider)], USDC); 
  const trade = new UNISWAP.Trade(route, new UNISWAP.TokenAmount(USDC, ethers.BigNumber.from(amount).toString()), UNISWAP.TradeType.EXACT_INPUT);
  const result = await renBTCFromWBTC(ethers.BigNumber.from(trade.outputAmount.raw.toString(10)));
  return result;
};

const toUSDC = async (amount) => {
  try {
  const wbtcOut = await WBTCFromRenBTC(amount);
  const USDC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.USDC, 6);
  const WBTC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.WBTC, 8);
  const route = new UNISWAP.Route([await UNISWAP.Fetcher.fetchPairData(WBTC, USDC, provider)], WBTC); 
  const trade = new UNISWAP.Trade(route, new UNISWAP.TokenAmount(WBTC, ethers.BigNumber.from(wbtcOut).toString()), UNISWAP.TradeType.EXACT_INPUT);
  const result = ethers.BigNumber.from(trade.outputAmount.raw.toString(10));
  return result;
  } catch (e) {
	  console.error(e);
	  return 0;
  }
};

const computeTransferOutput = exports.computeTransferOutput = async ({
  module,
  amount
}) => {
  switch (module) {
    case fixtures.ETHEREUM.USDC:
      return await toUSDC(await deductMintFee(applyRenVMMintFee(amount)));
    case fixtures.ETHEREUM.WBTC:
      return await deductMintFee(await renCrv.get_dy(0, 1, applyRenVMMintFee(amount)), 1);
    case fixtures.ETHEREUM.renBTC:
      return await deductMintFee(applyRenVMMintFee(amount));
    case ethers.constants.AddressZero:
      return await renBTCToETH(await deductMintFee(applyRenVMMintFee(amount)))
    default:
      return ethers.BigNumber.from('0');
  }
};

const renBTCFromWBTC = async (amount) => {
      return await renCrv.get_dy(1, 0, amount);
};

const WBTCFromRenBTC = async (amount) => {
      return await renCrv.get_dy(0, 1, amount);
};

const WBTCFromETH = async (amount) => {
  const WETH = new UNISWAP.WETH[UNISWAP.ChainId.MAINNET];
  const WBTC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.WBTC, 8);
  const route = new UNISWAP.Route([await UNISWAP.Fetcher.fetchPairData(WETH, WBTC, provider)], WETH); 
  const trade = new UNISWAP.Trade(route, new UNISWAP.TokenAmount(WETH, ethers.BigNumber.from(amount).toString()), UNISWAP.TradeType.EXACT_INPUT);
  const result = await renBTCFromWBTC(ethers.BigNumber.from(trade.outputAmount.raw.toString(10)));
  return result;
};

const renBTCToETH = async (amount) => {
  const wbtcOut = await WBTCFromRenBTC(amount);
  const WETH = new UNISWAP.WETH[UNISWAP.ChainId.MAINNET];
  const WBTC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.WBTC, 8);
  const route = new UNISWAP.Route([await UNISWAP.Fetcher.fetchPairData(WBTC, WETH, provider)], WBTC); 
  const trade = new UNISWAP.Trade(route, new UNISWAP.TokenAmount(WBTC, ethers.BigNumber.from(wbtcOut).toString()), UNISWAP.TradeType.EXACT_INPUT);
  const result = ethers.BigNumber.from(trade.outputAmount.raw.toString(10));
  return result;
};

const computeOutputBTC = exports.computeOutputBTC = async (burnRequest) => {
  const { asset } = burnRequest;
  switch (asset) {
    case fixtures.ETHEREUM.WBTC:
      return applyRenVMFee(await deductBurnFee(await renBTCFromWBTC(burnRequest.amount), 1));
    case fixtures.ETHEREUM.renBTC:
      return applyRenVMFee(await deductBurnFee(burnRequest.amount, 1));
    case fixtures.ETHEREUM.USDC:
      return applyRenVMFee(await deductBurnFee(await fromUSDC(burnRequest.amount), 1));
    case ethers.constants.AddressZero:
      return applyRenVMFee(await deductBurnFee(await renBTCFromWBTC(await WBTCFromETH(burnRequest.amount))));
    default:
      console.log('no asset found for computeOutputBTC:' + asset);
      return burnRequest.amount;
  }
};
