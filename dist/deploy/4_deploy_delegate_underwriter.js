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
var hre = require('hardhat');
var common = require('./common');
module.exports = function () { return __awaiter(void 0, void 0, void 0, function () {
    var multisig, controller, signer, _a, _b, _c, delegate, _d, _e, _f, _g;
    var _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                if (!common.isSelectedDeployment(__filename))
                    return [2 /*return*/];
                return [4 /*yield*/, hre.ethers.getContract('GnosisSafe')];
            case 1:
                multisig = _j.sent();
                return [4 /*yield*/, hre.ethers.getContract('ZeroController')];
            case 2:
                controller = _j.sent();
                return [4 /*yield*/, hre.ethers.getSigners()];
            case 3:
                signer = (_j.sent())[0];
                _b = (_a = hre.deployments).deploy;
                _c = ['DelegateUnderwriter'];
                _h = {
                    contractName: 'DelegateUnderwriter',
                    args: [controller.address],
                    libraries: {}
                };
                return [4 /*yield*/, signer.getAddress()];
            case 4: return [4 /*yield*/, _b.apply(_a, _c.concat([(_h.from = _j.sent(),
                        _h)]))];
            case 5:
                _j.sent();
                return [4 /*yield*/, hre.ethers.getContract('DelegateUnderwriter')];
            case 6:
                delegate = _j.sent();
                _e = (_d = console).log;
                return [4 /*yield*/, delegate.addAuthority('0xFFEDC765778db2859820eE4869393e7939a847b7')];
            case 7:
                _e.apply(_d, [(_j.sent()).hash]);
                _g = (_f = console).log;
                return [4 /*yield*/, delegate.transferOwnership(multisig.address)];
            case 8:
                _g.apply(_f, [(_j.sent()).hash]);
                return [2 /*return*/];
        }
    });
}); };
