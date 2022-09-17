"use strict";

const ethers = require("ethers");
const fixtures = require("./fixtures");
const JOE = require("@traderjoe-xyz/sdk");
const UNISWAP = require("@uniswap/sdk");
const { Route } = require("@uniswap/sdk");

const returnChainDetails = (CHAINID, _provider) => {
  const provider = (chain) =>
    _provider ||
    new ethers.providers.InfuraProvider(
      chain,
      "816df2901a454b18b7df259e61f92cd2"
    );
  switch (String(CHAINID)) {
    case "1":
      return {
        name: "ETHEREUM",
        provider: provider("mainnet"),
        uniswapName: "MAINNET",
      };
    case "42161":
      return {
        name: "ARBITRUM",
        provider: provider("arbitrum"),
        uniswapName: "ARBITRUM",
      };
    case "10":
      return {
        name: "OPTIMISM",
        provider: provider("optimism"),
        uniswapName: "OPTIMISM",
      };
    case "43114":
      return {
        name: "AVALANCHE",
        provider:
          _provider ||
          new ethers.providers.JsonRpcProvider(
            "https://api.avax.network/ext/bc/C/rpc"
          ),
        uniswapName: "",
      };
    case "137":
      return {
        name: "MATIC",
        provider: _provider || provider("matic"),
        uniswapName: "POLYGON",
      };
  }
};

