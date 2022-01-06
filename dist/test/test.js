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
import hre from 'hardhat';
import { TrivialUnderwriterTransferRequest, TransferRequest } from '../lib/zero';
import { expect } from 'chai';
import { override } from '../lib/test/inject-mock';
import GatewayLogicV1 from '../artifacts/contracts/test/GatewayLogicV1.sol/GatewayLogicV1.json';
import { Contract, utils } from 'ethers';
// @ts-expect-error
var ethers = hre.ethers, deployments = hre.deployments;
var gasnow = require('ethers-gasnow');
var deployParameters = require('../lib/fixtures');
var network = process.env.CHAIN || 'MATIC';
//ethers.providers.BaseProvider.prototype.getGasPrice = gasnow.createGetGasPrice('rapid');
var USDC_MAINNET_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
var _signers;
var _getSigners = ethers.getSigners;
/*
if (process.env.FORKING === 'true')
    ethers.getSigners = async () => {
        if (!_signers) _signers = await _getSigners.call(ethers);
        return [new ethers.Wallet(process.env.WALLET, _signers[0].provider)];
    };
 */
var toAddress = function (contractOrAddress) { return contractOrAddress.address || contractOrAddress; };
var mintRenBTC = function (amount, signer) { return __awaiter(void 0, void 0, void 0, function () {
    var abi, btcGateway;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                abi = [
                    'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
                    'function mintFee() view returns (uint256)',
                ];
                if (!!signer) return [3 /*break*/, 2];
                return [4 /*yield*/, ethers.getSigners()];
            case 1:
                signer = (_a.sent())[0];
                _a.label = 2;
            case 2:
                btcGateway = new ethers.Contract(deployParameters[network]['btcGateway'], abi, signer);
                return [4 /*yield*/, btcGateway.mint(ethers.utils.hexlify(ethers.utils.randomBytes(32)), amount, ethers.utils.hexlify(ethers.utils.randomBytes(32)), '0x')];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var getContract = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var e_1, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 4]);
                    return [4 /*yield*/, ethers.getContract.apply(ethers, args)];
                case 1: 
                /*
                        const c = require('../deployments/arbitrum/' + args[0]);
                        return new ethers.Contract(c.address, c.abi, args[args.length - 1]);
                */
                return [2 /*return*/, (_d.sent())]; //.attach(require('../deployments/arbitrum/' + args[0]).address);
                case 2:
                    e_1 = _d.sent();
                    console.error(e_1);
                    _b = (_a = ethers.Contract).bind;
                    _c = [void 0, ethers.constants.AddressZero, []];
                    return [4 /*yield*/, ethers.getSigners()];
                case 3: return [2 /*return*/, new (_b.apply(_a, _c.concat([(_d.sent())[0]])))()];
                case 4: return [2 /*return*/];
            }
        });
    });
};
var getContractFactory = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var e_2, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 4]);
                    return [4 /*yield*/, ethers.getContractFactory.apply(ethers, args)];
                case 1: return [2 /*return*/, _d.sent()];
                case 2:
                    e_2 = _d.sent();
                    _b = (_a = ethers.ContractFactory).bind;
                    _c = [void 0, '0x', []];
                    return [4 /*yield*/, ethers.getSigners()];
                case 3: return [2 /*return*/, new (_b.apply(_a, _c.concat([(_d.sent())[0]])))()];
                case 4: return [2 /*return*/];
            }
        });
    });
};
var convert = function (controller, tokenIn, tokenOut, amount, signer) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, tokenInAddress, tokenOutAddress, swapAddress, converterContract, tx, tokenInContract, tx;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = [tokenIn, tokenOut].map(function (v) { return toAddress(v); }), tokenInAddress = _a[0], tokenOutAddress = _a[1];
                return [4 /*yield*/, controller.converters(tokenInAddress, tokenOutAddress)];
            case 1:
                swapAddress = _b.sent();
                converterContract = new ethers.Contract(swapAddress, ['function convert(address) returns (uint256)'], signer || controller.signer || controller.provider);
                if (!(tokenIn === ethers.constants.AddressZero)) return [3 /*break*/, 4];
                return [4 /*yield*/, controller.signer.sendTransaction({ value: amount, to: swapAddress })];
            case 2:
                _b.sent();
                return [4 /*yield*/, converterContract.convert(ethers.constants.AddressZero)];
            case 3:
                tx = _b.sent();
                return [2 /*return*/, tx];
            case 4:
                tokenInContract = new ethers.Contract(tokenInAddress, ['function transfer(address, uint256) returns (bool)'], signer || controller.signer || controller.provider);
                return [4 /*yield*/, tokenInContract.transfer(swapAddress, amount)];
            case 5:
                _b.sent();
                return [4 /*yield*/, converterContract.convert(ethers.constants.AddressZero)];
            case 6:
                tx = _b.sent();
                return [2 /*return*/, tx];
        }
    });
}); };
var getImplementation = function (proxyAddress) { return __awaiter(void 0, void 0, void 0, function () {
    var provider, _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, ethers.getSigners()];
            case 1:
                provider = (_e.sent())[0].provider;
                _b = (_a = utils).getAddress;
                return [4 /*yield*/, provider.getStorageAt(proxyAddress, '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc')];
            case 2:
                _d = (_c = (_e.sent())).substr;
                return [4 /*yield*/, provider.getNetwork()];
            case 3: return [2 /*return*/, _b.apply(_a, [_d.apply(_c, [(_e.sent()).chainId === 1337 ? 0 : 26])])];
        }
    });
}); };
var underwriterAddress = '0x' + '00'.repeat(20);
var deployUnderwriter = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, signer, controller, renBTC, btcVault, underwriterFactory;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, getFixtures()];
            case 1:
                _a = _b.sent(), signer = _a.signer, controller = _a.controller, renBTC = _a.renBTC, btcVault = _a.btcVault;
                return [4 /*yield*/, getContractFactory('TrivialUnderwriter', signer)];
            case 2:
                underwriterFactory = _b.sent();
                return [4 /*yield*/, underwriterFactory.deploy(controller.address)];
            case 3:
                underwriterAddress = (_b.sent()).address;
                return [4 /*yield*/, renBTC.approve(btcVault.address, ethers.constants.MaxUint256)];
            case 4:
                _b.sent(); //let btcVault spend renBTC on behalf of signer
                return [4 /*yield*/, btcVault.approve(controller.address, ethers.constants.MaxUint256)];
            case 5:
                _b.sent(); //let controller spend btcVault tokens
                return [2 /*return*/];
        }
    });
}); };
var mintUnderwriterNFTIfNotMinted = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, signer, controller, renBTC, btcVault, lock, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, getFixtures()];
            case 1:
                _a = _d.sent(), signer = _a.signer, controller = _a.controller, renBTC = _a.renBTC, btcVault = _a.btcVault;
                _c = (_b = controller.provider).getCode;
                return [4 /*yield*/, controller.lockFor(underwriterAddress)];
            case 2: return [4 /*yield*/, _c.apply(_b, [_d.sent()])];
            case 3:
                lock = _d.sent();
                if (!(lock === '0x')) return [3 /*break*/, 5];
                return [4 /*yield*/, controller.mint(underwriterAddress, btcVault.address)];
            case 4:
                _d.sent();
                _d.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); };
