"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var hardhat_1 = __importDefault(require("hardhat"));
var generate_1 = require("../merkle/generate");
var ethers = hardhat_1["default"].ethers, deployments = hardhat_1["default"].deployments;
var deployFixedAddress = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Deploying ' + args[0]);
                    console.log("Args Here: ", args);
                    args[1].waitConfirmations = 1;
                    return [4 /*yield*/, deployments.deploy.apply(deployments, args)];
                case 1:
                    result = _a.sent();
                    console.log('Deployed to ' + result.address);
                    if (!(args[0] === 'ZERO')) return [3 /*break*/, 2];
                    return [2 /*return*/];
                case 2: return [4 /*yield*/, ethers.getContract(args[0])];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
var SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";
module.exports = function (_a) {
    var getNamedAccounts = _a.getNamedAccounts;
    return __awaiter(void 0, void 0, void 0, function () {
        var deployer, ethersSigner, provider, chainId, _b, hexRoot, decimals, testTreasury, zeroToken, zeroDistributor, _c, _d, _e, RENBTC_HOLDER, signer;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (process.env.CHAIN !== "ETHEREUM")
                        return [2 /*return*/];
                    return [4 /*yield*/, getNamedAccounts()];
                case 1:
                    deployer = (_f.sent()).deployer;
                    return [4 /*yield*/, ethers.getSigners()];
                case 2:
                    ethersSigner = (_f.sent())[0];
                    provider = ethersSigner.provider;
                    return [4 /*yield*/, provider.getNetwork()];
                case 3:
                    chainId = (_f.sent()).chainId;
                    if (!(chainId === 1)) return [3 /*break*/, 5];
                    return [4 /*yield*/, hardhat_1["default"].network.provider.request({
                            method: "hardhat_impersonateAccount",
                            params: [SIGNER_ADDRESS]
                        })];
                case 4:
                    _f.sent();
                    _f.label = 5;
                case 5:
                    _b = (0, generate_1.useMerkleGenerator)(), hexRoot = _b.hexRoot, decimals = _b.decimals;
                    return [4 /*yield*/, ethers.getSigners()];
                case 6:
                    testTreasury = (_f.sent())[0];
                    return [4 /*yield*/, deployFixedAddress("ZERO", {
                            contractName: "ZERO",
                            args: [],
                            from: deployer
                        })];
                case 7:
                    _f.sent();
                    return [4 /*yield*/, ethers.getContract('ZERO', testTreasury)];
                case 8:
                    zeroToken = _f.sent();
                    return [4 /*yield*/, deployFixedAddress("ZeroDistributor", {
                            contractName: "ZeroDistributor",
                            args: [
                                testTreasury.address,
                                zeroToken.address,
                                hexRoot,
                            ],
                            from: deployer
                        })];
                case 9:
                    zeroDistributor = _f.sent();
                    return [4 /*yield*/, zeroToken.mint(testTreasury.address, ethers.utils.parseUnits('88000000', decimals))];
                case 10:
                    _f.sent();
                    _d = (_c = zeroToken).approve;
                    _e = [zeroDistributor.address];
                    return [4 /*yield*/, zeroToken.balanceOf(testTreasury.address)];
                case 11: return [4 /*yield*/, _d.apply(_c, _e.concat([_f.sent()]))];
                case 12:
                    _f.sent();
                    console.log("Begin Testing\n");
                    RENBTC_HOLDER = "0x9804bbbc49cc2a309e5f2bf66d4ad97c3e0ebd2f";
                    return [4 /*yield*/, hardhat_1["default"].network.provider.request({ method: 'hardhat_impersonateAccount', params: [RENBTC_HOLDER] })];
                case 13:
                    _f.sent();
                    return [4 /*yield*/, ethers.getSigner(RENBTC_HOLDER)];
                case 14:
                    signer = _f.sent();
                    return [2 /*return*/];
            }
        });
    });
};
