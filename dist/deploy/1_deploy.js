var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const hre = require("hardhat");
const { options } = require("libp2p/src/keychain");
const validate = require('@openzeppelin/upgrades-core/dist/validate/index');
Object.defineProperty(validate, 'assertUpgradeSafe', {
    value: () => { }
});
const { Logger } = require('@ethersproject/logger');
const _throwError = Logger.prototype.throwError;
const { ethers, deployments, upgrades } = hre;
let _sendTransaction;
const walletMap = {};
const deployFixedAddress = (...args) => __awaiter(this, void 0, void 0, function* () {
    console.log('Deploying ' + args[0]);
    args[1].waitConfirmations = 1;
    const [signer] = yield ethers.getSigners();
    //  hijackSigner(signer);
    const result = yield deployments.deploy(...args);
    //  restoreSigner(signer);
    console.log('Deployed to ' + result.address);
    return result;
});
const deployProxyFixedAddress = (...args) => __awaiter(this, void 0, void 0, function* () {
    console.log('Deploying proxy');
    //const [signer] = await ethers.getSigners();
    //hijackSigner(signer);
    const result = yield upgrades.deployProxy(...args);
    //restoreSigner(signer);
    return result;
});
const { JsonRpcProvider } = ethers.providers;
const { getSigner: _getSigner } = JsonRpcProvider.prototype;
const SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";
const deployParameters = require('../lib/fixtures');
const toAddress = (contractOrAddress) => ((contractOrAddress || {})).address || contractOrAddress;
const setConverter = (controller, source, target, converter) => __awaiter(this, void 0, void 0, function* () {
    const [sourceAddress, targetAddress] = [source, target].map((v) => deployParameters[network][v] || v);
    console.log('setting converter');
    const tx = yield controller.setConverter(sourceAddress, targetAddress, toAddress(converter)); /* { gasPrice: '5000000', gasLimit: '5000000' }); */
    console.log('setConverter(' + sourceAddress + ',' + targetAddress + ',' + toAddress(converter));
    return tx;
});
const network = process.env.CHAIN || 'MATIC';
module.exports = ({ getChainId, getUnnamedAccounts, getNamedAccounts, }) => __awaiter(this, void 0, void 0, function* () {
    const { deployer } = yield getNamedAccounts(); //used as governance address
    const [ethersSigner] = yield ethers.getSigners();
    const { provider } = ethersSigner;
    if (Number(ethers.utils.formatEther(yield provider.getBalance(deployer))) === 0)
        yield ethersSigner.sendTransaction({
            value: ethers.utils.parseEther('1'),
            to: deployer
        });
    const { chainId } = yield provider.getNetwork();
    if (chainId === 31337) {
        yield hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [SIGNER_ADDRESS]
        });
    }
    const signer = yield ethers.getSigner(SIGNER_ADDRESS);
    const [deployerSigner] = yield ethers.getSigners();
    console.log("RUNNING");
    const zeroUnderwriterLockBytecodeLib = yield deployFixedAddress('ZeroUnderwriterLockBytecodeLib', {
        contractName: 'ZeroUnderwriterLockBytecodeLib',
        args: [],
        from: deployer
    });
    const zeroControllerFactory = (yield hre.ethers.getContractFactory("ZeroController", {
        libraries: {
            ZeroUnderwriterLockBytecodeLib: zeroUnderwriterLockBytecodeLib.address
        }
    }));
    const zeroController = yield deployProxyFixedAddress(zeroControllerFactory, ["0x0F4ee9631f4be0a63756515141281A3E2B293Bbe", deployParameters[network].gatewayRegistry], {
        unsafeAllowLinkedLibraries: true
    });
    const zeroControllerArtifact = yield deployments.getArtifact('ZeroController');
    yield deployments.save('ZeroController', {
        contractName: 'ZeroController',
        address: zeroController.address,
        bytecode: zeroControllerArtifact.bytecode,
        abi: zeroControllerArtifact.abi
    });
    console.log('waiting on proxy deploy to mine ...');
    yield zeroController.deployTransaction.wait();
    //	console.log('done!');
    yield deployFixedAddress('BTCVault', {
        contractName: 'BTCVault',
        args: [deployParameters[network]['renBTC'], zeroController.address, "zeroBTC", "zBTC"],
        from: deployer
    });
    const v = yield ethers.getContract('BTCVault');
    yield v.attach(deployParameters[network]['renBTC']).balanceOf(ethers.constants.AddressZero);
    const dummyVault = yield deployFixedAddress('DummyVault', {
        contractName: 'DummyVault',
        args: [deployParameters[network]['wBTC'], zeroController.address, "yearnBTC", "yvWBTC"],
        from: deployer
    });
    const w = yield ethers.getContract('DummyVault');
    yield w.attach(deployParameters[network]['wBTC']).balanceOf(ethers.constants.AddressZero);
    console.log("Deployed DummyVault to", dummyVault.address);
    yield deployFixedAddress("TrivialUnderwriter", {
        contractName: 'TrivialUnderwriter',
        args: [zeroController.address],
        from: deployer,
    });
    const controller = yield ethers.getContract('ZeroController');
    console.log("GOT CONTROLLER");
    const module = process.env.CHAIN === 'ARBITRUM' ? yield deployFixedAddress('ArbitrumConvert', { args: [zeroController.address], contractName: 'ArbitrumConvert', from: deployer }) : yield deployFixedAddress('Swap', {
        args: [
            zeroController.address,
            deployParameters[network]['wETH'],
            deployParameters[network]['wBTC'],
            deployParameters[network]['sushiRouter'],
            deployParameters[network]['USDC'],
            deployParameters[network]['renBTC'] // controllerWant
        ],
        contractName: 'Swap',
        from: deployer
    });
    yield controller.approveModule(module.address, true);
    const strategyRenVM = yield deployments.deploy('StrategyRenVM', {
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
    yield controller.setGovernance(yield ethersSigner.getAddress());
    yield controller.setFee(ethers.utils.parseEther('0.003'));
    //restoreSigner(ethersSigner);
    yield controller.approveStrategy(deployParameters[network]['renBTC'], strategyRenVM.address);
    yield (yield controller.setStrategy(deployParameters[network]['renBTC'], strategyRenVM.address, false)).wait();
    //restoreSigner(ethersSigner);
    yield deployFixedAddress('ZeroCurveFactory', {
        args: [],
        contractName: 'ZeroCurveFactory',
        from: deployer
    });
    yield deployFixedAddress('ZeroUniswapFactory', {
        args: [deployParameters[network]['Router']],
        contractName: 'ZeroUniswapFactory',
        from: deployer
    });
    yield deployFixedAddress('WrapNative', {
        args: [deployParameters[network]['wNative']],
        contractName: 'WrapNative',
        from: deployer
    });
    yield deployFixedAddress('UnwrapNative', {
        args: [deployParameters[network]['wNative']],
        contractName: 'UnwrapNative',
        from: deployer
    });
    //Deploy converters
    const wrapper = yield ethers.getContract('WrapNative', deployer);
    const unwrapper = yield ethers.getContract('UnwrapNative', deployer);
    const curveFactory = yield ethers.getContract('ZeroCurveFactory', deployer);
    const _getWrapperAddress = (tx) => __awaiter(this, void 0, void 0, function* () {
        const receipt = yield tx.wait();
        console.log(require('util').inspect(receipt, { colors: true, depth: 15 }));
        const { events } = receipt;
        const lastEvent = events.find((v) => (v.args || {})._wrapper);
        return lastEvent.args._wrapper;
    });
    let getWrapperAddress = () => __awaiter(this, void 0, void 0, function* () {
        getWrapperAddress = _getWrapperAddress;
        return '0x400779D2e22d4dec04f6043114E88820E115903A';
    });
    console.log("CONVERTERS");
    // Deploy converters
    switch (network) {
        case "ETHEREUM":
            console.log("RUNNING ETHEREUM");
            // Curve wBTC -> renBTC
            var wBTCToRenBTCTx = yield curveFactory.functions.createWrapper(false, 1, 0, deployParameters[network]["Curve_SBTC"]);
            var wBTCToRenBTC = yield getWrapperAddress(wBTCToRenBTCTx);
            yield setConverter(controller, 'wBTC', 'renBTC', wBTCToRenBTC);
            // Curve renBTC -> wBTC
            var renBTCToWBTCTx = yield curveFactory.createWrapper(false, 0, 1, deployParameters[network]["Curve_SBTC"]);
            var renBTCToWBTC = yield getWrapperAddress(renBTCToWBTCTx);
            yield setConverter(controller, 'renBTC', 'wBTC', renBTCToWBTC);
            // Curve wNative -> wBTC
            var wEthToWBTCTx = yield curveFactory.createWrapper(false, 2, 1, deployParameters[network]["Curve_TriCryptoTwo"], { gasLimit: 8e6 });
            var wEthToWBTC = yield getWrapperAddress(wEthToWBTCTx);
            yield setConverter(controller, 'wNative', 'wBTC', wEthToWBTC);
            // Curve wBTC -> wNative
            var wBtcToWETHTx = yield curveFactory.createWrapper(false, 1, 2, deployParameters[network]["Curve_TriCryptoTwo"], { gasLimit: 8e6 });
            var wBtcToWETH = yield getWrapperAddress(wBtcToWETHTx);
            yield setConverter(controller, 'wBTC', 'wNative', wBtcToWETH);
            break;
        case 'MATIC':
            const sushiFactory = yield ethers.getContract('ZeroUniswapFactory', deployer);
            console.log("MATIC");
            // Curve wBTC -> renBTC
            var wBTCToRenBTCTx = yield curveFactory.createWrapper(true, 0, 1, deployParameters[network]["Curve_Ren"], { gasLimit: 5e6 });
            var wBTCToRenBTC = yield getWrapperAddress(wBTCToRenBTCTx);
            yield setConverter(controller, 'wBTC', 'renBTC', wBTCToRenBTC);
            // Curve renBTC -> wBTC
            var renBTCToWBTCTx = yield curveFactory.createWrapper(true, 1, 0, deployParameters[network]["Curve_Ren"], { gasLimit: 5e6 });
            var renBTCToWBTC = yield getWrapperAddress(renBTCToWBTCTx);
            yield setConverter(controller, 'renBTC', 'wBTC', renBTCToWBTC);
            // Sushi wNative -> wBTC
            var wEthToWBTCTx = yield sushiFactory.createWrapper([deployParameters[network]["wNative"], deployParameters[network]["wBTC"]], { gasLimit: 5e6 });
            var wEthToWBTC = yield getWrapperAddress(wEthToWBTCTx);
            yield setConverter(controller, 'wNative', 'wBTC', '0x7157d98368923a298C0882a503cF44353A847F37');
            // Sushi wBTC -> wNative
            var wBtcToWETHTx = yield sushiFactory.createWrapper([deployParameters[network]["wBTC"], deployParameters[network]["wNative"]], { gasLimit: 5e6 });
            var wBtcToWETH = yield getWrapperAddress(wBtcToWETHTx);
            yield setConverter(controller, 'wBTC', 'wNative', wBtcToWETH);
            break;
        case 'ARBITRUM':
            console.log("Running arbitrum");
            const wETHToWBTCArbTx = yield curveFactory.createWrapper(false, 2, 1, '0x960ea3e3C7FB317332d990873d354E18d7645590');
            var wETHToWBTCArb = yield getWrapperAddress(wETHToWBTCArbTx);
            yield setConverter(controller, 'wNative', 'wBTC', wETHToWBTCArb);
            console.log("wETH->wBTC Converter Set.");
            var wBtcToWETHArbTx = yield curveFactory.createWrapper(false, 1, 2, '0x960ea3e3C7FB317332d990873d354E18d7645590');
            var wBtcToWETHArb = yield getWrapperAddress(wBtcToWETHArbTx);
            yield setConverter(controller, 'wBTC', 'wNative', wBtcToWETHArb);
            console.log("wBTC->wETH Converter Set.");
            // Curve wBTC -> renBTC
            var wBTCToRenBTCArbTx = yield curveFactory.createWrapper(false, 0, 1, deployParameters[network]["Curve_Ren"]);
            var wBTCToRenBTCArb = yield getWrapperAddress(wBTCToRenBTCArbTx);
            yield setConverter(controller, 'wBTC', 'renBTC', wBTCToRenBTCArb);
            console.log("wBTC->renBTC Converter Set.");
            // Curve renBTC -> wBTC
            var renBTCToWBTCArbTx = yield curveFactory.createWrapper(false, 1, 0, deployParameters[network]["Curve_Ren"]);
            console.log("renBTC->wBTC Converter Set.");
            var renBTCToWBTCArb = yield getWrapperAddress(renBTCToWBTCArbTx);
            yield setConverter(controller, 'renBTC', 'wBTC', renBTCToWBTCArb);
    }
    // Wrapper ETH -> wETH
    yield setConverter(controller, ethers.constants.AddressZero, "wNative", wrapper.address);
    // Unwrapper wETH -> ETH
    yield setConverter(controller, "wNative", ethers.constants.AddressZero, unwrapper.address);
});
