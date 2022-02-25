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
module.exports = function (_a) {
    var getChainId = _a.getChainId, getUnnamedAccounts = _a.getUnnamedAccounts, getNamedAccounts = _a.getNamedAccounts;
    return __awaiter(_this, void 0, void 0, function () {
        var deployer, ethersSigner, provider, _b, _c, _d, chainId, signer, deployerSigner, zeroUnderwriterLockBytecodeLib, zeroControllerFactory, zeroController, zeroControllerArtifact, v, dummyVault, w, delegate, _e, _f, _g, controller, module, _h, _j, quick, strategyRenVM, _k, _l, wrapper, unwrapper, curveFactory, getWrapperAddress, _m, wBTCToRenBTCTx, wBTCToRenBTC, renBTCToWBTCTx, renBTCToWBTC, wEthToWBTCTx, wEthToWBTC, wBtcToWETHTx, wBtcToWETH, sushiFactory, wBTCToRenBTCTx, wBTCToRenBTC, renBTCToWBTCTx, renBTCToWBTC, wEthToWBTCTx, wEthToWBTC, wBtcToWETHTx, wBtcToWETH, wETHToWBTCArbTx, wETHToWBTCArb, wBtcToWETHArbTx, wBtcToWETHArb, wBTCToRenBTCArbTx, wBTCToRenBTCArb, renBTCToWBTCArbTx, renBTCToWBTCArb;
        var _o;
        var _this = this;
        return __generator(this, function (_p) {
            switch (_p.label) {
                case 0:
                    if (!process.argv.find(function (v) { return v === 'test'; }) && (!common.isSelectedDeployment(__filename) || process.env.CHAIN === 'ETHEREUM' || process.env.FORKING === 'true'))
                        return [2 /*return*/];
                    return [4 /*yield*/, getNamedAccounts()];
                case 1:
                    deployer = (_p.sent()).deployer;
                    return [4 /*yield*/, ethers.getSigners()];
                case 2:
                    ethersSigner = (_p.sent())[0];
                    provider = ethersSigner.provider;
                    _b = Number;
                    _d = (_c = ethers.utils).formatEther;
                    return [4 /*yield*/, provider.getBalance(deployer)];
                case 3:
                    if (!(_b.apply(void 0, [_d.apply(_c, [_p.sent()])]) === 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, ethersSigner.sendTransaction({
                            value: ethers.utils.parseEther('1'),
                            to: deployer
                        })];
                case 4:
                    _p.sent();
                    _p.label = 5;
                case 5: return [4 /*yield*/, provider.getNetwork()];
                case 6:
                    chainId = (_p.sent()).chainId;
                    if (!(chainId === 31337)) return [3 /*break*/, 8];
                    return [4 /*yield*/, hre.network.provider.request({
                            method: 'hardhat_impersonateAccount',
                            params: [SIGNER_ADDRESS]
                        })];
                case 7:
                    _p.sent();
                    _p.label = 8;
                case 8: return [4 /*yield*/, ethers.getSigner(SIGNER_ADDRESS)];
                case 9:
                    signer = _p.sent();
                    return [4 /*yield*/, ethers.getSigners()];
                case 10:
                    deployerSigner = (_p.sent())[0];
                    console.log('RUNNING');
                    return [4 /*yield*/, deployFixedAddress('ZeroUnderwriterLockBytecodeLib', {
                            contractName: 'ZeroUnderwriterLockBytecodeLib',
                            args: [],
                            from: deployer
                        })];
                case 11:
                    zeroUnderwriterLockBytecodeLib = _p.sent();
                    return [4 /*yield*/, hre.ethers.getContractFactory('ZeroController', {
                            libraries: {
                                ZeroUnderwriterLockBytecodeLib: zeroUnderwriterLockBytecodeLib.address
                            }
                        })];
                case 12:
                    zeroControllerFactory = _p.sent();
                    return [4 /*yield*/, deployProxyFixedAddress(zeroControllerFactory, ['0x0F4ee9631f4be0a63756515141281A3E2B293Bbe', deployParameters[network].gatewayRegistry], {
                            unsafeAllowLinkedLibraries: true
                        })];
                case 13:
                    zeroController = _p.sent();
                    return [4 /*yield*/, deployments.getArtifact('ZeroController')];
                case 14:
                    zeroControllerArtifact = _p.sent();
                    return [4 /*yield*/, deployments.save('ZeroController', {
                            contractName: 'ZeroController',
                            address: zeroController.address,
                            bytecode: zeroControllerArtifact.bytecode,
                            abi: zeroControllerArtifact.abi
                        })];
                case 15:
                    _p.sent();
                    console.log('waiting on proxy deploy to mine ...');
                    return [4 /*yield*/, zeroController.deployTransaction.wait()];
                case 16:
                    _p.sent();
                    //	console.log('done!');
                    return [4 /*yield*/, deployFixedAddress('BTCVault', {
                            contractName: 'BTCVault',
                            args: [deployParameters[network]['renBTC'], zeroController.address, 'zeroBTC', 'zBTC'],
                            from: deployer
                        })];
                case 17:
                    //	console.log('done!');
                    _p.sent();
                    return [4 /*yield*/, ethers.getContract('BTCVault')];
                case 18:
                    v = _p.sent();
                    return [4 /*yield*/, v.attach(deployParameters[network]['renBTC'])];
                case 19:
                    _p.sent();
                    return [4 /*yield*/, deployFixedAddress('DummyVault', {
                            contractName: 'DummyVault',
                            args: [deployParameters[network]['wBTC'], zeroController.address, 'yearnBTC', 'yvWBTC'],
                            from: deployer
                        })];
                case 20:
                    dummyVault = _p.sent();
                    return [4 /*yield*/, ethers.getContract('DummyVault')];
                case 21:
                    w = _p.sent();
                    return [4 /*yield*/, w.attach(deployParameters[network]['wBTC'])];
                case 22:
                    _p.sent();
                    // .balanceOf(ethers.constants.AddressZero);
                    console.log('Deployed DummyVault to', dummyVault.address);
                    _e = deployFixedAddress;
                    _f = ['DelegateUnderwriter'];
                    _o = {
                        contractName: 'DelegateUnderwriter'
                    };
                    if (!isLocalhost) return [3 /*break*/, 23];
                    _g = deployer;
                    return [3 /*break*/, 25];
                case 23: return [4 /*yield*/, ethers.getContract('GnosisSafe')];
                case 24:
                    _g = (_p.sent()).address;
                    _p.label = 25;
                case 25: return [4 /*yield*/, _e.apply(void 0, _f.concat([(_o.args = [
                            _g,
                            zeroController.address,
                            isLocalhost ? [deployer] : []
                        ],
                            _o.libraries = {},
                            _o.from = deployer,
                            _o)]))];
                case 26:
                    delegate = _p.sent();
                    return [4 /*yield*/, ethers.getContract('ZeroController')];
                case 27:
                    controller = _p.sent();
                    return [4 /*yield*/, controller.mint(delegate.address, deployParameters[network].renBTC)];
                case 28:
                    _p.sent();
                    console.log('GOT CONTROLLER');
                    if (!(process.env.CHAIN === 'ARBITRUM')) return [3 /*break*/, 30];
                    return [4 /*yield*/, deployFixedAddress('ArbitrumConvert', {
                            args: [zeroController.address],
                            contractName: 'ArbitrumConvert',
                            from: deployer
                        })];
                case 29:
                    _h = _p.sent();
                    return [3 /*break*/, 34];
                case 30:
                    if (!(process.env.CHAIN === 'MATIC')) return [3 /*break*/, 32];
                    return [4 /*yield*/, deployFixedAddress('PolygonConvert', {
                            args: [zeroController.address],
                            contractName: 'PolygonConvert',
                            from: deployer
                        })];
                case 31:
                    _j = _p.sent();
                    return [3 /*break*/, 33];
                case 32:
                    _j = { address: ethers.constants.AddressZero };
                    _p.label = 33;
                case 33:
                    _h = _j;
                    _p.label = 34;
                case 34:
                    module = _h;
                    return [4 /*yield*/, controller.approveModule(module.address, true)];
                case 35:
                    _p.sent();
                    if (!(network === 'ARBITRUM')) return [3 /*break*/, 38];
                    return [4 /*yield*/, deployFixedAddress('ArbitrumConvertQuick', {
                            args: [controller.address, ethers.utils.parseUnits('15', 8), '100000'],
                            contractName: 'ArbitrumConvertQuick',
                            libraries: {},
                            from: deployer
                        })];
                case 36:
                    quick = _p.sent();
                    return [4 /*yield*/, controller.approveModule(quick.address, true)];
                case 37:
                    _p.sent();
                    _p.label = 38;
                case 38: return [4 /*yield*/, deployments.deploy(network === 'ARBITRUM' ? 'StrategyRenVMArbitrum' : 'StrategyRenVM', {
                        args: [
                            zeroController.address,
                            deployParameters[network]['renBTC'],
                            deployParameters[network]['wNative'],
                            dummyVault.address,
                            deployParameters[network]['wBTC'],
                        ],
                        contractName: network === 'ARBITRUM' ? 'StrategyRenVMArbitrum' : 'StrategyRenVM',
                        from: deployer,
                        waitConfirmations: 1
                    })];
                case 39:
                    strategyRenVM = _p.sent();
                    _l = (_k = controller).setGovernance;
                    return [4 /*yield*/, ethersSigner.getAddress()];
                case 40: 
                //hijackSigner(ethersSigner);
                return [4 /*yield*/, _l.apply(_k, [_p.sent()])];
                case 41:
                    //hijackSigner(ethersSigner);
                    _p.sent();
                    return [4 /*yield*/, controller.setFee(ethers.utils.parseEther('0.003'))];
                case 42:
                    _p.sent();
                    //restoreSigner(ethersSigner);
                    return [4 /*yield*/, controller.approveStrategy(deployParameters[network]['renBTC'], strategyRenVM.address)];
                case 43:
                    //restoreSigner(ethersSigner);
                    _p.sent();
                    return [4 /*yield*/, controller.setStrategy(deployParameters[network]['renBTC'], strategyRenVM.address, false)];
                case 44: return [4 /*yield*/, (_p.sent()).wait()];
                case 45:
                    _p.sent();
                    //restoreSigner(ethersSigner);
                    return [4 /*yield*/, deployFixedAddress('ZeroCurveFactory', {
                            args: [],
                            contractName: 'ZeroCurveFactory',
                            from: deployer
                        })];
                case 46:
                    //restoreSigner(ethersSigner);
                    _p.sent();
                    return [4 /*yield*/, deployFixedAddress('ZeroUniswapFactory', {
                            args: [deployParameters[network]['Router']],
                            contractName: 'ZeroUniswapFactory',
                            from: deployer
                        })];
                case 47:
                    _p.sent();
                    return [4 /*yield*/, deployFixedAddress('WrapNative', {
                            args: [deployParameters[network]['wNative']],
                            contractName: 'WrapNative',
                            from: deployer
                        })];
                case 48:
                    _p.sent();
                    return [4 /*yield*/, deployFixedAddress('UnwrapNative', {
                            args: [deployParameters[network]['wNative']],
                            contractName: 'UnwrapNative',
                            from: deployer
                        })];
                case 49:
                    _p.sent();
                    return [4 /*yield*/, ethers.getContract('WrapNative', deployer)];
                case 50:
                    wrapper = _p.sent();
                    return [4 /*yield*/, ethers.getContract('UnwrapNative', deployer)];
                case 51:
                    unwrapper = _p.sent();
                    return [4 /*yield*/, ethers.getContract('ZeroCurveFactory', deployer)];
                case 52:
                    curveFactory = _p.sent();
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
                    _m = network;
                    switch (_m) {
                        case 'ETHEREUM': return [3 /*break*/, 53];
                        case 'MATIC': return [3 /*break*/, 66];
                        case 'ARBITRUM': return [3 /*break*/, 80];
                    }
                    return [3 /*break*/, 93];
                case 53:
                    console.log('RUNNING ETHEREUM');
                    return [4 /*yield*/, curveFactory.functions.createWrapper(false, 1, 0, deployParameters[network]['Curve_SBTC'])];
                case 54:
                    wBTCToRenBTCTx = _p.sent();
                    return [4 /*yield*/, getWrapperAddress(wBTCToRenBTCTx)];
                case 55:
                    wBTCToRenBTC = _p.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'renBTC', wBTCToRenBTC)];
                case 56:
                    _p.sent();
                    return [4 /*yield*/, curveFactory.createWrapper(false, 0, 1, deployParameters[network]['Curve_SBTC'])];
                case 57:
                    renBTCToWBTCTx = _p.sent();
                    return [4 /*yield*/, getWrapperAddress(renBTCToWBTCTx)];
                case 58:
                    renBTCToWBTC = _p.sent();
                    return [4 /*yield*/, setConverter(controller, 'renBTC', 'wBTC', renBTCToWBTC)];
                case 59:
                    _p.sent();
                    return [4 /*yield*/, curveFactory.createWrapper(false, 2, 1, deployParameters[network]['Curve_TriCryptoTwo'], { gasLimit: 8e6 })];
                case 60:
                    wEthToWBTCTx = _p.sent();
                    return [4 /*yield*/, getWrapperAddress(wEthToWBTCTx)];
                case 61:
                    wEthToWBTC = _p.sent();
                    return [4 /*yield*/, setConverter(controller, 'wNative', 'wBTC', wEthToWBTC)];
                case 62:
                    _p.sent();
                    return [4 /*yield*/, curveFactory.createWrapper(false, 1, 2, deployParameters[network]['Curve_TriCryptoTwo'], { gasLimit: 8e6 })];
                case 63:
                    wBtcToWETHTx = _p.sent();
                    return [4 /*yield*/, getWrapperAddress(wBtcToWETHTx)];
                case 64:
                    wBtcToWETH = _p.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'wNative', wBtcToWETH)];
                case 65:
                    _p.sent();
                    return [3 /*break*/, 93];
                case 66: return [4 /*yield*/, ethers.getContract('ZeroUniswapFactory', deployer)];
                case 67:
                    sushiFactory = _p.sent();
                    console.log('MATIC');
                    return [4 /*yield*/, curveFactory.createWrapper(true, 0, 1, deployParameters[network]['Curve_Ren'], {
                            gasLimit: 5e6
                        })];
                case 68:
                    wBTCToRenBTCTx = _p.sent();
                    return [4 /*yield*/, getWrapperAddress(wBTCToRenBTCTx)];
                case 69:
                    wBTCToRenBTC = _p.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'renBTC', wBTCToRenBTC)];
                case 70:
                    _p.sent();
                    return [4 /*yield*/, curveFactory.createWrapper(true, 1, 0, deployParameters[network]['Curve_Ren'], {
                            gasLimit: 5e6
                        })];
                case 71:
                    renBTCToWBTCTx = _p.sent();
                    return [4 /*yield*/, getWrapperAddress(renBTCToWBTCTx)];
                case 72:
                    renBTCToWBTC = _p.sent();
                    return [4 /*yield*/, setConverter(controller, 'renBTC', 'wBTC', renBTCToWBTC)];
                case 73:
                    _p.sent();
                    return [4 /*yield*/, sushiFactory.createWrapper([deployParameters[network]['wNative'], deployParameters[network]['wBTC']], { gasLimit: 5e6 })];
                case 74:
                    wEthToWBTCTx = _p.sent();
                    return [4 /*yield*/, getWrapperAddress(wEthToWBTCTx)];
                case 75:
                    wEthToWBTC = _p.sent();
                    return [4 /*yield*/, setConverter(controller, 'wNative', 'wBTC', '0x7157d98368923a298C0882a503cF44353A847F37')];
                case 76:
                    _p.sent();
                    return [4 /*yield*/, sushiFactory.createWrapper([deployParameters[network]['wBTC'], deployParameters[network]['wNative']], { gasLimit: 5e6 })];
                case 77:
                    wBtcToWETHTx = _p.sent();
                    return [4 /*yield*/, getWrapperAddress(wBtcToWETHTx)];
                case 78:
                    wBtcToWETH = _p.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'wNative', wBtcToWETH)];
                case 79:
                    _p.sent();
                    return [3 /*break*/, 93];
                case 80:
                    console.log('Running arbitrum');
                    return [4 /*yield*/, curveFactory.createWrapper(false, 2, 1, '0x960ea3e3C7FB317332d990873d354E18d7645590')];
                case 81:
                    wETHToWBTCArbTx = _p.sent();
                    return [4 /*yield*/, getWrapperAddress(wETHToWBTCArbTx)];
                case 82:
                    wETHToWBTCArb = _p.sent();
                    return [4 /*yield*/, setConverter(controller, 'wNative', 'wBTC', wETHToWBTCArb)];
                case 83:
                    _p.sent();
                    console.log('wETH->wBTC Converter Set.');
                    return [4 /*yield*/, curveFactory.createWrapper(false, 1, 2, '0x960ea3e3C7FB317332d990873d354E18d7645590')];
                case 84:
                    wBtcToWETHArbTx = _p.sent();
                    return [4 /*yield*/, getWrapperAddress(wBtcToWETHArbTx)];
                case 85:
                    wBtcToWETHArb = _p.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'wNative', wBtcToWETHArb)];
                case 86:
                    _p.sent();
                    console.log('wBTC->wETH Converter Set.');
                    return [4 /*yield*/, curveFactory.createWrapper(false, 0, 1, deployParameters[network]['Curve_Ren'])];
                case 87:
                    wBTCToRenBTCArbTx = _p.sent();
                    return [4 /*yield*/, getWrapperAddress(wBTCToRenBTCArbTx)];
                case 88:
                    wBTCToRenBTCArb = _p.sent();
                    return [4 /*yield*/, setConverter(controller, 'wBTC', 'renBTC', wBTCToRenBTCArb)];
                case 89:
                    _p.sent();
                    console.log('wBTC->renBTC Converter Set.');
                    return [4 /*yield*/, curveFactory.createWrapper(false, 1, 0, deployParameters[network]['Curve_Ren'])];
                case 90:
                    renBTCToWBTCArbTx = _p.sent();
                    console.log('renBTC->wBTC Converter Set.');
                    return [4 /*yield*/, getWrapperAddress(renBTCToWBTCArbTx)];
                case 91:
                    renBTCToWBTCArb = _p.sent();
                    return [4 /*yield*/, setConverter(controller, 'renBTC', 'wBTC', renBTCToWBTCArb)];
                case 92:
                    _p.sent();
                    _p.label = 93;
                case 93: 
                // Wrapper ETH -> wETH
                return [4 /*yield*/, setConverter(controller, ethers.constants.AddressZero, 'wNative', wrapper.address)];
                case 94:
                    // Wrapper ETH -> wETH
                    _p.sent();
                    // Unwrapper wETH -> ETH
                    return [4 /*yield*/, setConverter(controller, 'wNative', ethers.constants.AddressZero, unwrapper.address)];
                case 95:
                    // Unwrapper wETH -> ETH
                    _p.sent();
                    return [4 /*yield*/, controller.setGasParameters(ethers.utils.parseUnits('2', 9), '250000', '500000')];
                case 96:
                    _p.sent();
                    return [2 /*return*/];
            }
        });
    });
};
