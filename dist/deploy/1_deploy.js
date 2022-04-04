var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var hre = require('hardhat');
var createGetGasPrice = require('ethers-polygongastracker').createGetGasPrice;
var options = require('libp2p/src/keychain').options;
var validate = require('@openzeppelin/upgrades-core/dist/validate/index');
Object.defineProperty(validate, 'assertUpgradeSafe', {
    value: function () { }
});
var getControllerName = function () { return process.env.CHAIN === 'ETHEREUM' ? 'BadgerBridgeZeroController' : 'ZeroController'; };
var Logger = require('@ethersproject/logger').Logger;
var isLocalhost = !hre.network.config.live;
var _throwError = Logger.prototype.throwError;
var ethers = hre.ethers, deployments = hre.deployments, upgrades = hre.upgrades;
var _sendTransaction;
var walletMap = {};
var _a = require('./common'), deployFixedAddress = _a.deployFixedAddress, deployProxyFixedAddress = _a.deployProxyFixedAddress;
var JsonRpcProvider = ethers.providers.JsonRpcProvider;
var _getSigner = JsonRpcProvider.prototype.getSigner;
var SIGNER_ADDRESS = '0x0F4ee9631f4be0a63756515141281A3E2B293Bbe';
var deployParameters = require('../lib/fixtures');
var toAddress = function (contractOrAddress) { return (contractOrAddress || {}).address || contractOrAddress; };
var getController = function () { return __awaiter(_this, void 0, void 0, function () {
    var name, controller;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                name = getControllerName();
                return [4 /*yield*/, hre.ethers.getContract(name)];
            case 1:
                controller = _a.sent();
                return [2 /*return*/, controller];
        }
    });
}); };
var setConverter = function (controller, source, target, converter) { return __awaiter(_this, void 0, void 0, function () {
    var _a, sourceAddress, targetAddress, tx;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = [source, target].map(function (v) { return deployParameters[network][v] || v; }), sourceAddress = _a[0], targetAddress = _a[1];
                console.log('setting converter');
                return [4 /*yield*/, controller.setConverter(sourceAddress, targetAddress, toAddress(converter))];
            case 1:
                tx = _b.sent();
                console.log('setConverter(' + sourceAddress + ',' + targetAddress + ',' + toAddress(converter));
                return [2 /*return*/, tx];
        }
    });
}); };
var network = process.env.CHAIN || 'MATIC';
var common = require('./common');
var approveModule = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return __awaiter(_this, void 0, void 0, function () {
        var controller, rest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (getControllerName().match('Badger'))
                        return [2 /*return*/];
                    controller = args[0], rest = args.slice(1);
                    return [4 /*yield*/, controller.approveModule.apply(controller, rest)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
module.exports = function (_a) {
    var getChainId = _a.getChainId, getUnnamedAccounts = _a.getUnnamedAccounts, getNamedAccounts = _a.getNamedAccounts;
    return __awaiter(_this, void 0, void 0, function () {
        var deployer, ethersSigner, provider, _b, _c, _d, chainId, signer, deployerSigner, zeroUnderwriterLockBytecodeLib, zeroControllerFactory, zeroController, _e, zeroControllerArtifact, btcVaultFactory, btcVaultArtifact, btcVault, v, dummyVault, w, delegate, _f, _g, _h, controller, meta, module, _j, _k, quick, strategyRenVM, _l, _m, wrapper, unwrapper, curveFactory, getWrapperAddress, _o, wBTCToRenBTCTx, wBTCToRenBTC, renBTCToWBTCTx, renBTCToWBTC, wEthToWBTCTx, wEthToWBTC, wBtcToWETHTx, wBtcToWETH, sushiFactory, wBTCToRenBTCTx, wBTCToRenBTC, renBTCToWBTCTx, renBTCToWBTC, wEthToWBTCTx, wEthToWBTC, wBtcToWETHTx, wBtcToWETH, wETHToWBTCArbTx, wETHToWBTCArb, wBtcToWETHArbTx, wBtcToWETHArb, wBTCToRenBTCArbTx, wBTCToRenBTCArb, renBTCToWBTCArbTx, renBTCToWBTCArb;
        var _p;
        var _this = this;
        return __generator(this, function (_q) {
            switch (_q.label) {
                case 0:
                    if (!common.isSelectedDeployment(__filename)) // || process.env.FORKING === 'true')
                        return [2 /*return*/];
                    return [4 /*yield*/, getNamedAccounts()];
                case 1:
                    deployer = (_q.sent()).deployer;
                    return [4 /*yield*/, ethers.getSigners()];
                case 2:
                    ethersSigner = (_q.sent())[0];
                    provider = ethersSigner.provider;
                    _b = Number;
                    _d = (_c = ethers.utils).formatEther;
                    return [4 /*yield*/, provider.getBalance(deployer)];
                case 3:
                    if (!(_b.apply(void 0, [_d.apply(_c, [_q.sent()])]) === 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, ethersSigner.sendTransaction({
                            value: ethers.utils.parseEther('1'),
                            to: deployer
                        })];
                case 4:
                    _q.sent();
                    _q.label = 5;
                case 5: return [4 /*yield*/, provider.getNetwork()];
                case 6:
                    chainId = (_q.sent()).chainId;
                    if (!(chainId === 31337)) return [3 /*break*/, 8];
                    return [4 /*yield*/, hre.network.provider.request({
                            method: 'hardhat_impersonateAccount',
                            params: [SIGNER_ADDRESS]
                        })];
                case 7:
                    _q.sent();
                    _q.label = 8;
                case 8: return [4 /*yield*/, ethers.getSigner(SIGNER_ADDRESS)];
                case 9:
                    signer = _q.sent();
                    return [4 /*yield*/, ethers.getSigners()];
                case 10:
                    deployerSigner = (_q.sent())[0];
                    console.log('RUNNING');
                    return [4 /*yield*/, deployFixedAddress('ZeroUnderwriterLockBytecodeLib', {
                            contractName: 'ZeroUnderwriterLockBytecodeLib',
                            args: [],
                            from: deployer
                        })];
                case 11:
                    zeroUnderwriterLockBytecodeLib = _q.sent();
                    return [4 /*yield*/, hre.ethers.getContractFactory(getControllerName(), process.env.CHAIN === 'ETHEREUM' ? {} : {
                            libraries: {
                                ZeroUnderwriterLockBytecodeLib: zeroUnderwriterLockBytecodeLib.address
                            }
                        })];
                case 12:
                    zeroControllerFactory = _q.sent();
                    if (!(process.env.CHAIN === 'ETHEREUM')) return [3 /*break*/, 14];
                    return [4 /*yield*/, deployProxyFixedAddress(zeroControllerFactory, [deployer, deployer])];
                case 13:
                    _e = _q.sent();
                    return [3 /*break*/, 16];
                case 14: return [4 /*yield*/, deployProxyFixedAddress(zeroControllerFactory, ['0x0F4ee9631f4be0a63756515141281A3E2B293Bbe', deployParameters[network].gatewayRegistry], {
                        unsafeAllowLinkedLibraries: true
                    })];
                case 15:
                    _e = _q.sent();
                    _q.label = 16;
                case 16:
                    zeroController = _e;
                    return [4 /*yield*/, deployments.getArtifact(getControllerName())];
                case 17:
                    zeroControllerArtifact = _q.sent();
                    return [4 /*yield*/, deployments.save(getControllerName(), {
                            contractName: getControllerName(),
                            address: zeroController.address,
                            bytecode: zeroControllerArtifact.bytecode,
                            abi: zeroControllerArtifact.abi
                        })];
                case 18:
                    _q.sent();
                    console.log('waiting on proxy deploy to mine ...');
                    return [4 /*yield*/, zeroController.deployTransaction.wait()];
                case 19:
                    _q.sent();
                    if (getControllerName().match('Badger'))
                        return [2 /*return*/];
                    return [4 /*yield*/, ethers.getContractFactory('BTCVault')];
                case 20:
                    btcVaultFactory = _q.sent();
                    return [4 /*yield*/, hre.artifacts.readArtifact('BTCVault')];
                case 21:
                    btcVaultArtifact = _q.sent();
                    return [4 /*yield*/, deployProxyFixedAddress(btcVaultFactory, [
                            deployParameters[network]['renBTC'],
                            zeroController.address,
                            'zeroBTC',
                            'zBTC',
                        ])];
                case 22:
                    btcVault = _q.sent();
                    return [4 /*yield*/, deployments.save('BTCVault', {
                            contractName: 'BTCVault',
                            address: btcVault.address,
                            bytecode: btcVaultArtifact.bytecode,
                            abi: btcVaultArtifact.abi
                        })];
                case 23:
                    _q.sent();
                    return [4 /*yield*/, ethers.getContract('BTCVault')];
                case 24:
                    v = _q.sent();
                    return [4 /*yield*/, v.attach(deployParameters[network]['renBTC'])];
                case 25:
                    _q.sent();
                    return [4 /*yield*/, deployFixedAddress('DummyVault', {
                            contractName: 'DummyVault',
                            args: [deployParameters[network]['wBTC'], zeroController.address, 'yearnBTC', 'yvWBTC'],
                            from: deployer
                        })];
                case 26:
                    dummyVault = _q.sent();
                    return [4 /*yield*/, ethers.getContract('DummyVault')];
                case 27:
                    w = _q.sent();
                    return [4 /*yield*/, w.attach(deployParameters[network]['wBTC'])];
                case 28:
                    _q.sent();
                    // .balanceOf(ethers.constants.AddressZero);
                    console.log('Deployed DummyVault to', dummyVault.address);
                    _f = deployFixedAddress;
                    _g = ['DelegateUnderwriter'];
                    _p = {
                        contractName: 'DelegateUnderwriter'
                    };
                    if (!isLocalhost) return [3 /*break*/, 29];
                    _h = deployer;
                    return [3 /*break*/, 31];
                case 29: return [4 /*yield*/, ethers.getContract('GnosisSafe')];
                case 30:
                    _h = (_q.sent()).address;
                    _q.label = 31;
                case 31: return [4 /*yield*/, _f.apply(void 0, _g.concat([(_p.args = [
                            _h,
                            zeroController.address,
                            isLocalhost ? [deployer] : []
                        ],
                            _p.libraries = {},
                            _p.from = deployer,
                            _p)]))];
                case 32:
                    delegate = _q.sent();
                    return [4 /*yield*/, getController()];
                case 33:
                    controller = _q.sent();
                    console.log('got controller');
                    if (!isLocalhost) return [3 /*break*/, 36];
                    return [4 /*yield*/, deployFixedAddress(process.env.CHAIN === 'ETHEREUM' ? 'MetaExecutorEthereum' : 'MetaExecutor', {
                            args: [controller.address, ethers.utils.parseUnits('15', 8), '100000'],
                            contractName: process.env.CHAIN === 'ETHEREUM' ? 'MetaExecutorEthereum' : 'MetaExecutor',
                            libraries: {},
                            from: deployer
                        })];
                case 34:
                    meta = _q.sent();
                    return [4 /*yield*/, approveModule(controller, meta.address, true)];
                case 35:
                    _q.sent();
                    _q.label = 36;
                case 36: return [4 /*yield*/, controller.mint(delegate.address, deployParameters[network].renBTC)];
                case 37:
                    _q.sent();
                    console.log('GOT CONTROLLER');
                    if (!(process.env.CHAIN === 'ARBITRUM')) return [3 /*break*/, 39];
                    return [4 /*yield*/, deployFixedAddress('ArbitrumConvert', {
                            args: [zeroController.address],
                            contractName: 'ArbitrumConvert',
                            from: deployer
                        })];
                case 38:
                    _j = _q.sent();
                    return [3 /*break*/, 44];
                case 39:
                    if (!(process.env.CHAIN === 'MATIC')) return [3 /*break*/, 41];
                    return [4 /*yield*/, deployFixedAddress('PolygonConvert', {
                            args: [zeroController.address],
                            contractName: 'PolygonConvert',
                            from: deployer
                        })];
                case 40:
                    _k = _q.sent();
                    return [3 /*break*/, 43];
                case 41: return [4 /*yield*/, deployFixedAddress('BadgerBridge', {
                        args: [zeroController.address],
                        contractName: 'BadgerBridge',
                        from: deployer
                    })];
                case 42:
                    _k = _q.sent();
                    _q.label = 43;
                case 43:
                    _j = _k;
                    _q.label = 44;
                case 44:
                    module = _j;
                    return [4 /*yield*/, approveModule(controller, module.address, true)];
                case 45:
                    _q.sent();
                    if (!(network === 'ARBITRUM')) return [3 /*break*/, 48];
                    return [4 /*yield*/, deployFixedAddress('ArbitrumConvertQuick', {
                            args: [controller.address, ethers.utils.parseUnits('15', 8), '100000'],
                            contractName: 'ArbitrumConvertQuick',
                            libraries: {},
                            from: deployer
                        })];
                case 46:
                    quick = _q.sent();
                    return [4 /*yield*/, controller.approveModule(quick.address, true)];
                case 47:
                    _q.sent();
                    _q.label = 48;
                case 48: return [4 /*yield*/, deployments.deploy(network === 'ARBITRUM' ? 'StrategyRenVMArbitrum' : network === 'MATIC' ? 'StrategyRenVM' : 'StrategyRenVMEthereum', {
                        args: [
                            zeroController.address,
                            deployParameters[network]['renBTC'],
                            deployParameters[network]['wNative'],
                            dummyVault.address,
                            deployParameters[network]['wBTC'],
                        ],
                        contractName: network === 'ARBITRUM' ? 'StrategyRenVMArbitrum' : network === 'ETHEREUM' ? 'StrategyRenVMEthereum' : 'StrategyRenVM',
                        from: deployer,
                        waitConfirmations: 1
                    })];
                case 49:
                    strategyRenVM = _q.sent();
                    _m = (_l = controller).setGovernance;
                    return [4 /*yield*/, ethersSigner.getAddress()];
                case 50: 
                //hijackSigner(ethersSigner);
                return [4 /*yield*/, _m.apply(_l, [_q.sent()])];
                case 51:
                    //hijackSigner(ethersSigner);
                    _q.sent();
                    return [4 /*yield*/, controller.setFee(ethers.utils.parseEther('0.003'))];
                case 52:
                    _q.sent();
                    //restoreSigner(ethersSigner);
                    return [4 /*yield*/, controller.approveStrategy(deployParameters[network]['renBTC'], strategyRenVM.address)];
                case 53:
                    //restoreSigner(ethersSigner);
                    _q.sent();
                    return [4 /*yield*/, controller.setStrategy(deployParameters[network]['renBTC'], strategyRenVM.address, false)];
                case 54: return [4 /*yield*/, (_q.sent()).wait()];
                case 55:
                    _q.sent();
                    //restoreSigner(ethersSigner);
                    return [4 /*yield*/, deployFixedAddress('ZeroCurveFactory', {
                            args: [],
                            contractName: 'ZeroCurveFactory',
                            from: deployer
                        })];
                case 56:
                    //restoreSigner(ethersSigner);
                    _q.sent();
                    return [4 /*yield*/, deployFixedAddress('ZeroUniswapFactory', {
                            args: [deployParameters[network]['Router']],
                            contractName: 'ZeroUniswapFactory',
                            from: deployer
                        })];
                case 57:
                    _q.sent();
                    return [4 /*yield*/, deployFixedAddress('WrapNative', {
                            args: [deployParameters[network]['wNative']],
                            contractName: 'WrapNative',
                            from: deployer
                        })];
                case 58:
                    _q.sent();
                    return [4 /*yield*/, deployFixedAddress('UnwrapNative', {
                            args: [deployParameters[network]['wNative']],
                            contractName: 'UnwrapNative',
                            from: deployer
                        })];
                case 59:
                    _q.sent();
                    return [4 /*yield*/, ethers.getContract('WrapNative', deployer)];
                case 60:
                    wrapper = _q.sent();
                    return [4 /*yield*/, ethers.getContract('UnwrapNative', deployer)];
                case 61:
                    unwrapper = _q.sent();
                    return [4 /*yield*/, ethers.getContract('ZeroCurveFactory', deployer)];
                case 62:
                    curveFactory = _q.sent();
                    getWrapperAddress = function (tx) { return __awaiter(_this, void 0, void 0, function () {
                        var receipt, events, lastEvent;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.wait()];
                                case 1:
                                    receipt = _a.sent();
                                    console.log(require('util').inspect(receipt, { colors: true, depth: 15 }));
                                    events = receipt.events;
                                    lastEvent = events.find(function (v) { return (v.args || {})._wrapper; });
                                    return [2 /*return*/, lastEvent.args._wrapper];
                            }
                        });
                    }); };
                    /*
                  let getWrapperAddress = async () => {
                    getWrapperAddress = _getWrapperAddress;
                    return '0x400779D2e22d4dec04f6043114E88820E115903A';
                  };
                  */
                    console.log('CONVERTERS');
                    _o = network;
                    switch (_o) {
                        case 'ETHEREUM': return [3 /*break*/, 63];
                        case 'MATIC': return [3 /*break*/, 76];
                        case 'ARBITRUM': return [3 /*break*/, 90];
                    }
                    return [3 /*break*/, 103];
                case 63:
                    console.log('RUNNING ETHEREUM');
                    return [4 /*yield*/, curveFactory.functions.createWrapper(false, 1, 0, deployParameters[network]['Curve_SBTC'])];
                case 64:
                    wBTCToRenBTCTx = _q.sent();
                    return [4 /*yield*/, getWrapperAddress(wBTCToRenBTCTx)];
                case 65:
                    wBTCToRenBTC = _q.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'renBTC', wBTCToRenBTC)];
                case 66:
                    _q.sent();
                    return [4 /*yield*/, curveFactory.createWrapper(false, 0, 1, deployParameters[network]['Curve_SBTC'])];
                case 67:
                    renBTCToWBTCTx = _q.sent();
                    return [4 /*yield*/, getWrapperAddress(renBTCToWBTCTx)];
                case 68:
                    renBTCToWBTC = _q.sent();
                    return [4 /*yield*/, setConverter(controller, 'renBTC', 'wBTC', renBTCToWBTC)];
                case 69:
                    _q.sent();
                    return [4 /*yield*/, curveFactory.createWrapper(false, 2, 1, deployParameters[network]['Curve_TriCryptoTwo'], { gasLimit: 8e6 })];
                case 70:
                    wEthToWBTCTx = _q.sent();
                    return [4 /*yield*/, getWrapperAddress(wEthToWBTCTx)];
                case 71:
                    wEthToWBTC = _q.sent();
                    return [4 /*yield*/, setConverter(controller, 'wNative', 'wBTC', wEthToWBTC)];
                case 72:
                    _q.sent();
                    return [4 /*yield*/, curveFactory.createWrapper(false, 1, 2, deployParameters[network]['Curve_TriCryptoTwo'], { gasLimit: 8e6 })];
                case 73:
                    wBtcToWETHTx = _q.sent();
                    return [4 /*yield*/, getWrapperAddress(wBtcToWETHTx)];
                case 74:
                    wBtcToWETH = _q.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'wNative', wBtcToWETH)];
                case 75:
                    _q.sent();
                    return [3 /*break*/, 103];
                case 76: return [4 /*yield*/, ethers.getContract('ZeroUniswapFactory', deployer)];
                case 77:
                    sushiFactory = _q.sent();
                    console.log('MATIC');
                    return [4 /*yield*/, curveFactory.createWrapper(true, 0, 1, deployParameters[network]['Curve_Ren'], {
                            gasLimit: 5e6
                        })];
                case 78:
                    wBTCToRenBTCTx = _q.sent();
                    return [4 /*yield*/, getWrapperAddress(wBTCToRenBTCTx)];
                case 79:
                    wBTCToRenBTC = _q.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'renBTC', wBTCToRenBTC)];
                case 80:
                    _q.sent();
                    return [4 /*yield*/, curveFactory.createWrapper(true, 1, 0, deployParameters[network]['Curve_Ren'], {
                            gasLimit: 5e6
                        })];
                case 81:
                    renBTCToWBTCTx = _q.sent();
                    return [4 /*yield*/, getWrapperAddress(renBTCToWBTCTx)];
                case 82:
                    renBTCToWBTC = _q.sent();
                    return [4 /*yield*/, setConverter(controller, 'renBTC', 'wBTC', renBTCToWBTC)];
                case 83:
                    _q.sent();
                    return [4 /*yield*/, sushiFactory.createWrapper([deployParameters[network]['wNative'], deployParameters[network]['wBTC']], { gasLimit: 5e6 })];
                case 84:
                    wEthToWBTCTx = _q.sent();
                    return [4 /*yield*/, getWrapperAddress(wEthToWBTCTx)];
                case 85:
                    wEthToWBTC = _q.sent();
                    return [4 /*yield*/, setConverter(controller, 'wNative', 'wBTC', '0x7157d98368923a298C0882a503cF44353A847F37')];
                case 86:
                    _q.sent();
                    return [4 /*yield*/, sushiFactory.createWrapper([deployParameters[network]['wBTC'], deployParameters[network]['wNative']], { gasLimit: 5e6 })];
                case 87:
                    wBtcToWETHTx = _q.sent();
                    return [4 /*yield*/, getWrapperAddress(wBtcToWETHTx)];
                case 88:
                    wBtcToWETH = _q.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'wNative', wBtcToWETH)];
                case 89:
                    _q.sent();
                    return [3 /*break*/, 103];
                case 90:
                    console.log('Running arbitrum');
                    return [4 /*yield*/, curveFactory.createWrapper(false, 2, 1, '0x960ea3e3C7FB317332d990873d354E18d7645590')];
                case 91:
                    wETHToWBTCArbTx = _q.sent();
                    return [4 /*yield*/, getWrapperAddress(wETHToWBTCArbTx)];
                case 92:
                    wETHToWBTCArb = _q.sent();
                    return [4 /*yield*/, setConverter(controller, 'wNative', 'wBTC', wETHToWBTCArb)];
                case 93:
                    _q.sent();
                    console.log('wETH->wBTC Converter Set.');
                    return [4 /*yield*/, curveFactory.createWrapper(false, 1, 2, '0x960ea3e3C7FB317332d990873d354E18d7645590')];
                case 94:
                    wBtcToWETHArbTx = _q.sent();
                    return [4 /*yield*/, getWrapperAddress(wBtcToWETHArbTx)];
                case 95:
                    wBtcToWETHArb = _q.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'wNative', wBtcToWETHArb)];
                case 96:
                    _q.sent();
                    console.log('wBTC->wETH Converter Set.');
                    return [4 /*yield*/, curveFactory.createWrapper(false, 0, 1, deployParameters[network]['Curve_Ren'])];
                case 97:
                    wBTCToRenBTCArbTx = _q.sent();
                    return [4 /*yield*/, getWrapperAddress(wBTCToRenBTCArbTx)];
                case 98:
                    wBTCToRenBTCArb = _q.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'renBTC', wBTCToRenBTCArb)];
                case 99:
                    _q.sent();
                    console.log('wBTC->renBTC Converter Set.');
                    return [4 /*yield*/, curveFactory.createWrapper(false, 1, 0, deployParameters[network]['Curve_Ren'])];
                case 100:
                    renBTCToWBTCArbTx = _q.sent();
                    console.log('renBTC->wBTC Converter Set.');
                    return [4 /*yield*/, getWrapperAddress(renBTCToWBTCArbTx)];
                case 101:
                    renBTCToWBTCArb = _q.sent();
                    return [4 /*yield*/, setConverter(controller, 'renBTC', 'wBTC', renBTCToWBTCArb)];
                case 102:
                    _q.sent();
                    _q.label = 103;
                case 103: 
                // Wrapper ETH -> wETH
                return [4 /*yield*/, setConverter(controller, ethers.constants.AddressZero, 'wNative', wrapper.address)];
                case 104:
                    // Wrapper ETH -> wETH
                    _q.sent();
                    // Unwrapper wETH -> ETH
                    return [4 /*yield*/, setConverter(controller, 'wNative', ethers.constants.AddressZero, unwrapper.address)];
                case 105:
                    // Unwrapper wETH -> ETH
                    _q.sent();
                    return [4 /*yield*/, controller.setGasParameters(ethers.utils.parseUnits('2', 9), '250000', '500000', '500000')];
                case 106:
                    _q.sent();
                    return [2 /*return*/];
            }
        });
    });
};
