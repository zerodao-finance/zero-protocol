const hre = require("hardhat");
const { options } = require("libp2p/src/keychain");
const validate = require('@openzeppelin/upgrades-core/dist/validate/index');
Object.defineProperty(validate, 'assertUpgradeSafe', {
  value: () => { }

})
const { Logger } = require('@ethersproject/logger');

const _throwError = Logger.prototype.throwError;
const { ethers, deployments, upgrades } = hre;
let _sendTransaction;

const walletMap = {};

const deployFixedAddress = async (...args) => {
  console.log('Deploying ' + args[0]);
  args[1].waitConfirmations = 1;
  const [signer] = await ethers.getSigners();
//  hijackSigner(signer);
  const result = await deployments.deploy(...args);
//  restoreSigner(signer);
  console.log('Deployed to ' + result.address);
  return result;
};

const deployProxyFixedAddress = async (...args) => {
  console.log('Deploying proxy');
  //const [signer] = await ethers.getSigners();
  //hijackSigner(signer);
  const result = await upgrades.deployProxy(...args);
  //restoreSigner(signer);
  return result;
};

const { JsonRpcProvider } = ethers.providers;
const { getSigner: _getSigner } = JsonRpcProvider.prototype;


const SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";

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

const toAddress = (contractOrAddress) => ((contractOrAddress || {})).address || contractOrAddress;

const setConverter = async (controller, source, target, converter) => {
  const [sourceAddress, targetAddress] = [source, target].map((v) => deployParameters[network][v] || v);
  console.log('setting converter');
  const tx = await controller.setConverter(sourceAddress, targetAddress, toAddress(converter), { gasLimit: '500000' });
  console.log('setConverter(' + sourceAddress + ',' + targetAddress + ',' + toAddress(converter));
  return tx;
};

const network = process.env.CHAIN || 'MATIC'


