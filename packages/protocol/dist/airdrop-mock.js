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
exports.testClaim = exports.startMockEnvironment = void 0;
var hre = require('hardhat');
var ethers = hre.ethers, deployments = hre.deployments;
var balance_tree_1 = __importDefault(require("./merkle/balance-tree"));
require("./merkle/merkle-tree");
var config = {
    decimals: 18,
    airdrop: {
        '0xe32d9D1F1484f57F8b5198f90bcdaBC914de0B5A': '100',
        '0x7f78Da15E8298e7afe6404c54D93cb5269D97570': '100',
        '0xdd2fd4581271e230360230f9337d5c0430bf44c0': '100',
        '0x46F71A5b3aCF70cc1Eab83234c158A27F350c66A': '100'
    }
};
var whitelist_config = [
    { account: '0xe32d9D1F1484f57F8b5198f90bcdaBC914de0B5A', amount: ethers.utils.parseUnits('100', 18) },
    { account: '0x46F71A5b3aCF70cc1Eab83234c158A27F350c66A', amount: ethers.utils.parseUnits('100', 18) },
    { account: '0x7f78Da15E8298e7afe6404c54D93cb5269D97570', amount: ethers.utils.parseUnits('100', 18) },
    { account: '0xdd2fd4581271e230360230f9337d5c0430bf44c0', amount: ethers.utils.parseUnits('100', 18) },
];
var startMockEnvironment = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, owner, treasury, zeroDistributor, zeroToken, mTree, hexRoot, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = ethers.getSigners(), owner = _a[0], treasury = _a[1];
                return [4 /*yield*/, new ethers.getContractFactory('ZeroDistributor', owner)];
            case 1:
                zeroDistributor = _e.sent();
                return [4 /*yield*/, ethers.getContract('ZERO', treasury)];
            case 2:
                zeroToken = _e.sent();
                mTree = new balance_tree_1["default"](whitelist_config);
                hexRoot = mTree.getHexRoot();
                return [4 /*yield*/, zeroDistributor.deploy(zeroToken.address, treasury.address, hexRoot)];
            case 3:
                _e.sent();
                _c = (_b = zeroToken).approve;
                _d = [zeroDistributor.address];
                return [4 /*yield*/, zeroToken.balanceOf(treasury.address)];
            case 4:
                _c.apply(_b, _d.concat([_e.sent()]));
                return [2 /*return*/, mTree];
        }
    });
}); };
exports.startMockEnvironment = startMockEnvironment;
var testClaim = function (address, mTree) { return __awaiter(void 0, void 0, void 0, function () {
    var index, proof, signer, zDist;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                index = whitelist_config
                    .map(function (i) {
                    return i.account;
                })
                    .indexOf(address);
                proof = mTree.getProof(index, whitelist_config[index].account, whitelist_config[index].amount);
                return [4 /*yield*/, ethers.getSigners()];
            case 1:
                signer = (_a.sent())[0];
                return [4 /*yield*/, ethers.getContract('ZeroDistributor', signer)];
            case 2:
                zDist = _a.sent();
                return [4 /*yield*/, zDist.claim(index, address, whitelist_config[index].amount.toString(), proof)];
            case 3:
                _a.sent();
                return [2 /*return*/, true];
        }
    });
}); };
exports.testClaim = testClaim;
