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
var use_merkle_1 = require("../lib/merkle/use-merkle");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
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
        var deployer, ethersSigner, provider, chainId, merkleDir, merkleInput, merkleTree, testTreasury, zeroToken, zeroDistributor, decimals, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    if (process.env.CHAIN !== "ETHEREUM")
                        return [2 /*return*/];
                    return [4 /*yield*/, getNamedAccounts()];
                case 1:
                    deployer = (_o.sent()).deployer;
                    return [4 /*yield*/, ethers.getSigners()];
                case 2:
                    ethersSigner = (_o.sent())[0];
                    provider = ethersSigner.provider;
                    return [4 /*yield*/, provider.getNetwork()];
                case 3:
                    chainId = (_o.sent()).chainId;
                    if (process.env.FORKING) {
                        /*
                        await hre.network.provider.request({
                            method: "hardhat_impersonateAccount",
                            params: [SIGNER_ADDRESS]
                        })
                    */
                    }
                    merkleDir = path_1["default"].join(__dirname, '..', 'merkle', process.env.FORKING ? 'forknet' : 'mainnet');
                    merkleInput = require(path_1["default"].join(merkleDir, 'input'));
                    merkleTree = (0, use_merkle_1.useMerkleGenerator)(merkleInput);
                    console.log(merkleTree);
                    return [4 /*yield*/, fs_1["default"].writeFileSync(path_1["default"].join(merkleDir, 'airdrop.json'), JSON.stringify(merkleTree, null, 2))];
                case 4:
                    _o.sent();
                    console.log('wrote merkle tree');
                    return [4 /*yield*/, ethers.getSigners()];
                case 5:
                    testTreasury = (_o.sent())[0];
                    return [4 /*yield*/, deployFixedAddress("ZERO", {
                            contractName: "ZERO",
                            args: [],
                            from: deployer
                        })];
                case 6:
                    _o.sent();
                    return [4 /*yield*/, ethers.getContract('ZERO', testTreasury)];
                case 7:
                    zeroToken = _o.sent();
                    return [4 /*yield*/, deployFixedAddress("ZeroDistributor", {
                            contractName: "ZeroDistributor",
                            args: [
                                zeroToken.address,
                                testTreasury.address,
                                merkleTree.merkleRoot,
                            ],
                            from: deployer
                        })];
                case 8:
                    zeroDistributor = _o.sent();
                    decimals = 18;
                    return [4 /*yield*/, zeroToken.mint(testTreasury.address, ethers.utils.parseUnits('88000000', decimals))];
                case 9:
                    _o.sent();
                    _c = (_b = zeroToken.connect(testTreasury)).approve;
                    _d = [zeroDistributor.address];
                    return [4 /*yield*/, zeroToken.balanceOf(testTreasury.address)];
                case 10: return [4 /*yield*/, _c.apply(_b, _d.concat([_o.sent()]))];
                case 11:
                    _o.sent();
                    console.log("\nTreasury Balance:\n");
                    _f = (_e = console).log;
                    _h = (_g = ethers.utils).formatUnits;
                    return [4 /*yield*/, zeroToken.balanceOf(testTreasury.address)];
                case 12:
                    _f.apply(_e, [_h.apply(_g, [_o.sent(), decimals])]);
                    console.log("\nAllowance:\n");
                    _k = (_j = console).log;
                    _m = (_l = ethers.utils).formatUnits;
                    return [4 /*yield*/, zeroToken.allowance(testTreasury.address, zeroDistributor.address)];
                case 13:
                    _k.apply(_j, [_m.apply(_l, [_o.sent(), decimals])]);
                    return [2 /*return*/];
            }
        });
    });
};
