const hre = require("hardhat");
const { options } = require("libp2p/src/keychain");
const validate = require('@openzeppelin/upgrades-core/dist/validate/index');
Object.defineProperty(validate, 'assertUpgradeSafe', {
  value: () => { }
})

const SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";

const deployParameters = {
  MATIC: {
    renBTC: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501',
    wBTC: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    wNative: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    Router: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    Curve_Ren: '0x445FE580eF8d70FF569aB36e80c647af338db351'
  },
  ETHEREUM: {
    renBTC: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    wBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    wNative: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    Curve_SBTC: '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714',
    Curve_TriCryptoTwo: '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46'
  }
}

const network = process.env.CHAIN || 'MATIC'


module.exports = async ({
  deployments,
  getChainId,
  getUnnamedAccounts,
  getNamedAccounts,
  ethers,
  upgrades
}) => {
  const { deployer } = await getNamedAccounts(); //used as governance address
  const [{ provider }] = await ethers.getSigners();
  const { chainId } = await provider.getNetwork();
  if (chainId === 31337) {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [SIGNER_ADDRESS]
    })
  }
  const signer = await ethers.getSigner(SIGNER_ADDRESS);
  const [deployerSigner] = await ethers.getSigners();

  const zeroUnderwriterLockBytecodeLib = await deployments.deploy('ZeroUnderwriterLockBytecodeLib', {
    contractName: 'ZeroUnderwriterLockBytecodeLib',
    args: [],
    from: deployer
  });

  const zeroControllerFactory = (await hre.ethers.getContractFactory("ZeroController", {
    libraries: {
      ZeroUnderwriterLockBytecodeLib: zeroUnderwriterLockBytecodeLib.address
    }
  }));
  const zeroController = await upgrades.deployProxy(zeroControllerFactory, ["0x0F4ee9631f4be0a63756515141281A3E2B293Bbe"], {
    unsafeAllowLinkedLibraries: true
  });
  const zeroControllerArtifact = await deployments.getArtifact('ZeroController');
  await deployments.save('ZeroController', {
    contractName: 'ZeroController',
    address: zeroController.address,
    bytecode: zeroControllerArtifact.bytecode,
    abi: zeroControllerArtifact.abi
  });
  const btcVault = await deployments.deploy('BTCVault', {
    contractName: 'BTCVault',
    args: [deployParameters[network]['renBTC'], zeroController.address, "zeroBTC", "zBTC"],
    from: deployer
  });
  const v = await ethers.getContract('BTCVault');
  await v.attach(deployParameters[network]['renBTC']).balanceOf(ethers.constants.AddressZero);

  const trivialUnderwriterFactory = await deployments.deploy("TrivialUnderwriter", {
    contractName: 'TrivialUnderwriter',
    args: [zeroController.address],
    from: deployer
  });
  const swapModuleFactory = await deployments.deploy('Swap', {
    args: [zeroController.address],
    contractName: 'Swap',
    from: deployer
  });
  const strategyRenVM = await deployments.deploy('StrategyRenVM', {
    args: [zeroController.address, deployParameters[network]["renBTC"], deployParameters[network][""]],
    contractName: 'StrategyRenVM',
    from: deployer
  });
  const controller = await ethers.getContract('ZeroController');

  await controller.approveStrategy(deployParameters[network]['renBTC'], strategyRenVM.address);
  await controller.setStrategy(deployParameters[network]['renBTC'], strategyRenVM.address);

  await deployments.deploy('ZeroCurveFactory', {
    args: [],
    contractName: 'ZeroCurveFactory',
    from: deployer
  });

  await deployments.deploy('ZeroUniswapFactory', {
    args: [UNISWAP_ROUTER_V2],
    contractName: 'ZeroUniswapFactory',
    from: deployer
  });

  await deployments.deploy('WrapNative', {
    args: [WETH_MAINNET_ADDRESS],
    contractName: 'WrapNative',
    from: deployer
  });

  await deployments.deploy('UnwrapNative', {
    args: [WETH_MAINNET_ADDRESS],
    contractName: 'UnwrapNative',
    from: deployer
  });

  //Deploy converters
  const CURVE_SBTC_POOL = '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714';
  const renBTC = '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d';
  const wETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const wBTC = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

  const wrapper = await ethers.getContract('WrapNative', deployer);
  const unwrapper = await ethers.getContract('UnwrapNative', deployer);

  const getWrapperAddress = async (tx) => {
    const { events } = await tx.wait();
    const lastEvent = events[events.length - 1];
    return lastEvent.args._wrapper;
  };

  // Deploy converters
  switch (network) {
    case ETHEREUM:
      const curveFactory = await ethers.getContract('ZeroCurveFactory', deployer);

      // Curve wBTC -> renBTC
      var wBTCToRenBTCTx = await curveFactory.functions.createWrapper(1, 0, deployParameters[network]["Curve_SBTC"]);
      var wBTCToRenBTC = await getWrapperAddress(wBTCToRenBTCTx);
      await controller.setConverter(wBTC, renBTC, wBTCToRenBTC);

      // Curve renBTC -> wBTC
      var renBTCToWBTCTx = await curveFactory.createWrapper(0, 1, deployParameters[network]["Curve_SBTC"]);
      var renBTCToWBTC = await getWrapperAddress(renBTCToWBTCTx);
      await controller.setConverter(renBTC, wBTC, renBTCToWBTC);

      // Curve wNative -> wBTC
      var wEthToWBTCTx = await curveFactory.createWrapper(2, 1, deployParameters[network]["Curve_TriCryptoTwo"]);
      var wEthToWBTC = await getWrapperAddress(wEthToWBTCTx);
      await controller.setConverter(wETH, wBTC, wEthToWBTC);

      // Curve wBTC -> wNative
      var wBtcToWETHTx = await curveFactory.createWrapper(1, 2, deployParameters[network]["Curve_TriCryptoTwo"]);
      var wBtcToWETH = await getWrapperAddress(wBtcToWETHTx);
      await controller.setConverter(wBTC, wETH, wBtcToWETH);

      break;

    default:
      const sushiFactory = await ethers.getContract('ZeroUniswapFactory', deployer);
      const curveUnderlyingFactory = await ethers.getContract('ZeroCurveUnderlyingFactory', deployer);

      // Curve wBTC -> renBTC
      var wBTCToRenBTCTx = await curveUnderlyingFactory.createWrapper(0, 1, deployParameters[network]["Curve_Ren"]);
      var wBTCToRenBTC = await getWrapperAddress(wBTCToRenBTCTx);
      await controller.setConverter(wBTC, renBTC, wBTCToRenBTC);

      // Curve renBTC -> wBTC
      var renBTCToWBTCTx = await curveUnderlyingFactory.createWrapper(1, 0, deployParameters[network]["Curve_Ren"]);
      var renBTCToWBTC = await getWrapperAddress(renBTCToWBTCTx);
      await controller.setConverter(renBTC, wBTC, renBTCToWBTC);

      // Sushi wNative -> wBTC
      var wEthToWBTCTx = await sushiFactory.createWrapper([deployParameters[network]["wNative"], deployParameters[network]["wBTC"]]);
      var wEthToWBTC = await getWrapperAddress(wEthToWBTCTx);
      await controller.setConverter(wETH, wBTC, wEthToWBTC);

      // Sushi wBTC -> wNative
      var wBtcToWETHTx = await sushiFactory.createWrapper([deployParameters[network]["wBTC"], deployParameters[network]["wNative"]]);
      var wBtcToWETH = await getWrapperAddress(wBtcToWETHTx);
      await controller.setConverter(wBTC, wETH, wBtcToWETH);


      break;

  }

  // Wrapper ETH -> wETH
  await controller.setConverter(ethers.constants.AddressZero, deployParameters[network]["wNative"], wrapper.address);

  // Unwrapper wETH -> ETH
  await controller.setConverter(deployParameters[network]["wNative"], ethers.constants.AddressZero, unwrapper.address);

};

