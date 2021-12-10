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

const deployParameters = require('../lib/fixtures');

const toAddress = (contractOrAddress) => ((contractOrAddress || {})).address || contractOrAddress;

const setConverter = async (controller, source, target, converter) => {
  const [sourceAddress, targetAddress] = [source, target].map((v) => deployParameters[network][v] || v);
  console.log('setting converter');
  const tx = await controller.setConverter(sourceAddress, targetAddress, toAddress(converter));/* { gasPrice: '5000000', gasLimit: '5000000' }); */
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
  console.log("RUNNING");

  const zeroUnderwriterLockBytecodeLib = { address: '0xfFd2EF3D44a2ea1B5E88780C1c85bcf6B2Aa4Bb5' };
  const zeroController = { address: '0xba227751e973C6DfEb4A56F811215F847EFEfC3E' };
  const dummyVault = { address: '0x9eDDC94bB952117342cB1f556ea0591363F7B833' };
  const strategyRenVM = { address: '0x4615b36Cb20E9707c3e4dc8376ea6863C38c14Cc' };
  
  
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
  
//	console.log('done!');
  
  const zeroController = await hre.ethers.getContract('ZeroController');
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
  
  const controller = await ethers.getContract('ZeroController');
  console.log("GOT CONTROLLER"); 
  
  
  const module = process.env.CHAIN === 'ARBITRUM' ? await deployFixedAddress('ArbitrumConvert', { args: [ zeroController.address ], contractName: 'ArbitrumConvert', from: deployer }) : await deployFixedAddress('Swap', {
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
  await controller.approveModule(module.address, true);
  
  
  const strategyRenVM = await deployments.deploy('StrategyRenVM', {
    args: [
      zeroController.address,
      deployParameters[network]["renBTC"],
      deployParameters[network]["wNative"], dummyVault.address,
      deployParameters[network]['wBTC']
    ],
    contractName: 'StrategyRenVM',
    from: deployer,
    waitConfirmations: 1
  });
  //hijackSigner(ethersSigner);
  await controller.setGovernance(await ethersSigner.getAddress());
  await controller.setFee(ethers.utils.parseEther('0.003'));
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

  const _getWrapperAddress = async (tx) => {
    const receipt = await tx.wait();
    console.log(require('util').inspect(receipt, { colors: true, depth: 15 }));
    const { events } = receipt;
    const lastEvent = events.find((v) => (v.args || {})._wrapper);
    return lastEvent.args._wrapper;
  };
  let getWrapperAddress = async () => {
    getWrapperAddress = _getWrapperAddress;
    return '0x400779D2e22d4dec04f6043114E88820E115903A';
  };
  console.log("CONVERTERS");
  // Deploy converters
  switch (network) {
    case "ETHEREUM":
      console.log("RUNNING ETHEREUM");
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
    case 'MATIC':
      const sushiFactory = await ethers.getContract('ZeroUniswapFactory', deployer);
      console.log("MATIC");
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
    case 'ARBITRUM':
      console.log("Running arbitrum");
      await curveFactory.createWrapper(false, 2, 1, '0x960ea3e3C7FB317332d990873d354E18d7645590')
      var wETHToWBTCArb = await getWrapperAddress(wETHToWBTCArbTx);
      await setConverter(controller, 'wNative', 'wBTC', wETHToWBTCArb);
      console.log("wETH->wBTC Converter Set.");
      var wBtcToWETHArbTx = await curveFactory.createWrapper(false, 1, 2, '0x960ea3e3C7FB317332d990873d354E18d7645590');
      var wBtcToWETHArb = await getWrapperAddress(wBtcToWETHArbTx);
      await setConverter(controller, 'wBTC', 'wNative', wBtcToWETHArb);
      console.log("wBTC->wETH Converter Set.");
      // Curve wBTC -> renBTC
      var wBTCToRenBTCArbTx = await curveFactory.createWrapper(false, 0, 1, deployParameters[network]["Curve_Ren"]);
      var wBTCToRenBTCArb = await getWrapperAddress(wBTCToRenBTCArbTx);
      await setConverter(controller, 'wBTC', 'renBTC', wBTCToRenBTCArb);
      console.log("wBTC->renBTC Converter Set.");
      // Curve renBTC -> wBTC
      var renBTCToWBTCArbTx = await curveFactory.createWrapper(false, 1, 0, deployParameters[network]["Curve_Ren"]);
      console.log("renBTC->wBTC Converter Set.");
      var renBTCToWBTCArb = await getWrapperAddress(renBTCToWBTCArbTx);
      await setConverter(controller, 'renBTC', 'wBTC', renBTCToWBTCArb);
  }


  // Wrapper ETH -> wETH
  await setConverter(controller, ethers.constants.AddressZero, "wNative", wrapper.address);

  // Unwrapper wETH -> ETH
  await setConverter(controller, "wNative", ethers.constants.AddressZero, unwrapper.address);
};