module.exports = function makeQuoter(CHAIN = "1", provider) {
  const chain = returnChainDetails(CHAIN, provider);
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
  // direction ? renbtc -> usdt : usdt -> renbtc
  const getUSDTQuote = async (direction, amount) => {
    const tricrypto = new ethers.Contract(
      fixtures[chain.name]["tricrypto"],
      ["function get_dy(uint256, uint256, uint256) view returns (uint256)"],
      chain.provider
    );
    if (direction) {
      const wbtcOut = await getWbtcQuote(direction, amount);
      return await tricrypto.get_dy(1, 0, amount);
    } else {
      const wbtcAmount = await tricrypto.get_dy(0, 1, amount);
      return await getWbtcQuote(direction, wbtcAmount);
    }
  };


  //direction ? renzec -> eth : eth -> renzec
  const getRenZECETHQuote = async (direction, amount) => {
    const RENZEC = new UNISWAP.Token(
      UNISWAP.ChainId.MAINNET,
      fixtures.ETHEREUM.renZEC,
      8
    );
    const weth = UNISWAP.WETH[UNISWAP.ChainId.MAINNET];
    const pair = await UNISWAP.Fetcher.fetchPairData(
      RENZEC,
      weth,
      chain.provider
    );
    if (direction) {
      const route = new UNISWAP.Route([pair], RENZEC);
      const trade = new UNISWAP.Trade(
        route,
        new UNISWAP.TokenAmount(RENZEC, amount),
        UNISWAP.TradeType.EXACT_INPUT
      );
      const price = trade.outputAmount.toExact();
      return ethers.utils.parseEther(price);
    } else {
      const route = new UNISWAP.Route([pair], weth);
      const trade = new UNISWAP.Trade(
        route,
        new UNISWAP.TokenAmount(weth, amount.toString()),
        UNISWAP.TradeType.EXACT_INPUT
      );
      const price = trade.outputAmount.toExact();
      return ethers.utils.parseUnits(price, 8);
    }
  };

  // direction ? renbtc -> avax : avax -> renbtc
  const getAVAXQuote = async (direction, amount) => {
    const WBTC = new JOE.Token(
      JOE.ChainId.AVALANCHE,
      fixtures.AVALANCHE.WBTC,
      8
    );
    const pair = await JOE.Fetcher.fetchPairData(
      WBTC,
      JOE.WAVAX[JOE.ChainId.AVALANCHE],
      chain.provider
    );
    if (direction) {
      const wbtcAmount = await getWbtcQuote(true, amount);
      const route = new JOE.Route([pair], WBTC);
      const trade = new JOE.Trade(
        route,
        new JOE.TokenAmount(WBTC, wbtcAmount),
        JOE.TradeType.EXACT_INPUT
      );
      const price = trade.outputAmount.toExact();
      return ethers.utils.parseEther(price);
    } else {
      const route = new JOE.Route([pair], JOE.WAVAX[JOE.ChainId.AVALANCHE]);
      const trade = new JOE.Trade(
        route,
        new JOE.TokenAmount(JOE.WAVAX[JOE.ChainId.AVALANCHE], amount),
        JOE.TradeType.EXACT_INPUT
      );
      return await getWbtcQuote(
        false,
        ethers.utils.parseUnits(trade.outputAmount.toExact(), 8)
      );
    }
  };

  // direction = true ? usdc -> renbtc
  const getUsdcQuoteAVAX = async (direction, amount) => {
    //amount = renBTC amount

    const aTricrypto = new ethers.Contract(
      "0xB755B949C126C04e0348DD881a5cF55d424742B2",
      ["function get_dy(uint256, uint256, uint256) view returns (uint256)"],
      chain.provider
    );

    const crvUSD = new ethers.Contract(
      "0x7f90122BF0700F9E7e1F688fe926940E8839F353",
      [
        "function calc_token_amount(uint256[3] calldata, bool) view returns (uint256)",
        "function calc_withdraw_one_coin(uint256, int128) view returns (uint256)",
      ],
      chain.provider
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

  // direction ? renbtc -> usdc : usdc -> renbtc
  const getUSDCNativeQuote = async (direction, amount) => {
    const usdcpool = new ethers.Contract(
      fixtures.AVALANCHE.USDC_POOL,
      ["function get_dy(int128, int128, uint256) view returns (uint256)"],
      chain.provider
    );

    if (direction) {
      const usdcAmount = await getUsdcQuoteAVAX(direction, amount);
      return await usdcpool.get_dy(0, 1, amount);
    } else {
      const usdcnativeAmount = await usdcpool.get_dy(1, 0, amount);
      return await getUsdcQuoteAVAX(direction, usdcnativeAmount);
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
    } else if (chain.name === "OPTIMISM") {
      return ethers.utils.parseUnits("0", 8);
    } else {
      return await ETHtoRenBTC(ethers.utils.parseEther("1"));
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
              fixtures[chain.name].wETH,
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
      const result = await getWbtcQuote(false, output);
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
              fixtures[chain.name].wETH,
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
      ["AVALANCHE", "MATIC"].includes(chain.name)
        ? "get_dy_underlying"
        : "get_dy"
    ](...(direction ? path : [...path].reverse()), amount);
  };

  const ETHtoRenBTC = async (amount) => {
    if (chain.name === "AVALANCHE") {
      return await getAVAXQuote(false, amount);
    } else {
      const path = [
        fixtures[chain.name].wNative,
        500,
        fixtures[chain.name].wETH,
        500,
        fixtures[chain.name].WBTC,
      ];
      path.splice(2, chain.name !== "MATIC" ? 2 : 0);
      const output = await quoter.quoteExactInput(
        ethers.utils.solidityPack(
          ["address", "uint24", "address"].concat(
            chain.name === "MATIC" ? ["uint24", "address"] : []
          ),
          path
        ),
        amount
      );
      const result = await getWbtcQuote(false, output);
      return result;
    }
  };

  // only for matic
  const wNativeToUSDC = async (amount) => {
    return await quoter.quoteExactInput(
      ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        [fixtures[chain.name].wNative, 500, fixtures[chain.name].USDC]
      ),
      amount
    );
  };

  const ETHToRenZEC = async (amount) => {
    return await getRenZECETHQuote(false, amount);
  };

  const renZECToETH = async (amount) => {
    return await getRenZECETHQuote(true, amount);
  };

  //direction ? weth -> token : token -> weth
  const wethToTokenQuote = async (direction, token, amount) => {
    const path = [fixtures[chain.name].wETH, 500, token];
    const quote = await quoter.quoteExactInput(
      ethers.utils.solidityPack(
        ["address", "uint24", "address"],
        direction ? path : path.reverse()
      ),
      amount
    );
  };
  // direction ? renzec -> usdc : usdc -> renzec
  const getRenZECUSDCQuote = async (direction, amount) => {
    if (direction) {
      const _amount = await renZECToETH(amount);
      return await wethToTokenQuote(
        direction,
        fixtures[chain.name].USDC,
        _amount
      );
    } else {
      const _amount = await wethToTokenQuote(
        direction,
        fixtures[chain.name].USDC,
        amount
      );
      return await ETHToRenZEC(_amount);
    }
  };

  // direction ? renzec -> usdt : usdt -> renzec
  const getRenZECUSDCQuote = async (direction, amount) => {
    if (direction) {
      const _amount = await renZECToETH(amount);
      return await wethToTokenQuote(
        direction,
        fixtures[chain.name].USDT,
        _amount
      );
    } else {
      const _amount = await wethToTokenQuote(
        direction,
        fixtures[chain.name].USDT,
        amount
      );
      return await ETHToRenZEC(_amount);
    }
  };
  const renBTCToETH = async (amount) => {
    if (chain.name === "AVALANCHE") {
      return await getAVAXQuote(true, amount);
    } else {
      const path = [
        fixtures[chain.name].WBTC,
        500,
        fixtures[chain.name].wETH,
        500,
        fixtures[chain.name].wNative,
      ];

      path.splice(2, chain.name !== "MATIC" ? 2 : 0);
      const wbtcOut = await getWbtcQuote(true, amount);
      const quote = await quoter.quoteExactInput(
        ethers.utils.solidityPack(
          ["address", "uint24", "address"].concat(
            chain.name === "MATIC" ? ["uint24", "address"] : []
          ),
          path
        ),
        wbtcOut
      );
      return quote;
    }
  };

  return {
    fromUSDC,
    getAVAXQuote,
    getRenBTCForOneETHPrice,
    getUsdcQuoteAVAX,
    wNativeToUSDC,
    getWbtcQuote,
    renBTCToETH,
    ETHToRenZEC,
    renZECToETH,
    toUSDC,
    ETHtoRenBTC,
    chain,
    getUSDTQuote,
  };
};
