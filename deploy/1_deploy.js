const hre = require("hardhat");
const { options } = require("libp2p/src/keychain");
const validate = require('@openzeppelin/upgrades-core/dist/validate/index');
Object.defineProperty(validate, 'assertUpgradeSafe', {
  value: () => { }
})


const SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";
const RENBTC_MAINNET_ADDRESS = '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d';
const WETH_MAINNET_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const WBTC_MAINNET_ADDRESS = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
const USDC_MAINNET_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const UNISWAP_ROUTER_V2 = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

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
    args: [RENBTC_MAINNET_ADDRESS, zeroController.address, "zeroBTC", "zBTC"],
    from: deployer
  });
  const v = await ethers.getContract('BTCVault');
  await v.attach(RENBTC_MAINNET_ADDRESS).balanceOf(ethers.constants.AddressZero);

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
    args: [zeroController.address],
    contractName: 'StrategyRenVM',
    from: deployer
  });
  const controller = await ethers.getContract('ZeroController');

  await controller.approveStrategy(RENBTC_MAINNET_ADDRESS, strategyRenVM.address);
  await controller.setStrategy(RENBTC_MAINNET_ADDRESS, strategyRenVM.address);

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
  const CURVE_TRICRYPTOTWO_POOL = '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46';
  const renBTC = '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d';
  const wETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const wBTC = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

  const curveFactory = await ethers.getContract('ZeroCurveFactory', deployer);
  const uniswapFactory = await ethers.getContract('ZeroUniswapFactory', deployer);
  const wrapper = await ethers.getContract('WrapNative', deployer);
  const unwrapper = await ethers.getContract('UnwrapNative', deployer);

  const getWrapperAddress = async (tx) => {
    return (await tx.wait()).events[0].args._wrapper;
  };


  // Curve wBTC -> renBTC Factory
  const wBTCToRenBTCTx = await curveFactory.functions.createWrapper(1, 0, CURVE_SBTC_POOL);
  const wBTCToRenBTC = await getWrapperAddress(wBTCToRenBTCTx);
  await controller.functions.setConverter(wBTC, renBTC, wBTCToRenBTC);

  // Curve wETH -> wBTC Factory
  const wEthToWBTCTx = await curveFactory.createWrapper(2, 1, CURVE_TRICRYPTOTWO_POOL);
  const wEthToWBTC = await getWrapperAddress(wEthToWBTCTx);
  await controller.setConverter(wETH, wBTC, wEthToWBTC);

  // Curve wBTC -> wETH Factory
  const wBtcToWETHTx = await curveFactory.createWrapper(1, 2, CURVE_TRICRYPTOTWO_POOL);
  const wBtcToWETH = await getWrapperAddress(wBtcToWETHTx);
  await controller.setConverter(wBTC, wETH, wBtcToWETH);

  // Uniswap renBTC -> wBTC Factory
  const renBTCToWBTCTx = await uniswapFactory.createWrapper([renBTC, wBTC]);
  const renBTCToWBTC = await getWrapperAddress(renBTCToWBTCTx);
  await controller.setConverter(renBTC, wBTC, renBTCToWBTC);

  // Curve wETH -> renBTC Factory
  const wETHToRenBTCTx = await curveFactory.createWrapper(1, 0, CURVE_SBTC_POOL);
  const wETHToRenBTC = await getWrapperAddress(wETHToRenBTCTx);
  await controller.setConverter(wETH, renBTC, wETHToRenBTC);

  // Wrapper ETH -> wETH
  await controller.setConverter(ethers.constants.AddressZero, wETH, wrapper.address);

  // Unwrapper wETH -> ETH
  await controller.setConverter(wETH, ethers.constants.AddressZero, unwrapper.address);


};