var underwriterDeposit = function (amountOfRenBTC) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, btcVault, controller;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, getFixtures()];
            case 1:
                _a = _b.sent(), btcVault = _a.btcVault, controller = _a.controller;
                return [4 /*yield*/, btcVault.deposit(amountOfRenBTC)];
            case 2:
                _b.sent(); //deposit renBTC into btcVault from signer
                console.log('Underwriter address is', underwriterAddress);
                return [4 /*yield*/, mintUnderwriterNFTIfNotMinted()];
            case 3:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var getStrategyContract = function (signer) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(process.env.CHAIN === 'ARBITRUM')) return [3 /*break*/, 2];
                return [4 /*yield*/, getContract('StrategyRenVMArbitrum', signer)];
            case 1: return [2 /*return*/, _a.sent()];
            case 2: return [4 /*yield*/, getContract('StrategyRenVM', signer)];
            case 3: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var getFixtures = function () { return __awaiter(void 0, void 0, void 0, function () {
    var signer, controller, erc20abi, chainId;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, ethers.getSigners()];
            case 1:
                signer = (_b.sent())[0];
                return [4 /*yield*/, getContract('ZeroController', signer)];
            case 2:
                controller = _b.sent();
                return [4 /*yield*/, deployments.getArtifact('BTCVault')];
            case 3:
                erc20abi = (_b.sent()).abi;
                return [4 /*yield*/, controller.provider.getNetwork()];
            case 4:
                chainId = (_b.sent()).chainId;
                _a = {
                    signer: signer
                };
                return [4 /*yield*/, signer.getAddress()];
            case 5:
                _a.signerAddress = _b.sent(),
                    _a.controller = controller;
                return [4 /*yield*/, getStrategyContract(signer)];
            case 6:
                _a.strategy = _b.sent();
                return [4 /*yield*/, getContract('BTCVault', signer)];
            case 7:
                _a.btcVault = _b.sent();
                return [4 /*yield*/, getContract('ArbitrumConvert', signer)];
            case 8:
                _a.swapModule = _b.sent();
                return [4 /*yield*/, getContract('ArbitrumConvert', signer)];
            case 9:
                _a.convertModule = _b.sent();
                return [4 /*yield*/, getContract('ZeroUniswapFactory', signer)];
            case 10:
                _a.uniswapFactory = _b.sent();
                return [4 /*yield*/, getContract('ZeroCurveFactory', signer)];
            case 11:
                _a.curveFactory = _b.sent();
                return [4 /*yield*/, getContract('WrapNative', signer)];
            case 12:
                _a.wrapper = _b.sent();
                return [4 /*yield*/, getContract('UnwrapNative', signer)];
            case 13:
                _a.unwrapper = _b.sent(),
                    //@ts-ignore
                    _a.gateway = new Contract(deployParameters[network]['btcGateway'], GatewayLogicV1.abi, signer),
                    //@ts-ignore
                    _a.renBTC = new Contract(deployParameters[network]['renBTC'], erc20abi, signer),
                    //@ts-ignore
                    _a.wETH = new Contract(deployParameters[network]['wNative'], erc20abi, signer),
                    //@ts-ignore
                    _a.usdc = new Contract(deployParameters[network]['USDC'], erc20abi, signer),
                    //@ts-ignore
                    _a.wBTC = new Contract(deployParameters[network]['wBTC'], erc20abi, signer);
                return [4 /*yield*/, getContract('DummyVault', signer)];
            case 14: return [2 /*return*/, (_a.yvWBTC = _b.sent(),
                    _a)];
        }
    });
}); };
var getBalances = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, swapModule, strategy, controller, btcVault, signerAddress, renBTC, wETH, usdc, wBTC, yvWBTC, wallets, tokens, getBalance, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0: return [2 /*return*/];
            case 1:
                _a = _f.sent(), swapModule = _a.swapModule, strategy = _a.strategy, controller = _a.controller, btcVault = _a.btcVault, signerAddress = _a.signerAddress, renBTC = _a.renBTC, wETH = _a.wETH, usdc = _a.usdc, wBTC = _a.wBTC, yvWBTC = _a.yvWBTC;
                wallets = {
                    Wallet: signerAddress,
                    BTCVault: btcVault.address,
                    Controller: controller.address,
                    Strategy: strategy.address,
                    yvWBTC: yvWBTC.address,
                    'Swap Module': swapModule.address,
                };
                tokens = {
                    renBTC: renBTC,
                    wETH: wETH,
                    ETH: 0,
                    usdc: usdc,
                    wBTC: wBTC,
                    yvWBTC: yvWBTC,
                    zBTC: btcVault,
                };
                getBalance = function (wallet, token) { return __awaiter(void 0, void 0, void 0, function () {
                    var decimals, balance, e_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, token.decimals()];
                            case 1:
                                decimals = _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                e_3 = _a.sent();
                                console.log('failed to get decimals ' + token.address);
                                return [3 /*break*/, 3];
                            case 3: return [4 /*yield*/, token.balanceOf(wallet)];
                            case 4:
                                balance = _a.sent();
                                return [2 /*return*/, String((balance / Math.pow(10, decimals)).toFixed(2))];
                        }
                    });
                }); };
                _c = (_b = console).table;
                _e = (_d = Object).fromEntries;
                return [4 /*yield*/, Promise.all(Object.keys(wallets).map(function (name) { return __awaiter(void 0, void 0, void 0, function () {
                        var wallet, _a, _b, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    wallet = wallets[name];
                                    _a = [name];
                                    _c = (_b = Object).fromEntries;
                                    return [4 /*yield*/, Promise.all(Object.keys(tokens).map(function (token) { return __awaiter(void 0, void 0, void 0, function () {
                                            var balance, tokenContract, _a;
                                            return __generator(this, function (_b) {
                                                switch (_b.label) {
                                                    case 0:
                                                        if (!(token === 'ETH')) return [3 /*break*/, 2];
                                                        return [4 /*yield*/, wETH.provider.getBalance(wallet)];
                                                    case 1:
                                                        balance = _b.sent();
                                                        return [2 /*return*/, [token, String(Number(utils.formatEther(balance)).toFixed(2))]];
                                                    case 2:
                                                        tokenContract = tokens[token];
                                                        _a = [token];
                                                        return [4 /*yield*/, getBalance(wallet, tokenContract)];
                                                    case 3: return [2 /*return*/, _a.concat([_b.sent()])];
                                                }
                                            });
                                        }); }))];
                                case 1: return [2 /*return*/, _a.concat([
                                        _c.apply(_b, [_d.sent()])
                                    ])];
                            }
                        });
                    }); }))];
            case 2:
                _c.apply(_b, [_e.apply(_d, [_f.sent()])]);
                return [2 /*return*/];
        }
    });
}); };
var generateTransferRequest = function (amount) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, convertModule, swapModule, signerAddress, underwriter;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, getFixtures()];
            case 1:
                _a = _b.sent(), convertModule = _a.convertModule, swapModule = _a.swapModule, signerAddress = _a.signerAddress;
                return [4 /*yield*/, getUnderwriter()];
            case 2:
                underwriter = (_b.sent()).underwriter;
                return [2 /*return*/, new TransferRequest({
                        module: process.env.CHAIN === 'ARBITRUM' ? convertModule.address : swapModule.address,
                        to: signerAddress,
                        underwriter: underwriter.address,
                        //@ts-ignore
                        asset: deployParameters[network]['renBTC'],
                        amount: String(amount),
                        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [ethers.utils.parseEther('0.01')]),
                    })];
        }
    });
}); };
var getUnderwriter = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, signer, controller, underwriterFactory, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, getFixtures()];
            case 1:
                _a = _d.sent(), signer = _a.signer, controller = _a.controller;
                return [4 /*yield*/, getContractFactory('TrivialUnderwriter', signer)];
            case 2:
                underwriterFactory = _d.sent();
                _c = {
                    underwriterFactory: underwriterFactory,
                    underwriterAddress: underwriterAddress,
                    underwriter: new Contract(underwriterAddress, underwriterFactory.interface, signer),
                    underwriterImpl: new Contract(underwriterAddress, controller.interface, signer)
                };
                _b = ethers.constants.AddressZero;
                if (_b) return [3 /*break*/, 4];
                return [4 /*yield*/, controller.lockFor(underwriterAddress)];
            case 3:
                _b = (_d.sent());
                _d.label = 4;
            case 4: return [2 /*return*/, (_c.lock = _b,
                    _c)];
        }
    });
}); };
var getWrapperContract = function (address) { return __awaiter(void 0, void 0, void 0, function () {
    var signer, wrapperAbi;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getFixtures()];
            case 1:
                signer = (_a.sent()).signer;
                return [4 /*yield*/, deployments.getArtifact('ZeroUniswapWrapper')];
            case 2:
                wrapperAbi = (_a.sent()).abi;
                return [2 /*return*/, new Contract(address, wrapperAbi, signer)];
        }
    });
}); };
describe('Zero', function () {
    var prop;
    before(function () { return __awaiter(void 0, void 0, void 0, function () {
        var artifact, implementationAddress, gateway;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, deployments.fixture()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, deployUnderwriter()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, deployments.getArtifact('MockGatewayLogicV1')];
                case 3:
                    artifact = _a.sent();
                    return [4 /*yield*/, getImplementation(deployParameters[network]['btcGateway'])];
                case 4:
                    implementationAddress = _a.sent();
                    override(implementationAddress, artifact.deployedBytecode);
                    return [4 /*yield*/, getFixtures()];
                case 5:
                    gateway = (_a.sent()).gateway;
                    return [4 /*yield*/, gateway.mint(utils.randomBytes(32), utils.parseUnits('50', 8), utils.randomBytes(32), '0x')];
                case 6:
                    _a.sent(); //mint renBTC to signer
                    return [2 /*return*/];
            }
        });
    }); });
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('\n');
                        //@ts-ignore
                        console.log('='.repeat(32), 'Beginning Test', '='.repeat(32));
                        console.log('Test:', this.currentTest.title, '\n');
                        console.log('Initial Balances:');
                        return [4 /*yield*/, getBalances()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Final Balances:');
                    return [4 /*yield*/, getBalances()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('mock gateway should work', function () { return __awaiter(void 0, void 0, void 0, function () {
        var abi, erc20Abi, signer, signerAddress, btcGateway, renbtc, _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    abi = [
                        'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
                        'function mintFee() view returns (uint256)',
                    ];
                    return [4 /*yield*/, deployments.getArtifact('BTCVault')];
                case 1:
                    erc20Abi = (_e.sent()).abi;
                    return [4 /*yield*/, ethers.getSigners()];
                case 2:
                    signer = (_e.sent())[0];
                    return [4 /*yield*/, signer.getAddress()];
                case 3:
                    signerAddress = _e.sent();
                    btcGateway = new ethers.Contract(deployParameters[network]['btcGateway'], abi, signer);
                    renbtc = new ethers.Contract(deployParameters[network]['renBTC'], erc20Abi, signer);
                    return [4 /*yield*/, btcGateway.mint(ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.defaultAbiCoder.encode(['uint256', 'bytes'], [0, '0x'])]), ethers.utils.parseUnits('50', 8), ethers.utils.solidityKeccak256(['string'], ['random ninputs']), '0x')];
                case 4:
                    _e.sent();
                    _a = expect;
                    _b = Number;
                    _d = (_c = ethers.utils).formatUnits;
                    return [4 /*yield*/, renbtc.balanceOf(signerAddress)];
                case 5:
                    _a.apply(void 0, [_b.apply(void 0, [_d.apply(_c, [_e.sent(), 8])])]).to.be.gt(0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Swap ETH -> wETH -> ETH', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, wETH, controller, signer, amount, signerAddress, originalBalance, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, getFixtures()];
                case 1:
                    _a = _d.sent(), wETH = _a.wETH, controller = _a.controller, signer = _a.signer;
                    amount = ethers.utils.parseUnits('1', '18');
                    return [4 /*yield*/, signer.getAddress()];
                case 2:
                    signerAddress = _d.sent();
                    return [4 /*yield*/, signer.provider.getBalance(signerAddress)];
                case 3:
                    originalBalance = _d.sent();
                    return [4 /*yield*/, convert(controller, ethers.constants.AddressZero, wETH, amount)];
                case 4:
                    _d.sent();
                    console.log('Swapped ETH to wETH');
                    return [4 /*yield*/, getBalances()];
                case 5:
                    _d.sent();
                    return [4 /*yield*/, convert(controller, wETH, ethers.constants.AddressZero, amount)];
                case 6:
                    _d.sent();
                    console.log('Swapped wETH to ETH');
                    _b = expect;
                    _c = originalBalance;
                    return [4 /*yield*/, signer.provider.getBalance(signerAddress)];
                case 7:
                    _b.apply(void 0, [_c === (_d.sent()),
                        'balance before not same as balance after']);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Swap renBTC -> wBTC -> renBTC', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, renBTC, wBTC, controller, signer, amount, newAmount, _b, _c, _d, _e, _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0: return [4 /*yield*/, getFixtures()];
                case 1:
                    _a = _j.sent(), renBTC = _a.renBTC, wBTC = _a.wBTC, controller = _a.controller, signer = _a.signer;
                    amount = ethers.utils.parseUnits('5', '8');
                    return [4 /*yield*/, convert(controller, renBTC, wBTC, amount)];
                case 2:
                    _j.sent();
                    console.log('Converted renBTC to wBTC');
                    return [4 /*yield*/, getBalances()];
                case 3:
                    _j.sent();
                    _b = Number;
                    _d = (_c = wBTC).balanceOf;
                    return [4 /*yield*/, signer.getAddress()];
                case 4: return [4 /*yield*/, _d.apply(_c, [_j.sent()])];
                case 5:
                    newAmount = _b.apply(void 0, [_j.sent()]);
                    return [4 /*yield*/, convert(controller, wBTC, renBTC, newAmount)];
                case 6:
                    _j.sent();
                    console.log('Converted wBTC to renBTC');
                    _e = expect;
                    _f = Number;
                    _h = (_g = renBTC).balanceOf;
                    return [4 /*yield*/, signer.getAddress()];
                case 7: return [4 /*yield*/, _h.apply(_g, [_j.sent()])];
                case 8:
                    _e.apply(void 0, [_f.apply(void 0, [_j.sent()]) > 0, 'The swap amounts dont add up']);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return the number of decimals in the yearn vault', function () { return __awaiter(void 0, void 0, void 0, function () {
        var yvWBTC, decimals;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getFixtures()];
                case 1:
                    yvWBTC = (_a.sent()).yvWBTC;
                    return [4 /*yield*/, yvWBTC.decimals()];
                case 2:
                    decimals = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should deposit funds then withdraw funds back from vault', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, renBTC, btcVault, beforeBalance, _b, addedAmount, afterBalance, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, getFixtures()];
                case 1:
                    _a = _d.sent(), renBTC = _a.renBTC, btcVault = _a.btcVault;
                    return [4 /*yield*/, renBTC.balanceOf(btcVault.address)];
                case 2:
                    _b = (_d.sent()).toNumber();
                    return [4 /*yield*/, renBTC.decimals()];
                case 3:
                    beforeBalance = _b / (_d.sent());
                    addedAmount = '4000000';
                    return [4 /*yield*/, underwriterDeposit(addedAmount)];
                case 4:
                    _d.sent();
                    return [4 /*yield*/, renBTC.balanceOf(btcVault.address)];
                case 5:
                    _c = (_d.sent()).toNumber();
                    return [4 /*yield*/, renBTC.decimals()];
                case 6:
                    afterBalance = _c / (_d.sent());
                    console.log('Deposited funds into vault');
                    return [4 /*yield*/, getBalances()];
                case 7:
                    _d.sent();
                    return [4 /*yield*/, btcVault.withdrawAll()];
                case 8:
                    _d.sent();
                    console.log('Withdrew funds from vault');
                    expect(beforeBalance + Number(addedAmount) == afterBalance, 'Balances not adding up');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should transfer overflow funds to strategy vault', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, btcVault, renBTC;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getFixtures()];
                case 1:
                    _a = _b.sent(), btcVault = _a.btcVault, renBTC = _a.renBTC;
                    return [4 /*yield*/, underwriterDeposit('4000000')];
                case 2:
                    _b.sent();
                    console.log('deposited all renBTC into vault');
                    return [4 /*yield*/, getBalances()];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, btcVault.earn()];
                case 4:
                    _b.sent();
                    console.log('Called earn on vault');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should take out, make a swap with, then repay a small loan', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, signer, controller, swapModule, convertModule, btcVault, _b, underwriter, underwriterImpl, renbtc, _c, _d, transferRequest, _e, _f, signature, nHash, actualAmount, renVMSignature;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, getFixtures()];
                case 1:
                    _a = _g.sent(), signer = _a.signer, controller = _a.controller, swapModule = _a.swapModule, convertModule = _a.convertModule, btcVault = _a.btcVault;
                    return [4 /*yield*/, getUnderwriter()];
                case 2:
                    _b = _g.sent(), underwriter = _b.underwriter, underwriterImpl = _b.underwriterImpl;
                    _d = (_c = ethers.Contract).bind;
                    return [4 /*yield*/, btcVault.token()];
                case 3:
                    renbtc = new (_d.apply(_c, [void 0, _g.sent(), btcVault.interface, signer]))();
                    return [4 /*yield*/, renbtc.approve(btcVault.address, ethers.constants.MaxUint256)];
                case 4:
                    _g.sent();
                    return [4 /*yield*/, btcVault.deposit('4000000')];
                case 5:
                    _g.sent();
                    return [4 /*yield*/, btcVault.earn()];
                case 6:
                    _g.sent();
                    console.log('Deposited 15renBTC and called earn');
                    return [4 /*yield*/, getBalances()];
                case 7:
                    _g.sent();
                    //@ts-ignore
                    ('0x42e48680f15b7207c7602fec83b9c252fa3548c8533246ed532a75c6d0c486394648ba8f42a73a0ce2482712f09d177c3641ef07fcfd3b5cd3b4329982f756141b');
                    transferRequest = new TrivialUnderwriterTransferRequest({
                        module: process.env.CHAIN === 'ARBITRUM' ? convertModule.address : swapModule.address,
                        to: '0xC6ccaC065fCcA640F44289886Ce7861D9A527F9E',
                        underwriter: '0xd0D8fA764352e33F40c66C75B3BC0204DC95973e',
                        asset: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501',
                        amount: '0x061a80',
                        data: '0x00000000000000000000000000000000000000000000000000009184e72a0000',
                        nonce: '0xb67ed6c41ea6f5b7395f005ceb172eb093273396d1e5bb49d919c4df396e0d5a',
                        pNonce: '0x0153c5fa086b7eceef6ec52b6b96381ee6f16852a6ace5b742f239296b4cd901',
                        chainId: 42161,
                        contractAddress: '0x53f38bEA30fE6919e0475Fe57C2629f3D3754d1E',
                        signature: '0x42e48680f15b7207c7602fec83b9c252fa3548c8533246ed532a75c6d0c486394648ba8f42a73a0ce2482712f09d177c3641ef07fcfd3b5cd3b4329982f756141b',
                    });
                    _f = (_e = transferRequest).setProvider;
                    return [4 /*yield*/, ethers.getSigners()];
                case 8:
                    _f.apply(_e, [(_g.sent())[0].provider]);
                    transferRequest.setUnderwriter(underwriter.address);
                    return [4 /*yield*/, transferRequest.sign(signer, controller.address)];
                case 9:
                    signature = _g.sent();
                    console.log('\nWriting a small loan');
                    return [4 /*yield*/, transferRequest.loan(signer, { gasLimit: 1.5e6 })];
                case 10:
                    _g.sent();
                    /*
                        transferRequest.to,
                        transferRequest.asset,
                        transferRequest.amount,
                        transferRequest.pNonce,
                        transferRequest.module,
                        transferRequest.data,
                        signature,
                    );
            */
                    return [4 /*yield*/, getBalances()];
                case 11:
                    /*
                        transferRequest.to,
                        transferRequest.asset,
                        transferRequest.amount,
                        transferRequest.pNonce,
                        transferRequest.module,
                        transferRequest.data,
                        signature,
                    );
            */
                    _g.sent();
                    console.log('\nRepaying loan...');
                    nHash = utils.hexlify(utils.randomBytes(32));
                    actualAmount = String(Number(transferRequest.amount) - 1000);
                    renVMSignature = '0x';
                    return [4 /*yield*/, underwriter.proxy(controller.address, controller.interface.encodeFunctionData('repay', [
                            underwriter.address,
                            transferRequest.to,
                            transferRequest.asset,
                            transferRequest.amount,
                            actualAmount,
                            transferRequest.pNonce,
                            transferRequest.module,
                            nHash,
                            transferRequest.data,
                            renVMSignature, //signature
                        ]))];
                case 12:
                    _g.sent();
                    return [4 /*yield*/, getBalances()];
                case 13:
                    _g.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should take out, make a swap with, then repay a large loan', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, signer, controller, btcVault, _b, underwriter, underwriterImpl, renbtc, _c, _d, transferRequest, signature;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getFixtures()];
                case 1:
                    _a = _e.sent(), signer = _a.signer, controller = _a.controller, btcVault = _a.btcVault;
                    return [4 /*yield*/, getUnderwriter()];
                case 2:
                    _b = _e.sent(), underwriter = _b.underwriter, underwriterImpl = _b.underwriterImpl;
                    _d = (_c = ethers.Contract).bind;
                    return [4 /*yield*/, btcVault.token()];
                case 3:
                    renbtc = new (_d.apply(_c, [void 0, _e.sent(), btcVault.interface, signer]))();
                    return [4 /*yield*/, renbtc.approve(btcVault.address, ethers.constants.MaxUint256)];
                case 4:
                    _e.sent();
                    return [4 /*yield*/, btcVault.deposit('4000000')];
                case 5:
                    _e.sent();
                    return [4 /*yield*/, btcVault.earn()];
                case 6:
                    _e.sent();
                    console.log('Deposited 15renBTC and called earn');
                    return [4 /*yield*/, getBalances()];
                case 7:
                    _e.sent();
                    return [4 /*yield*/, generateTransferRequest(40000)];
                case 8:
                    transferRequest = _e.sent();
                    console.log('\nInitial balances');
                    return [4 /*yield*/, getBalances()];
                case 9:
                    _e.sent();
                    transferRequest.setUnderwriter(underwriter.address);
                    return [4 /*yield*/, transferRequest.sign(signer, controller.address)];
                case 10:
                    signature = _e.sent();
                    console.log('\nWriting a large loan');
                    return [4 /*yield*/, underwriterImpl.loan(transferRequest.to, transferRequest.asset, transferRequest.amount, transferRequest.pNonce, transferRequest.module, transferRequest.data, signature)];
                case 11:
                    _e.sent();
                    return [4 /*yield*/, getBalances()];
                case 12:
                    _e.sent();
                    console.log('\nRepaying loan...');
                    return [4 /*yield*/, underwriterImpl.repay(underwriter.address, //underwriter
                        transferRequest.to, //to
                        transferRequest.asset, //asset
                        transferRequest.amount, //amount
                        String(Number(transferRequest.amount) - 1000), //actualAmount
                        transferRequest.pNonce, //nonce
                        transferRequest.module, //module
                        utils.hexlify(utils.randomBytes(32)), //nHash
                        transferRequest.data, signature)];
                case 13:
                    _e.sent();
                    return [4 /*yield*/, getBalances()];
                case 14:
                    _e.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle a default', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, signer, controller, btcVault, _b, underwriter, underwriterImpl, renbtc, _c, _d, transferRequest, signature;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getFixtures()];
                case 1:
                    _a = _e.sent(), signer = _a.signer, controller = _a.controller, btcVault = _a.btcVault;
                    return [4 /*yield*/, getUnderwriter()];
                case 2:
                    _b = _e.sent(), underwriter = _b.underwriter, underwriterImpl = _b.underwriterImpl;
                    _d = (_c = ethers.Contract).bind;
                    return [4 /*yield*/, btcVault.token()];
                case 3:
                    renbtc = new (_d.apply(_c, [void 0, _e.sent(), btcVault.interface, signer]))();
                    return [4 /*yield*/, renbtc.approve(btcVault.address, ethers.constants.MaxUint256)];
                case 4:
                    _e.sent();
                    return [4 /*yield*/, btcVault.deposit('4000000')];
                case 5:
                    _e.sent();
                    return [4 /*yield*/, btcVault.earn()];
                case 6:
                    _e.sent();
                    console.log('Deposited 15renBTC and called earn');
                    return [4 /*yield*/, getBalances()];
                case 7:
                    _e.sent();
                    return [4 /*yield*/, generateTransferRequest(40000)];
                case 8:
                    transferRequest = _e.sent();
                    console.log('\nInitial balances');
                    return [4 /*yield*/, getBalances()];
                case 9:
                    _e.sent();
                    transferRequest.setUnderwriter(underwriter.address);
                    return [4 /*yield*/, transferRequest.sign(signer, controller.address)];
                case 10:
                    signature = _e.sent();
                    console.log('\nWriting a large loan');
                    return [4 /*yield*/, underwriterImpl.loan(transferRequest.to, transferRequest.asset, transferRequest.amount, transferRequest.pNonce, transferRequest.module, transferRequest.data, signature)];
                case 11:
                    _e.sent();
                    return [4 /*yield*/, getBalances()];
                case 12:
                    _e.sent();
                    console.log('\nRepaying loan...');
                    return [4 /*yield*/, underwriterImpl.repay(underwriter.address, //underwriter
                        transferRequest.to, //to
                        transferRequest.asset, //asset
                        transferRequest.amount, //amount
                        String(Number(transferRequest.amount) - 1000), //actualAmount
                        transferRequest.pNonce, //nonce
                        transferRequest.module, //module
                        utils.hexlify(utils.randomBytes(32)), //nHash
                        transferRequest.data, signature)];
                case 13:
                    _e.sent();
                    return [4 /*yield*/, getBalances()];
                case 14:
                    _e.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should call fallback mint and return funds', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, signer, controller, _b, underwriter, underwriterImpl, transferRequest, signature;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getFixtures()];
                case 1:
                    _a = _c.sent(), signer = _a.signer, controller = _a.controller;
                    return [4 /*yield*/, getUnderwriter()];
                case 2:
                    _b = _c.sent(), underwriter = _b.underwriter, underwriterImpl = _b.underwriterImpl;
                    return [4 /*yield*/, generateTransferRequest(40000)];
                case 3:
                    transferRequest = _c.sent();
                    console.log('\nInitial balances');
                    return [4 /*yield*/, getBalances()];
                case 4:
                    _c.sent();
                    transferRequest.setUnderwriter(underwriter.address);
                    return [4 /*yield*/, transferRequest.sign(signer, controller.address)];
                case 5:
                    signature = _c.sent();
                    console.log('Calling fallbackMint...');
                    return [4 /*yield*/, controller.fallbackMint(underwriter.address, //underwriter,
                        transferRequest.to, //to
                        transferRequest.asset, //asset
                        transferRequest.amount, //amount
                        String(Number(transferRequest.amount) - 1000), //actualAmount
                        transferRequest.pNonce, //nonce
                        transferRequest.module, //module
                        utils.hexlify(utils.randomBytes(32)), //nHash
                        transferRequest.data, //data
                        signature)];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, getBalances()];
                case 7:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