module.exports = async ({
  getChainId,
  getUnnamedAccounts,
  getNamedAccounts,
}) => {
  const { deployer } = await getNamedAccounts(); //used as governance address
  const [ethersSigner] = await ethers.getSigners();
  const { provider } = ethersSigner;
  if (Number(ethers.utils.formatEther(await provider.getBalance(deployer))) === 0) await ethersSigner.sendTransaction({
    value: ethers.utils.parseEther('1'),
    to: deployer
  });
  const { chainId } = await provider.getNetwork();
  if (chainId === 31337) {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [SIGNER_ADDRESS]
    })
  }
  const signer = await ethers.getSigner(SIGNER_ADDRESS);
  const [deployerSigner] = await ethers.getSigners();

	/*
  const zeroUnderwriterLockBytecodeLib = { address: '0xfFd2EF3D44a2ea1B5E88780C1c85bcf6B2Aa4Bb5' };
  const zeroController = { address: '0xba227751e973C6DfEb4A56F811215F847EFEfC3E' };
  const dummyVault = { address: '0x9eDDC94bB952117342cB1f556ea0591363F7B833' };
  const strategyRenVM = { address: '0x4615b36Cb20E9707c3e4dc8376ea6863C38c14Cc' };
  */


  const zeroUnderwriterLockBytecodeLib = await deployFixedAddress('ZeroUnderwriterLockBytecodeLib', {
    contractName: 'ZeroUnderwriterLockBytecodeLib',
    args: [],
    from: deployer
  });
  

  const zeroControllerFactory = (await hre.ethers.getContractFactory("ZeroController", {
    libraries: {
      ZeroUnderwriterLockBytecodeLib: zeroUnderwriterLockBytecodeLib.address
    }
  }));
  const zeroController = await deployProxyFixedAddress(zeroControllerFactory, ["0x0F4ee9631f4be0a63756515141281A3E2B293Bbe", deployParameters[network].gatewayRegistry], {
    unsafeAllowLinkedLibraries: true
  });
  const zeroControllerArtifact = await deployments.getArtifact('ZeroController');
  await deployments.save('ZeroController', {
    contractName: 'ZeroController',
    address: zeroController.address,
    bytecode: zeroControllerArtifact.bytecode,
    abi: zeroControllerArtifact.abi
  });
  

	console.log('waiting on proxy deploy to mine ...');
  await zeroController.deployTransaction.wait();
	console.log('done!');

  await deployFixedAddress('BTCVault', {
    contractName: 'BTCVault',
    args: [deployParameters[network]['renBTC'], zeroController.address, "zeroBTC", "zBTC"],
    from: deployer
  });
  const v = await ethers.getContract('BTCVault');
  await v.attach(deployParameters[network]['renBTC']).balanceOf(ethers.constants.AddressZero);
  


  const dummyVault = await deployFixedAddress('DummyVault', {
    contractName: 'DummyVault',
    args: [deployParameters[network]['wBTC'], zeroController.address, "yearnBTC", "yvWBTC"],
    from: deployer
  });
  const w = await ethers.getContract('DummyVault');
  await w.attach(deployParameters[network]['wBTC']).balanceOf(ethers.constants.AddressZero);
  console.log("Deployed DummyVault to", dummyVault.address)
  


  await deployFixedAddress("TrivialUnderwriter", {
    contractName: 'TrivialUnderwriter',
    args: [zeroController.address],
    from: deployer,
  });
  
  
  await deployFixedAddress('Swap', {
    args: [
      zeroController.address, // Controller
      deployParameters[network]['wETH'], // wNative
      deployParameters[network]['wBTC'], // Want
      deployParameters[network]['sushiRouter'], // Sushi Router
      deployParameters[network]['USDC'], // Fiat
      deployParameters[network]['renBTC'] // controllerWant
    ],
    contractName: 'Swap',
    from: deployer
  });
  
  
  const strategyRenVM = await deployments.deploy('StrategyRenVM', {
    args: [
      zeroController.address,
      deployParameters[network]["renBTC"],
      deployParameters[network]["wNative"],
      dummyVault.address,
      deployParameters[network]['wBTC']
    ],
    contractName: 'StrategyRenVM',
    from: deployer,
    waitConfirmations: 1
  });


  const controller = await ethers.getContract('ZeroController');

  //hijackSigner(ethersSigner);
  await controller.setGovernance(await ethersSigner.getAddress());
  //restoreSigner(ethersSigner);

  await controller.approveStrategy(deployParameters[network]['renBTC'], strategyRenVM.address);


  await (await controller.setStrategy(deployParameters[network]['renBTC'], strategyRenVM.address, false)).wait();


  //restoreSigner(ethersSigner);

  await deployFixedAddress('ZeroCurveFactory', {
    args: [],
    contractName: 'ZeroCurveFactory',
    from: deployer
  });

  await deployFixedAddress('ZeroUniswapFactory', {
    args: [deployParameters[network]['Router']],
    contractName: 'ZeroUniswapFactory',
    from: deployer
  });

  await deployFixedAddress('WrapNative', {
    args: [deployParameters[network]['wNative']],
    contractName: 'WrapNative',
    from: deployer
  });

  await deployFixedAddress('UnwrapNative', {
    args: [deployParameters[network]['wNative']],
    contractName: 'UnwrapNative',
    from: deployer
  });


  //Deploy converters
  const wrapper = await ethers.getContract('WrapNative', deployer);
  const unwrapper = await ethers.getContract('UnwrapNative', deployer);
  const curveFactory = await ethers.getContract('ZeroCurveFactory', deployer);

  const getWrapperAddress = async (tx) => {
    const receipt = await tx.wait();
    console.log(require('util').inspect(receipt, { colors: true, depth: 15 }));
    const { events } = receipt;
    const lastEvent = events[events.length - 2];
    return lastEvent.args._wrapper;
  };

  // Deploy converters
  switch (network) {
    case "ETHEREUM":

      // Curve wBTC -> renBTC
      var wBTCToRenBTCTx = await curveFactory.functions.createWrapper(false, 1, 0, deployParameters[network]["Curve_SBTC"]);
      var wBTCToRenBTC = await getWrapperAddress(wBTCToRenBTCTx);
      await setConverter(controller, 'wBTC', 'renBTC', wBTCToRenBTC);

      // Curve renBTC -> wBTC
      var renBTCToWBTCTx = await curveFactory.createWrapper(false, 0, 1, deployParameters[network]["Curve_SBTC"]);
      var renBTCToWBTC = await getWrapperAddress(renBTCToWBTCTx);
      await setConverter(controller, 'renBTC', 'wBTC', renBTCToWBTC);

      // Curve wNative -> wBTC
      var wEthToWBTCTx = await curveFactory.createWrapper(false, 2, 1, deployParameters[network]["Curve_TriCryptoTwo"], { gasLimit: 8e6 });
      var wEthToWBTC = await getWrapperAddress(wEthToWBTCTx);
      await setConverter(controller, 'wNative', 'wBTC', wEthToWBTC);

      // Curve wBTC -> wNative
      var wBtcToWETHTx = await curveFactory.createWrapper(false, 1, 2, deployParameters[network]["Curve_TriCryptoTwo"], { gasLimit: 8e6 });
      var wBtcToWETH = await getWrapperAddress(wBtcToWETHTx);
      await setConverter(controller, 'wBTC', 'wNative', wBtcToWETH);

      break;

    default:
      const sushiFactory = await ethers.getContract('ZeroUniswapFactory', deployer);

      // Curve wBTC -> renBTC
      var wBTCToRenBTCTx = await curveFactory.createWrapper(true, 0, 1, deployParameters[network]["Curve_Ren"], { gasLimit: 5e6 });
      var wBTCToRenBTC = await getWrapperAddress(wBTCToRenBTCTx);
      await setConverter(controller, 'wBTC', 'renBTC', wBTCToRenBTC);

      // Curve renBTC -> wBTC
      var renBTCToWBTCTx = await curveFactory.createWrapper(true, 1, 0, deployParameters[network]["Curve_Ren"], { gasLimit: 5e6 });
      var renBTCToWBTC = await getWrapperAddress(renBTCToWBTCTx);
      await setConverter(controller, 'renBTC', 'wBTC', renBTCToWBTC);

      // Sushi wNative -> wBTC
      var wEthToWBTCTx = await sushiFactory.createWrapper([deployParameters[network]["wNative"], deployParameters[network]["wBTC"]], { gasLimit: 5e6 });
      var wEthToWBTC = await getWrapperAddress(wEthToWBTCTx);
      await setConverter(controller, 'wNative', 'wBTC', '0x7157d98368923a298C0882a503cF44353A847F37');

      // Sushi wBTC -> wNative
      var wBtcToWETHTx = await sushiFactory.createWrapper([deployParameters[network]["wBTC"], deployParameters[network]["wNative"]], { gasLimit: 5e6 });
      var wBtcToWETH = await getWrapperAddress(wBtcToWETHTx);
      await setConverter(controller, 'wBTC', 'wNative', wBtcToWETH);


      break;

  }

  // Wrapper ETH -> wETH
  await setConverter(controller, ethers.constants.AddressZero, "wNative", wrapper.address);

  // Unwrapper wETH -> ETH
  await setConverter(controller, "wNative", ethers.constants.AddressZero, unwrapper.address);
};

