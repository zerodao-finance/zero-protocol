'use strict';
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
var path = require('path');
var hre = require('hardhat');
var ethers = hre.ethers, upgrades = hre.upgrades, deployments = hre.deployments;
exports = module.exports = function () { };
exports.isSelectedDeployment = function (filename) {
    return process.env.DEPLOYMENT_NUMBER
        ? (function () {
            var match = filename.match(/(?:\d+)(?=_deploy)/gi);
            if (match.length == 0)
                return false;
            return Number(match[0]) == process.env.DEPLOYMENT_NUMBER;
        })()
        : false;
};
exports.networkNameFromEnv = function () {
    if (!process.env.CHAIN)
        return 'localhost';
    switch (process.env.CHAIN) {
        case 'ETHEREUM':
            return 'mainnet';
        default:
            return process.env.CHAIN.toLowerCase();
    }
};
exports.getSigner = function (address) { return __awaiter(void 0, void 0, void 0, function () {
    var e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, hre.network.provider.request({
                        method: 'hardhat_impersonateAccount',
                        params: [address]
                    })];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_1 = _a.sent();
                return [3 /*break*/, 3];
            case 3: return [4 /*yield*/, ethers.getSigner(address)];
            case 4: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.fundWithGas = function (address) { return __awaiter(void 0, void 0, void 0, function () {
    var signer, balance, _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!process.env.FORKING || hre.network.name !== 'hardhat')
                    return [2 /*return*/];
                return [4 /*yield*/, hre.ethers.getSigners()];
            case 1:
                signer = (_d.sent())[0];
                _a = Number;
                _c = (_b = hre.ethers.utils).formatEther;
                return [4 /*yield*/, signer.provider.getBalance(address)];
            case 2:
                balance = _a.apply(void 0, [_c.apply(_b, [_d.sent()])]);
                if (!(balance < 0.1)) return [3 /*break*/, 4];
                return [4 /*yield*/, signer.sendTransaction({
                        to: address,
                        value: ethers.utils.parseEther('0.1')
                    })];
            case 3:
                _d.sent();
                _d.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.deployFixedAddress = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
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
exports.deployProxyFixedAddress = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
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
exports.getContract = function (name) { return __awaiter(void 0, void 0, void 0, function () {
    var deployment, signer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                deployment = require(path.join(__dirname, '..', 'deployments', exports.networkNameFromEnv(), name));
                return [4 /*yield*/, ethers.getSigners()];
            case 1:
                signer = (_a.sent())[0];
                return [2 /*return*/, new ethers.Contract(deployment.address, deployment.abi, signer)];
        }
    });
}); };
