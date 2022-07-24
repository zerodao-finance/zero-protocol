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
var TEST_KEEPER_ADDRESS = require("../lib/mock").TEST_KEEPER_ADDRESS;
var deployParameters = require("../lib/fixtures");
/*
const validate = require("@openzeppelin/upgrades-core/dist/validate/index");
Object.defineProperty(validate, "assertUpgradeSafe", {
  value: () => {},
});
*/
var ethers = hre.ethers, deployments = hre.deployments, upgrades = hre.upgrades;
var getControllerName = function () {
    switch (process.env.CHAIN) {
        case "MATIC":
            return "BadgerBridgeZeroControllerMatic";
        case "ARBITRUM":
            return "BadgerBridgeZeroControllerArb";
        case "ETHEREUM":
            return "BadgerBridgeZeroController";
        case "AVALANCHE":
            return "BadgerBridgeZeroControllerAvax";
        case "OPTIMISM":
            return "BadgerBridgeZeroControllerOptimism";
        default:
            return "ZeroController";
    }
};
var isLocalhost = !hre.network.config.live;
var SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";
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
var network = process.env.CHAIN || "ETHEREUM";
module.exports = function (_a) {
    var getNamedAccounts = _a.getNamedAccounts;
    return __awaiter(_this, void 0, void 0, function () {
        var deployer, ethersSigner, provider, _b, _c, _d, chainId, signer, deployerSigner, zeroControllerFactory, zeroController, zeroControllerArtifact;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getNamedAccounts()];
                case 1:
                    deployer = (_e.sent()).deployer;
                    return [4 /*yield*/, ethers.getSigners()];
                case 2:
                    ethersSigner = (_e.sent())[0];
                    provider = ethersSigner.provider;
                    _b = Number;
                    _d = (_c = ethers.utils).formatEther;
                    return [4 /*yield*/, provider.getBalance(deployer)];
                case 3:
                    if (!(_b.apply(void 0, [_d.apply(_c, [_e.sent()])]) === 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, ethersSigner.sendTransaction({
                            value: ethers.utils.parseEther("1"),
                            to: deployer
                        })];
                case 4:
                    _e.sent();
                    _e.label = 5;
                case 5: return [4 /*yield*/, provider.getNetwork()];
                case 6:
                    chainId = (_e.sent()).chainId;
                    if (!(hre.network.name === "hardhat")) return [3 /*break*/, 10];
                    return [4 /*yield*/, hre.network.provider.request({
                            method: "hardhat_impersonateAccount",
                            params: [SIGNER_ADDRESS]
                        })];
                case 7:
                    _e.sent();
                    return [4 /*yield*/, hre.network.provider.request({
                            method: "hardhat_impersonateAccount",
                            params: [TEST_KEEPER_ADDRESS]
                        })];
                case 8:
                    _e.sent();
                    return [4 /*yield*/, ethersSigner.sendTransaction({
                            value: ethers.utils.parseEther("0.5"),
                            to: TEST_KEEPER_ADDRESS
                        })];
                case 9:
                    _e.sent();
                    _e.label = 10;
                case 10: return [4 /*yield*/, ethers.getSigner(SIGNER_ADDRESS)];
                case 11:
                    signer = _e.sent();
                    return [4 /*yield*/, ethers.getSigners()];
                case 12:
                    deployerSigner = (_e.sent())[0];
                    console.log("RUNNING");
                    console.log("deploying controller");
                    return [4 /*yield*/, hre.ethers.getContractFactory(getControllerName(), {})];
                case 13:
                    zeroControllerFactory = _e.sent();
                    return [4 /*yield*/, upgrades.deployProxy(zeroControllerFactory, [
                            deployer,
                            deployer,
                        ])];
                case 14:
                    zeroController = _e.sent();
                    return [4 /*yield*/, deployments.getArtifact(getControllerName())];
                case 15:
                    zeroControllerArtifact = _e.sent();
                    return [4 /*yield*/, deployments.save(getControllerName(), {
                            contractName: getControllerName(),
                            address: zeroController.address,
                            bytecode: zeroControllerArtifact.bytecode,
                            abi: zeroControllerArtifact.abi
                        })];
                case 16:
                    _e.sent();
                    console.log("waiting on proxy deploy to mine ...");
                    return [4 /*yield*/, zeroController.deployTransaction.wait()];
                case 17:
                    _e.sent();
                    return [2 /*return*/];
            }
        });
    });
};
