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
var ethers = hre.ethers, deployments = hre.deployments;
var deployParameters = require('../lib/fixtures');
var TEST_KEEPER_ADDRESS = require('../lib/mock').TEST_KEEPER_ADDRESS;
var linker = require('solc/linker');
var _a = require('./common'), fundWithGas = _a.fundWithGas, deployFixedAddress = _a.deployFixedAddress, getSigner = _a.getSigner, getContract = _a.getContract;
var network = process.env.CHAIN || 'MATIC';
var SIGNER_ADDRESS = '0x0F4ee9631f4be0a63756515141281A3E2B293Bbe';
// const abi = [
//     'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
//     'function mintFee() view returns (uint256)',
//     'function approve(address _spender, uint256 _value) returns (bool)',
//     'function transferFrom(address _from, address _to, uint256 _value) returns (bool)',
//     'function allowance(address _owner, address _spender) view returns (uint256)'
// ];
//
//
module.exports = function (_a) {
    var getChainId = _a.getChainId, getUnnamedAccounts = _a.getUnnamedAccounts, getNamedAccounts = _a.getNamedAccounts;
    return __awaiter(_this, void 0, void 0, function () {
        var arbitraryTokens, hardhatSigner, zeroController, deployerSigner, deployer, controller, quick, meta, governanceSigner, _b, _c, code, keeperSigner;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!process.env.FORKING || process.env.CHAIN === 'ETHEREUM' || process.env.DEPLOYARBITRUMQUICKCONVERT)
                        return [2 /*return*/];
                    arbitraryTokens = ethers.utils.parseUnits('8', 8).toString();
                    return [4 /*yield*/, hre.ethers.getSigners()];
                case 1:
                    hardhatSigner = (_d.sent())[0];
                    console.log('sending eth');
                    return [4 /*yield*/, hre.network.provider.send('hardhat_setBalance', [
                            deployParameters[network]['Curve_Ren'],
                            ethers.utils.hexStripZeros(ethers.utils.parseEther('10.0').toHexString()),
                        ])];
                case 2:
                    _d.sent();
                    console.log('sent eth');
                    return [4 /*yield*/, getContract('ZeroController')];
                case 3:
                    zeroController = _d.sent();
                    return [4 /*yield*/, hre.ethers.getSigners()];
                case 4:
                    deployerSigner = (_d.sent())[0];
                    return [4 /*yield*/, deployerSigner.getAddress()];
                case 5:
                    deployer = _d.sent();
                    return [4 /*yield*/, deployments.deploy('ZeroDistributor', { contractName: 'ZeroDistributor', args: [ethers.constants.AddressZero, ethers.constants.AddressZero, ethers.utils.hexlify(ethers.utils.randomBytes(32))], libraries: {}, from: deployer })];
                case 6:
                    _d.sent();
                    if (!(process.env.CHAIN === 'ARBITRUM')) return [3 /*break*/, 19];
                    return [4 /*yield*/, getContract('ZeroController')];
                case 7:
                    controller = _d.sent();
                    return [4 /*yield*/, deployFixedAddress('ArbitrumConvertQuick', {
                            args: [controller.address, ethers.utils.parseUnits('15', 8), '100000'],
                            contractName: 'ArbitrumConvertQuick',
                            libraries: {},
                            from: deployer
                        })];
                case 8:
                    quick = _d.sent();
                    return [4 /*yield*/, deployFixedAddress('MetaExecutor', {
                            args: [controller.address, ethers.utils.parseUnits('15', 8), '100000'],
                            contractName: 'MetaExecutor',
                            libraries: {},
                            from: deployer
                        })];
                case 9:
                    meta = _d.sent();
                    _b = getSigner;
                    return [4 /*yield*/, controller.governance()];
                case 10: return [4 /*yield*/, _b.apply(void 0, [_d.sent()])];
                case 11:
                    governanceSigner = _d.sent();
                    _c = fundWithGas;
                    return [4 /*yield*/, governanceSigner.getAddress()];
                case 12: return [4 /*yield*/, _c.apply(void 0, [_d.sent()])];
                case 13:
                    _d.sent();
                    return [4 /*yield*/, controller.connect(governanceSigner).approveModule(meta.address, true)];
                case 14:
                    _d.sent();
                    return [4 /*yield*/, deployerSigner.provider.getCode(controller.address)];
                case 15:
                    code = _d.sent();
                    return [4 /*yield*/, hre.network.provider.send('hardhat_setCode', [controller.address, ((require('../artifacts/contracts/test/ZeroControllerTest.sol/ZeroControllerTest').deployedBytecode))])];
                case 16:
                    _d.sent();
                    return [4 /*yield*/, controller.approveModule(quick.address, true)];
                case 17:
                    _d.sent();
                    return [4 /*yield*/, hre.network.provider.send('hardhat_setCode', [controller.address, code])];
                case 18:
                    _d.sent();
                    console.log('approved');
                    _d.label = 19;
                case 19: return [4 /*yield*/, getSigner(TEST_KEEPER_ADDRESS)];
                case 20:
                    keeperSigner = _d.sent();
                    return [2 /*return*/];
            }
        });
    });
};
