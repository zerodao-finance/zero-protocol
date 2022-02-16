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
var ethers = hre.ethers, deployments = hre.deployments;
var deployParameters = require('../lib/fixtures');
var network = process.env.CHAIN || 'MATIC';
var SIGNER_ADDRESS = "0x0F4ee9631f4be0a63756515141281A3E2B293Bbe";
// const abi = [
//     'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
//     'function mintFee() view returns (uint256)',
//     'function approve(address _spender, uint256 _value) returns (bool)',
//     'function transferFrom(address _from, address _to, uint256 _value) returns (bool)',
//     'function allowance(address _owner, address _spender) view returns (uint256)'
// ];
module.exports = function (_a) {
    var getChainId = _a.getChainId, getUnnamedAccounts = _a.getUnnamedAccounts, getNamedAccounts = _a.getNamedAccounts;
    return __awaiter(_this, void 0, void 0, function () {
        var arbitraryTokens, abi, selfdestructSend, hardhatSigner, signer, zeroController, zcntrl_address, renBTC, connectedRenBTC, balance, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!process.env.FORKING)
                        return [2 /*return*/];
                    arbitraryTokens = (ethers.utils.parseUnits("8", 8)).toString();
                    return [4 /*yield*/, deployments.getArtifact("BTCVault")];
                case 1:
                    abi = (_d.sent()).abi;
                    return [4 /*yield*/, hre.ethers.getContractFactory('SelfdestructSend')];
                case 2:
                    selfdestructSend = _d.sent();
                    return [4 /*yield*/, hre.ethers.getSigners()];
                case 3:
                    hardhatSigner = (_d.sent())[0];
                    console.log('sending eth');
                    return [4 /*yield*/, hardhatSigner.sendTransaction(selfdestructSend.getDeployTransaction(deployParameters[network].Curve_Ren, {
                            value: hre.ethers.utils.parseEther('0.5')
                        }))];
                case 4:
                    _d.sent();
                    console.log('sent eth');
                    // impersonate Curve Ren for network
                    return [4 /*yield*/, hre.network.provider.request({
                            method: "hardhat_impersonateAccount",
                            params: [deployParameters[network]['Curve_Ren']]
                        })];
                case 5:
                    // impersonate Curve Ren for network
                    _d.sent();
                    return [4 /*yield*/, ethers.getSigner(deployParameters[network]['Curve_Ren'])];
                case 6:
                    signer = _d.sent();
                    console.log('signer is', signer.address);
                    return [4 /*yield*/, ethers.getContract("ZeroController", SIGNER_ADDRESS)];
                case 7:
                    zeroController = _d.sent();
                    return [4 /*yield*/, zeroController.lockFor(SIGNER_ADDRESS)];
                case 8:
                    zcntrl_address = _d.sent();
                    console.log("zero controller address", zcntrl_address);
                    renBTC = new ethers.Contract(deployParameters[network]['renBTC'], abi, signer);
                    return [4 /*yield*/, renBTC.connect(signer)]; // attach curve_ren provider
                case 9:
                    connectedRenBTC = _d.sent() // attach curve_ren provider
                    ;
                    return [4 /*yield*/, renBTC.balanceOf(deployParameters[network]["Curve_Ren"])];
                case 10:
                    balance = _d.sent();
                    console.log(ethers.utils.formatUnits(balance, 8));
                    console.log(ethers.utils.formatUnits(arbitraryTokens, 8));
                    _c = (_b = console).log;
                    return [4 /*yield*/, renBTC.balanceOf(zcntrl_address)];
                case 11:
                    _c.apply(_b, [_d.sent()]);
                    return [4 /*yield*/, connectedRenBTC.transfer(zcntrl_address, arbitraryTokens, { from: signer.address, value: '0' })
                        // // const signer = (await ethers.getSigner(deployParameters[network]["Curve_Ren"])) 
                        // // approve approve transfering arbitrary funds
                        // renBTC.approve(deployParameters[network]["Curve_Ren"], arbitraryTokens)
                        // // renBTC.allowance(deployParameters[network]["Curve_Ren"], zcnrtl_address)
                        // // const Curve = new ethers.Contract(deployParameters[network]['Curve_Ren'], abi, signer)
                        // let approveRequest = await renBTC.approve(SIGNER_ADDRESS, arbitraryTokens)
                        // let allowance = await renBTC.allowance(deployParameters[network]["Curve_Ren"], SIGNER_ADDRESS)
                        // let transferRequest = await renBTC.transferFrom(deployParameters[network]["Curve_Ren"], SIGNER_ADDRESS, arbitraryTokens)
                        // console.log(transferRequest, approveRequest)
                        // console.log(await btcGateway.balanceOf())
                        // console.log("Testing Keeper with", ethers.utils.formatUnits(await signer.getBalance(), 8))
                    ];
                case 12:
                    _d.sent();
                    return [2 /*return*/];
            }
        });
    });
};
