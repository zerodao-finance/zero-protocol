const hre = require('hardhat');

const deployParameters = {
  MATIC: {
    renBTC: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501',
    wETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    wBTC: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    wNative: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    Router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    Curve_Ren: '0xC2d95EEF97Ec6C17551d45e77B590dc1F9117C67',
    sushiRouter: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    gatewayRegistry: '0x21C482f153D0317fe85C60bE1F7fa079019fcEbD',
  },
  ETHEREUM: {
    renBTC: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    wETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    wBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    wNative: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    Curve_SBTC: '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714',
    Curve_TriCryptoTwo: '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46',
    Router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    sushiRouter: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    gatewayRegistry: '0xe80d347DF1209a76DD9d2319d62912ba98C54DDD'
  }
}
const network = process.env.CHAIN || 'MATIC';

(async () => {
  const [signer] = await hre.ethers.getSigners();
  const zeroController = await hre.ethers.getContract('ZeroController');
  await hre.deployments.deploy('Swap', {
    contractName: 'Swap',
    args: [
      zeroController.address, // Controller
      deployParameters[network]['wETH'], // wNative
      deployParameters[network]['wBTC'], // Want
      deployParameters[network]['sushiRouter'], // Sushi Router
      deployParameters[network]['USDC'], // Fiat
      deployParameters[network]['renBTC'] // controllerWant
    ],
    libraries: {},
    from: await signer.getAddress()
  });
})().catch(console.error);
