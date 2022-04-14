'use strict';

const ethers = require('ethers');
const fixtures = require('./fixtures');
const UNISWAP = require('@uniswap/sdk');

const provider = new ethers.providers.InfuraProvider('mainnet', '816df2901a454b18b7df259e61f92cd2');

const getRenBTCForOneETHPrice = async () => {
  const renBTC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.renBTC, 8);
  const pair = await UNISWAP.Fetcher.fetchPairData(renBTC, UNISWAP.WETH[renBTC.chainId], provider);
  return ethers.BigNumber.from((new UNISWAP.Route([pair], UNISWAP.WETH[renBTC.chainId]).midPrice).toFixed(0));
};

const computeRenBTCGasFee = async (gasCost, gasPrice) => {
  return gasCost.mul(gasPrice).mul(await getRenBTCForOneETHPrice()).div(ethers.utils.parseEther('1'));
};

const GAS_COST = ethers.BigNumber.from('300000');
const keeperReward = ethers.utils.parseEther('0.001');

const applyRatio = (amount, ratio) => {
  return ethers.BigNumber.from(amount).mul(ratio).div(ethers.utils.parseEther('1'));
};

const applyFee = async (amountIn, fee, multiplier, gasPrice) => {
  return (await computeRenBTCGasFee(GAS_COST.add(keeperReward.div(gasPrice)), gasPrice)).add(applyRatio(amountIn, fee));
};

const burnFee = ethers.utils.parseEther('0.004');

const deductBurnFee = async (amount, multiplier) => {
  amount = ethers.BigNumber.from(amount);
  const gasPrice = await provider.getGasPrice();
  return amount.sub(await applyFee(amount, burnFee, multiplier, gasPrice));
};

// TODO: Find out what appropriate mintFee is
const mintFee = ethers.utils.parseEther('0.003');

const deductMintFee = async (amount, multiplier) => {
  amount = ethers.BigNumber.from(amount);
  const gasPrice = await provider.getGasPrice();
  return amount.sub(await applyFee(amount, mintFee, multiplier, gasPrice));
}

const renCrv = new ethers.Contract('0x93054188d876f558f4a66B2EF1d97d16eDf0895B', [ 'function get_dy(int128, int128, uint256) view returns (uint256)' ], provider);

const applyRenVMFee = (input) => {
  input = ethers.BigNumber.from(input);
  return input.mul(ethers.utils.parseEther('0.9985')).div(ethers.utils.parseEther('1'));
};

const fromUSDC = async (amount) => {
  const USDC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.USDC, 6);
  const renBTC = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, fixtures.ETHEREUM.renBTC, 8);
  const WETH = UNISWAP.WETH[UNISWAP.ChainId.MAINNET];
  const route = new UNISWAP.Route([await UNISWAP.Fetcher.fetchPairData(USDC, WETH, provider), await UNISWAP.Fetcher.fetchPairData(WETH, renBTC, provider)], USDC); 
  const trade = new UNISWAP.Trade(route, new UNISWAP.TokenAmount(USDC, ethers.BigNumber.from(amount).toString()), UNISWAP.TradeType.EXACT_INPUT);
  const result = ethers.BigNumber.from(trade.outputAmount.raw.toString(10));
  return result;
};


const computeOutputBTC = exports.computeOutputBTC = async (burnRequest) => {
  const { asset } = burnRequest;
  switch (asset) {
    case fixtures.ETHEREUM.WBTC:
      return applyRenVMFee(await deductBurnFee(await renCrv.get_dy(1, 0, burnRequest.amount), 1));
    case fixtures.ETHEREUM.renBTC:
      return applyRenVMFee(await deductBurnFee(burnRequest.amount, 1));
    case fixtures.ETHEREUM.USDC:
      return applyRenVMFee(await deductBurnFee(await fromUSDC(burnRequest.amount), 1));
    default:
      console.log('no asset found for computeOutputBTC:' + asset);
      return burnRequest.amount;
  }
};

const computeOutputWrappedBTC = exports.computeOutputWrappedBTC = async (mintRequest) => {
  const { asset, amount } = mintRequest;
  // TODO: add iBTC and ETH
  switch (asset) {
    case 'wBTC' || fixtures.ETHEREUM.WBTC:
      return applyRenVMFee(await deductMintFee(await renCrv.get_dy(1, 0, amount), 1));
    case 'renBTC' || fixtures.ETHEREUM.renBTC:
      return applyRenVMFee(await deductMintFee(amount, 1));
    case 'USDC' || fixtures.ETHEREUM.USDC:
      return applyRenVMFee(await deductMintFee(await fromUSDC(amount), 1)); 
    default:
      console.log('no asset found for computeOutputBTC:' + asset);
      return amount;
  }
};
