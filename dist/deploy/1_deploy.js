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
var hre = require("hardhat");
var options = require("libp2p/src/keychain").options;
var validate = require('@openzeppelin/upgrades-core/dist/validate/index');
Object.defineProperty(validate, 'assertUpgradeSafe', {
    value: function () { }
});
var Logger = require('@ethersproject/logger').Logger;
var _throwError = Logger.prototype.throwError;
var ethers = hre.ethers, deployments = hre.deployments, upgrades = hre.upgrades;
var _sendTransaction;
var walletMap = {};
var deployFixedAddress = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return __awaiter(_this, void 0, void 0, function () {
        var signer, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Deploying ' + args[0]);
                    args[1].waitConfirmations = 1;
                    return [4 /*yield*/, ethers.getSigners()];
                case 1:
                    signer = (_a.sent())[0];
                    return [4 /*yield*/, deployments.deploy.apply(deployments, args)];
                case 2:
                    result = _a.sent();
                    //  restoreSigner(signer);
                    console.log('Deployed to ' + result.address);
                    return [2 /*return*/, result];
            }
        });
    });
};
var deployProxyFixedAddress = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Deploying proxy');
                    return [4 /*yield*/, upgrades.deployProxy.apply(upgrades, args)];
                case 1:
                    result = _a.sent();
                    //restoreSigner(signer);
                    return [2 /*return*/, result];
            }
        });
    });
};
var JsonRpcProvider = ethers.providers.JsonRpcProvider;
var _getSigner = JsonRpcProvider.prototype.getSigner;
var SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";
var deployParameters = require('../lib/fixtures');
var toAddress = function (contractOrAddress) { return ((contractOrAddress || {})).address || contractOrAddress; };
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
module.exports = function (_a) {
    var getChainId = _a.getChainId, getUnnamedAccounts = _a.getUnnamedAccounts, getNamedAccounts = _a.getNamedAccounts;
    return __awaiter(_this, void 0, void 0, function () {
        var deployer, ethersSigner, provider, _b, _c, _d, chainId, signer, deployerSigner, zeroUnderwriterLockBytecodeLib, zeroControllerFactory, zeroController, zeroControllerArtifact, v, dummyVault, w, controller, module, _e, _f, strategyRenVM, _g, _h, wrapper, unwrapper, curveFactory, getWrapperAddress, _j, wBTCToRenBTCTx, wBTCToRenBTC, renBTCToWBTCTx, renBTCToWBTC, wEthToWBTCTx, wEthToWBTC, wBtcToWETHTx, wBtcToWETH, sushiFactory, wBTCToRenBTCTx, wBTCToRenBTC, renBTCToWBTCTx, renBTCToWBTC, wEthToWBTCTx, wEthToWBTC, wBtcToWETHTx, wBtcToWETH, wETHToWBTCArbTx, wETHToWBTCArb, wBtcToWETHArbTx, wBtcToWETHArb, wBTCToRenBTCArbTx, wBTCToRenBTCArb, renBTCToWBTCArbTx, renBTCToWBTCArb;
        var _this = this;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    if (process.env.CHAIN === 'ETHEREUM')
                        return [2 /*return*/];
                    return [4 /*yield*/, getNamedAccounts()];
                case 1:
                    deployer = (_k.sent()).deployer;
                    return [4 /*yield*/, ethers.getSigners()];
                case 2:
                    ethersSigner = (_k.sent())[0];
                    provider = ethersSigner.provider;
                    _b = Number;
                    _d = (_c = ethers.utils).formatEther;
                    return [4 /*yield*/, provider.getBalance(deployer)];
                case 3:
                    if (!(_b.apply(void 0, [_d.apply(_c, [_k.sent()])]) === 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, ethersSigner.sendTransaction({
                            value: ethers.utils.parseEther('1'),
                            to: deployer
                        })];
                case 4:
                    _k.sent();
                    _k.label = 5;
                case 5: return [4 /*yield*/, provider.getNetwork()];
                case 6:
                    chainId = (_k.sent()).chainId;
                    if (!(chainId === 31337)) return [3 /*break*/, 8];
                    return [4 /*yield*/, hre.network.provider.request({
                            method: "hardhat_impersonateAccount",
                            params: [SIGNER_ADDRESS]
                        })];
                case 7:
                    _k.sent();
                    _k.label = 8;
                case 8: return [4 /*yield*/, ethers.getSigner(SIGNER_ADDRESS)];
                case 9:
                    signer = _k.sent();
                    return [4 /*yield*/, ethers.getSigners()];
                case 10:
                    deployerSigner = (_k.sent())[0];
                    console.log("RUNNING");
                    return [4 /*yield*/, deployFixedAddress('ZeroUnderwriterLockBytecodeLib', {
                            contractName: 'ZeroUnderwriterLockBytecodeLib',
                            args: [],
                            from: deployer
                        })];
                case 11:
                    zeroUnderwriterLockBytecodeLib = _k.sent();
                    return [4 /*yield*/, hre.ethers.getContractFactory("ZeroController", {
                            libraries: {
                                ZeroUnderwriterLockBytecodeLib: zeroUnderwriterLockBytecodeLib.address
                            }
                        })];
                case 12:
                    zeroControllerFactory = (_k.sent());
                    return [4 /*yield*/, deployProxyFixedAddress(zeroControllerFactory, ["0x0F4ee9631f4be0a63756515141281A3E2B293Bbe", deployParameters[network].gatewayRegistry], {
                            unsafeAllowLinkedLibraries: true
                        })];
                case 13:
                    zeroController = _k.sent();
                    return [4 /*yield*/, deployments.getArtifact('ZeroController')];
                case 14:
                    zeroControllerArtifact = _k.sent();
                    return [4 /*yield*/, deployments.save('ZeroController', {
                            contractName: 'ZeroController',
                            address: zeroController.address,
                            bytecode: zeroControllerArtifact.bytecode,
                            abi: zeroControllerArtifact.abi
                        })];
                case 15:
                    _k.sent();
                    console.log('waiting on proxy deploy to mine ...');
                    return [4 /*yield*/, zeroController.deployTransaction.wait()];
                case 16:
                    _k.sent();
                    //	console.log('done!');
                    return [4 /*yield*/, deployFixedAddress('BTCVault', {
                            contractName: 'BTCVault',
                            args: [deployParameters[network]['renBTC'], zeroController.address, "zeroBTC", "zBTC"],
                            from: deployer
                        })];
                case 17:
                    //	console.log('done!');
                    _k.sent();
                    return [4 /*yield*/, ethers.getContract('BTCVault')];
                case 18:
                    v = _k.sent();
                    return [4 /*yield*/, v.attach(deployParameters[network]['renBTC'])
                        // .balanceOf(ethers.constants.AddressZero);
                    ];
                case 19:
                    _k.sent();
                    return [4 /*yield*/, deployFixedAddress('DummyVault', {
                            contractName: 'DummyVault',
                            args: [deployParameters[network]['wBTC'], zeroController.address, "yearnBTC", "yvWBTC"],
                            from: deployer
                        })];
                case 20:
                    dummyVault = _k.sent();
                    return [4 /*yield*/, ethers.getContract('DummyVault')];
                case 21:
                    w = _k.sent();
                    return [4 /*yield*/, w.attach(deployParameters[network]['wBTC'])
                        // .balanceOf(ethers.constants.AddressZero);
                    ];
                case 22:
                    _k.sent();
                    // .balanceOf(ethers.constants.AddressZero);
                    console.log("Deployed DummyVault to", dummyVault.address);
                    return [4 /*yield*/, deployFixedAddress("TrivialUnderwriter", {
                            contractName: 'TrivialUnderwriter',
                            args: [zeroController.address],
                            from: deployer
                        })];
                case 23:
                    _k.sent();
                    return [4 /*yield*/, ethers.getContract('ZeroController')];
                case 24:
                    controller = _k.sent();
                    console.log("GOT CONTROLLER");
                    if (!(process.env.CHAIN === 'ARBITRUM')) return [3 /*break*/, 26];
                    return [4 /*yield*/, deployFixedAddress('ArbitrumConvert', { args: [zeroController.address], contractName: 'ArbitrumConvert', from: deployer })];
                case 25:
                    _e = _k.sent();
                    return [3 /*break*/, 30];
                case 26:
                    if (!(process.env.CHAIN === "MATIC")) return [3 /*break*/, 28];
                    return [4 /*yield*/, deployFixedAddress('PolygonConvert', { args: [zeroController.address], contractName: 'PolygonConvert', from: deployer })];
                case 27:
                    _f = _k.sent();
                    return [3 /*break*/, 29];
                case 28:
                    _f = { address: ethers.constants.AddressZero };
                    _k.label = 29;
                case 29:
                    _e = _f;
                    _k.label = 30;
                case 30:
                    module = _e;
                    return [4 /*yield*/, controller.approveModule(module.address, true)];
                case 31:
                    _k.sent();
                    return [4 /*yield*/, deployments.deploy(network === 'ARBITRUM' ? 'StrategyRenVMArbitrum' : 'StrategyRenVM', {
                            args: [
                                zeroController.address,
                                deployParameters[network]["renBTC"],
                                deployParameters[network]["wNative"], dummyVault.address,
                                deployParameters[network]['wBTC']
                            ],
                            contractName: network === 'ARBITRUM' ? 'StrategyRenVMArbitrum' : 'StrategyRenVM',
                            from: deployer,
                            waitConfirmations: 1
                        })];
                case 32:
                    strategyRenVM = _k.sent();
                    _h = (_g = controller).setGovernance;
                    return [4 /*yield*/, ethersSigner.getAddress()];
                case 33: 
                //hijackSigner(ethersSigner);
                return [4 /*yield*/, _h.apply(_g, [_k.sent()])];
                case 34:
                    //hijackSigner(ethersSigner);
                    _k.sent();
                    return [4 /*yield*/, controller.setFee(ethers.utils.parseEther('0.003'))];
                case 35:
                    _k.sent();
                    //restoreSigner(ethersSigner);
                    return [4 /*yield*/, controller.approveStrategy(deployParameters[network]['renBTC'], strategyRenVM.address)];
                case 36:
                    //restoreSigner(ethersSigner);
                    _k.sent();
                    return [4 /*yield*/, controller.setStrategy(deployParameters[network]['renBTC'], strategyRenVM.address, false)];
                case 37: return [4 /*yield*/, (_k.sent()).wait()];
                case 38:
                    _k.sent();
                    //restoreSigner(ethersSigner);
                    return [4 /*yield*/, deployFixedAddress('ZeroCurveFactory', {
                            args: [],
                            contractName: 'ZeroCurveFactory',
                            from: deployer
                        })];
                case 39:
                    //restoreSigner(ethersSigner);
                    _k.sent();
                    return [4 /*yield*/, deployFixedAddress('ZeroUniswapFactory', {
                            args: [deployParameters[network]['Router']],
                            contractName: 'ZeroUniswapFactory',
                            from: deployer
                        })];
                case 40:
                    _k.sent();
                    return [4 /*yield*/, deployFixedAddress('WrapNative', {
                            args: [deployParameters[network]['wNative']],
                            contractName: 'WrapNative',
                            from: deployer
                        })];
                case 41:
                    _k.sent();
                    return [4 /*yield*/, deployFixedAddress('UnwrapNative', {
                            args: [deployParameters[network]['wNative']],
                            contractName: 'UnwrapNative',
                            from: deployer
                        })];
                case 42:
                    _k.sent();
                    return [4 /*yield*/, ethers.getContract('WrapNative', deployer)];
                case 43:
                    wrapper = _k.sent();
                    return [4 /*yield*/, ethers.getContract('UnwrapNative', deployer)];
                case 44:
                    unwrapper = _k.sent();
                    return [4 /*yield*/, ethers.getContract('ZeroCurveFactory', deployer)];
                case 45:
                    curveFactory = _k.sent();
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
                    console.log("CONVERTERS");
                    _j = network;
                    switch (_j) {
                        case "ETHEREUM": return [3 /*break*/, 46];
                        case 'MATIC': return [3 /*break*/, 59];
                        case 'ARBITRUM': return [3 /*break*/, 73];
                    }
                    return [3 /*break*/, 86];
                case 46:
                    console.log("RUNNING ETHEREUM");
                    return [4 /*yield*/, curveFactory.functions.createWrapper(false, 1, 0, deployParameters[network]["Curve_SBTC"])];
                case 47:
                    wBTCToRenBTCTx = _k.sent();
                    return [4 /*yield*/, getWrapperAddress(wBTCToRenBTCTx)];
                case 48:
                    wBTCToRenBTC = _k.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'renBTC', wBTCToRenBTC)];
                case 49:
                    _k.sent();
                    return [4 /*yield*/, curveFactory.createWrapper(false, 0, 1, deployParameters[network]["Curve_SBTC"])];
                case 50:
                    renBTCToWBTCTx = _k.sent();
                    return [4 /*yield*/, getWrapperAddress(renBTCToWBTCTx)];
                case 51:
                    renBTCToWBTC = _k.sent();
                    return [4 /*yield*/, setConverter(controller, 'renBTC', 'wBTC', renBTCToWBTC)];
                case 52:
                    _k.sent();
                    return [4 /*yield*/, curveFactory.createWrapper(false, 2, 1, deployParameters[network]["Curve_TriCryptoTwo"], { gasLimit: 8e6 })];
                case 53:
                    wEthToWBTCTx = _k.sent();
                    return [4 /*yield*/, getWrapperAddress(wEthToWBTCTx)];
                case 54:
                    wEthToWBTC = _k.sent();
                    return [4 /*yield*/, setConverter(controller, 'wNative', 'wBTC', wEthToWBTC)];
                case 55:
                    _k.sent();
                    return [4 /*yield*/, curveFactory.createWrapper(false, 1, 2, deployParameters[network]["Curve_TriCryptoTwo"], { gasLimit: 8e6 })];
                case 56:
                    wBtcToWETHTx = _k.sent();
                    return [4 /*yield*/, getWrapperAddress(wBtcToWETHTx)];
                case 57:
                    wBtcToWETH = _k.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'wNative', wBtcToWETH)];
                case 58:
                    _k.sent();
                    return [3 /*break*/, 86];
                case 59: return [4 /*yield*/, ethers.getContract('ZeroUniswapFactory', deployer)];
                case 60:
                    sushiFactory = _k.sent();
                    console.log("MATIC");
                    return [4 /*yield*/, curveFactory.createWrapper(true, 0, 1, deployParameters[network]["Curve_Ren"], { gasLimit: 5e6 })];
                case 61:
                    wBTCToRenBTCTx = _k.sent();
                    return [4 /*yield*/, getWrapperAddress(wBTCToRenBTCTx)];
                case 62:
                    wBTCToRenBTC = _k.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'renBTC', wBTCToRenBTC)];
                case 63:
                    _k.sent();
                    return [4 /*yield*/, curveFactory.createWrapper(true, 1, 0, deployParameters[network]["Curve_Ren"], { gasLimit: 5e6 })];
                case 64:
                    renBTCToWBTCTx = _k.sent();
                    return [4 /*yield*/, getWrapperAddress(renBTCToWBTCTx)];
                case 65:
                    renBTCToWBTC = _k.sent();
                    return [4 /*yield*/, setConverter(controller, 'renBTC', 'wBTC', renBTCToWBTC)];
                case 66:
                    _k.sent();
                    return [4 /*yield*/, sushiFactory.createWrapper([deployParameters[network]["wNative"], deployParameters[network]["wBTC"]], { gasLimit: 5e6 })];
                case 67:
                    wEthToWBTCTx = _k.sent();
                    return [4 /*yield*/, getWrapperAddress(wEthToWBTCTx)];
                case 68:
                    wEthToWBTC = _k.sent();
                    return [4 /*yield*/, setConverter(controller, 'wNative', 'wBTC', '0x7157d98368923a298C0882a503cF44353A847F37')];
                case 69:
                    _k.sent();
                    return [4 /*yield*/, sushiFactory.createWrapper([deployParameters[network]["wBTC"], deployParameters[network]["wNative"]], { gasLimit: 5e6 })];
                case 70:
                    wBtcToWETHTx = _k.sent();
                    return [4 /*yield*/, getWrapperAddress(wBtcToWETHTx)];
                case 71:
                    wBtcToWETH = _k.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'wNative', wBtcToWETH)];
                case 72:
                    _k.sent();
                    return [3 /*break*/, 86];
                case 73:
                    console.log("Running arbitrum");
                    return [4 /*yield*/, curveFactory.createWrapper(false, 2, 1, '0x960ea3e3C7FB317332d990873d354E18d7645590')];
                case 74:
                    wETHToWBTCArbTx = _k.sent();
                    return [4 /*yield*/, getWrapperAddress(wETHToWBTCArbTx)];
                case 75:
                    wETHToWBTCArb = _k.sent();
                    return [4 /*yield*/, setConverter(controller, 'wNative', 'wBTC', wETHToWBTCArb)];
                case 76:
                    _k.sent();
                    console.log("wETH->wBTC Converter Set.");
                    return [4 /*yield*/, curveFactory.createWrapper(false, 1, 2, '0x960ea3e3C7FB317332d990873d354E18d7645590')];
                case 77:
                    wBtcToWETHArbTx = _k.sent();
                    return [4 /*yield*/, getWrapperAddress(wBtcToWETHArbTx)];
                case 78:
                    wBtcToWETHArb = _k.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'wNative', wBtcToWETHArb)];
                case 79:
                    _k.sent();
                    console.log("wBTC->wETH Converter Set.");
                    return [4 /*yield*/, curveFactory.createWrapper(false, 0, 1, deployParameters[network]["Curve_Ren"])];
                case 80:
                    wBTCToRenBTCArbTx = _k.sent();
                    return [4 /*yield*/, getWrapperAddress(wBTCToRenBTCArbTx)];
                case 81:
                    wBTCToRenBTCArb = _k.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'renBTC', wBTCToRenBTCArb)];
                case 82:
                    _k.sent();
                    console.log("wBTC->renBTC Converter Set.");
                    return [4 /*yield*/, curveFactory.createWrapper(false, 1, 0, deployParameters[network]["Curve_Ren"])];
                case 83:
                    renBTCToWBTCArbTx = _k.sent();
                    console.log("renBTC->wBTC Converter Set.");
                    return [4 /*yield*/, getWrapperAddress(renBTCToWBTCArbTx)];
                case 84:
                    renBTCToWBTCArb = _k.sent();
                    return [4 /*yield*/, setConverter(controller, 'renBTC', 'wBTC', renBTCToWBTCArb)];
                case 85:
                    _k.sent();
                    _k.label = 86;
                case 86: 
                // Wrapper ETH -> wETH
                return [4 /*yield*/, setConverter(controller, ethers.constants.AddressZero, "wNative", wrapper.address)];
                case 87:
                    // Wrapper ETH -> wETH
                    _k.sent();
                    // Unwrapper wETH -> ETH
                    return [4 /*yield*/, setConverter(controller, "wNative", ethers.constants.AddressZero, unwrapper.address)];
                case 88:
                    // Unwrapper wETH -> ETH
                    _k.sent();
                    return [4 /*yield*/, controller.setGasParameters(ethers.utils.parseUnits('2', 9), '250000', '500000')];
                case 89:
                    _k.sent();
                    return [2 /*return*/];
            }
        });
    });
};
