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
var ethers = hre.ethers, deployments = hre.deployments, upgrades = hre.upgrades;
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
                    console.log("Args Here: ", args);
                    args[1].waitConfirmations = 1;
                    return [4 /*yield*/, ethers.getSigners()];
                case 1:
                    signer = (_a.sent())[0];
                    return [4 /*yield*/, deployments.deploy.apply(deployments, args)];
                case 2:
                    result = _a.sent();
                    console.log('Deployed to ' + result.address);
                    if (!(args[0] === 'ZERO')) return [3 /*break*/, 3];
                    return [2 /*return*/];
                case 3: return [4 /*yield*/, ethers.getContract(args[0])];
                case 4: return [2 /*return*/, _a.sent()];
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
                    return [2 /*return*/, result];
            }
        });
    });
};
var JsonRpcProvider = ethers.providers.JsonRpcProvider;
var _getSigner = JsonRpcProvider.prototype.getSigner;
var deployParameters = require('../lib/fixtures');
var SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";
module.exports = function (_a) {
    var getNamedAccounts = _a.getNamedAccounts;
    return __awaiter(_this, void 0, void 0, function () {
        var deployer, ethersSigner, provider, chainId, merkleRoot, erc20abi, testTreasury, zeroUnderwriterLockBytecodeLib, zeroControllerFactory, zeroController, zeroControllerArtifact, BTCVault, zeroToken, zero, zeroDistributor, RENBTC_HOLDER, signer, renBTC;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (process.env.CHAIN !== "ETHEREUM")
                        return [2 /*return*/];
                    return [4 /*yield*/, getNamedAccounts()];
                case 1:
                    deployer = (_b.sent()).deployer;
                    return [4 /*yield*/, ethers.getSigners()];
                case 2:
                    ethersSigner = (_b.sent())[0];
                    provider = ethersSigner.provider;
                    return [4 /*yield*/, provider.getNetwork()];
                case 3:
                    chainId = (_b.sent()).chainId;
                    if (!(chainId === 1)) return [3 /*break*/, 5];
                    return [4 /*yield*/, hre.network.provider.request({
                            method: "hardhat_impersonateAccount",
                            params: [SIGNER_ADDRESS]
                        })];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    merkleRoot = "0xe52564f93ddc09e2d60c8150e4a11c5be656f147bf1f8c64a492b6a34c11dc6a";
                    return [4 /*yield*/, deployments.getArtifact('BTCVault')];
                case 6:
                    erc20abi = (_b.sent()).abi;
                    return [4 /*yield*/, ethers.getSigners()];
                case 7:
                    testTreasury = (_b.sent())[0];
                    return [4 /*yield*/, deployFixedAddress('ZeroUnderwriterLockBytecodeLib', {
                            contractName: 'ZeroUnderwriterLockBytecodeLib',
                            args: [],
                            from: deployer
                        })];
                case 8:
                    zeroUnderwriterLockBytecodeLib = _b.sent();
                    return [4 /*yield*/, hre.ethers.getContractFactory("ZeroController", {
                            libraries: {
                                ZeroUnderwriterLockBytecodeLib: zeroUnderwriterLockBytecodeLib.address
                            }
                        })];
                case 9:
                    zeroControllerFactory = (_b.sent());
                    return [4 /*yield*/, deployProxyFixedAddress(zeroControllerFactory, ["0x0F4ee9631f4be0a63756515141281A3E2B293Bbe", deployParameters["ETHEREUM"].gatewayRegistry], {
                            unsafeAllowLinkedLibraries: true
                        })];
                case 10:
                    zeroController = _b.sent();
                    return [4 /*yield*/, deployments.getArtifact('ZeroController')];
                case 11:
                    zeroControllerArtifact = _b.sent();
                    return [4 /*yield*/, deployments.save('ZeroController', {
                            contractName: 'ZeroController',
                            address: zeroController.address,
                            bytecode: zeroControllerArtifact.bytecode,
                            abi: zeroControllerArtifact.abi
                        })];
                case 12:
                    _b.sent();
                    return [4 /*yield*/, deployFixedAddress('BTCVault', {
                            contractName: 'BTCVault',
                            args: [deployParameters['ETHEREUM']['renBTC'], zeroController.address, "zeroBTC", "zBTC"],
                            from: deployer
                        })];
                case 13:
                    BTCVault = _b.sent();
                    return [4 /*yield*/, deployFixedAddress("ZERO", {
                            contractName: "ZERO",
                            args: [],
                            from: deployer
                        })];
                case 14:
                    zeroToken = _b.sent();
                    return [4 /*yield*/, ethers.getContract('ZERO', testTreasury)];
                case 15:
                    zero = _b.sent();
                    return [4 /*yield*/, deployFixedAddress("ZeroDistributor", {
                            contractName: "ZeroDistributor",
                            args: [
                                testTreasury.address,
                                zero.address,
                                merkleRoot,
                            ],
                            from: deployer
                        })];
                case 16:
                    zeroDistributor = _b.sent();
                    console.log("Begin Testing\n");
                    RENBTC_HOLDER = "0x9804bbbc49cc2a309e5f2bf66d4ad97c3e0ebd2f";
                    return [4 /*yield*/, hre.network.provider.request({ method: 'hardhat_impersonateAccount', params: [RENBTC_HOLDER] })];
                case 17:
                    _b.sent();
                    return [4 /*yield*/, ethers.getSigner(RENBTC_HOLDER)];
                case 18:
                    signer = _b.sent();
                    renBTC = new ethers.Contract(deployParameters['ETHEREUM']['renBTC'], erc20abi, signer);
                    zero.approve(testTreasury.address, ethers.constants.MaxInt256);
                    return [4 /*yield*/, zero.mint(testTreasury.address, ethers.utils.parseUnits('88000000', 18))
                        /* For staking after airdrop complete
                        const masterChef = await deployFixedAddress("MasterChef", {
                            contractName: "MasterChef",
                            args: [
                                // ZERO _zero,
                                // address _devaddr,
                                // uint256 _zeroPerBlock,
                                // uint256 _startBlock,
                                // uint256 _bonusEndBlock
                            ],
                            from: deployer
                        })
                        */
                    ];
                case 19:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
};
