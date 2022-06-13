"use strict";

const ethers = require("ethers");
const fixtures = require("./fixtures");
const JOE = require("@traderjoe-xyz/sdk");
const UNISWAP = require("@uniswap/sdk");
const { Route } = require("@uniswap/sdk");

const returnChainDetails = (CHAINID) => {
  switch (String(CHAINID)) {
    case "1":
      return {
        name: "ETHEREUM",
        provider: new ethers.providers.InfuraProvider(
          "mainnet",
          "816df2901a454b18b7df259e61f92cd2"
        ),
        uniswapName: "MAINNET",
      };
    case "42161":
      return {
        name: "ARBITRUM",
        provider: new ethers.providers.InfuraProvider(
          "mainnet",
          "816df2901a454b18b7df259e61f92cd2"
        ),
        uniswapName: "ARBITRUM",
      };
    case "43114":
      return {
        name: "AVALANCHE",
        provider: new ethers.providers.JsonRpcProvider(
          "https://api.avax.network/ext/bc/C/rpc"
        ),
        uniswapName: "",
      };
  }
};

module.exports = function makeQuoter(CHAIN = "1") {
  const chain = returnChainDetails(CHAIN);
  const renCrv = new ethers.Contract(
    fixtures[chain.name]["Curve_Ren"],
    [
      "function get_dy(int128, int128, uint256) view returns (uint256)",
      "function get_dy_underlying(int128, int128, uint256) view returns (uint256)",
    ],
    chain.provider
  );
  const quoter = new ethers.Contract(
    "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    [
      "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) public view returns (uint256 amountOut)",
      "function quoteExactInput(bytes path, uint256 amountIn) public view returns (uint256 amountOut)",
    ],
    chain.provider
  );

  // direction ? renbtc -> avax : avax -> renbtc
  const getAVAXQuote = async (direction, amount) => {
    const WBTC = new JOE.Token(
      JOE.ChainId.AVALANCHE,
      fixtures.AVALANCHE.WBTC,
      8
    );
    const pair = await JOE.Fetcher.fetchPairData(
      WBTC,
      JOE.WAVAX[ChainId.AVALANCHE],
      chain.provider
    );
    if (direction) {
      const wbtcAmount = await getWbtcQuoteAVAX(true, amount);
      const route = new Route([pair], WBTC);
      const trade = new Trade(
        route,
        new TokenAmount(WBTC_E, wbtcAmount),
        TradeType.EXACT_INPUT
      );
      const price = trade.midPrice.toSignificant(17);
      return ethers.utils.parseEther(price);
    } else {
      const route = new Route([pair], WAVAX[ChainId.AVALANCHE]);
      const trade = new Trade(
        route,
        new TokenAmount(WAVAX[ChainId.AVALANCHE], amount),
        TradeType.EXACT_INPUT
      );
      return await getWbtcQuoteAVAX(
        false,
        ethers.utils.parseUnits(trade.midPrice.toSignificant(7), 8)
      );
    }
  };

  // direction = true ? usdc -> renbtc
  const getUsdcQuoteAVAX = async (direction, amount) => {
    //amount = renBTC amount

    const aTricrypto = createContract(
      "0xB755B949C126C04e0348DD881a5cF55d424742B2",
      ["function get_dy(uint256, uint256, uint256) view returns (uint256)"]
    );

    const crvUSD = createContract(
      "0x7f90122BF0700F9E7e1F688fe926940E8839F353",
      [
        "function calc_token_amount(uint256[3] calldata, bool) view returns (uint256)",
      ],
      [
        "function calc_withdraw_one_coin(uint256, int128) view returns (uint256)",
      ]
    );
    //0 = wbtc, 1 = renbtc
    const renCrvPath = [0, 1];
    //0 = av3usd, 1 = wbtc
    const path = [0, 1];
    if (direction) {
      const av3usdAmount = await crvUSD.calc_token_amount([0, amount, 0], true);
      const wbtcAmount = await aTricrypto.get_dy(...path, av3usdAmount);
      return await renCrv.get_dy(...renCrvPath, wbtcAmount);
    } else {
      const wbtcAmount = await renCrv.get_dy(
        ...[...renCrvPath].reverse(),
        amount
      );
      const av3usdAmount = await aTricrypto.get_dy(
        ...[...path].reverse(),
        wbtcAmount
      );
      return await crvUSD.calc_withdraw_one_coin(av3usdAmount, 1);
    }
  };

  const getRenBTCForOneETHPrice = async () => {
    if (chain.name === "AVALANCHE") {
      return await getAVAXQuote(false, ethers.utils.parseEther("1"));
    } else if (chain.name === "ETHEREUM") {
      const renBTC = new UNISWAP.Token(
        UNISWAP.ChainId.MAINNET,
        fixtures.ETHEREUM.renBTC,
        8
      );
      const pair = await UNISWAP.Fetcher.fetchPairData(
        renBTC,
        UNISWAP.WETH[renBTC.chainId],
        chain.provider
      );
      const route = new Route([pair], UNISWAP.WETH[renBTC.chainId]);

      const renBTCForOneEth = route.midPrice.toSignificant(7);
      return ethers.utils.parseUnits(renBTCForOneEth, 8);
    } else {
      const amt = await WBTCFromETH(parseEther("1"));
      return await getWbtcQuote(false, amt);
    }
  };

  const fromUSDC = async (amount) => {
    if (chain.name === "AVALANCHE") {
      return await getUsdcQuoteAVAX(true, amount);
    } else {
      let output = null;
      try {
        output = await quoter.quoteExactInput(
          ethers.utils.solidityPack(
            ["address", "uint24", "address", "uint24", "address"],
            [
              fixtures[chain.name].USDC,
              500,
              fixtures[chain.name].WETH,
              500,
              fixtures[chain.name].WBTC,
            ]
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
    }
  };

  const toUSDC = async (amount) => {
    try {
      if (chain.name === "AVALANCHE") {
        return await getUsdcQuoteAVAX(false, amount);
      } else {
        const wbtcOut = await getWbtcQuote(true, amount);
        return await quoter.quoteExactInput(
          ethers.utils.solidityPack(
            ["address", "uint24", "address", "uint24", "address"],
            [
              fixtures[chain.name].WBTC,
              500,
              fixtures[chain.name].WETH,
              500,
              fixtures[chain.name].USDC,
            ]
          ),
          wbtcOut
        );
      }
    } catch (e) {
      console.error(e);
      return 0;
    }
  };
  // direction = true ? renbtc -> wbtc
  const getWbtcQuote = async (direction, amount) => {
    const path = chain.name === "ETHEREUM" ? [0, 1] : [1, 0];
    return await renCrv[
      chain.name === "AVALANCHE" ? "get_dy_underlying" : "get_dy"
    ](...(direction ? path : [...path].reverse()), amount);
  };

  const ETHtoRenBTC = async (amount) => {
    if (chain.name === "AVALANCHE") {
      await getAVAXQuote(false, amount);
    } else {
      const output = await quoter.quoteExactInputSingle(
        fixtures[chain.name].wETH,
        fixtures[chain.name].WBTC,
        500,
        amount,
        0
      );
      const result = await getWbtcQuote(false, output);
      return result;
    }
  };

  const renBTCToETH = async (amount) => {
    if (chain.name === "AVALANCHE") {
      return getAVAXQuote(true, amount);
    } else {
      const wbtcOut = await getWbtcQuote(true, amount);
      return await quoter.quoteExactInputSingle(
        fixtures[chain.name].WBTC,
        fixtures[chain.name].WETH,
        500,
        wbtcOut,
        0
      );
    }
  };
  return {
    fromUSDC,
    getAVAXQuote,
    getRenBTCForOneETHPrice,
    getUsdcQuoteAVAX,
    getWbtcQuote,
    renBTCToETH,
    toUSDC,
    ETHtoRenBTC,
    chain,
  };
};
