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
import { TransferRequest } from '../zero';
import { constants, utils } from 'ethers';
import { computeP, computePHash, computePHashFromP, maybeCoerceToGHash, computeNHash } from '../util/helpers';
import { expect } from 'chai';
import { validate } from 'bitcoin-address-validation';
import 'mocha';
describe('computeP unit test', function () {
    it('has a correct return for computeP', function () {
        var expected = '0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000';
        var pReturn = computeP('0x00', '1', constants.AddressZero, '0x00');
        expect(pReturn).to.be.eq(expected);
    });
    it('has a correct return for computePHashFromP', function () {
        var p = '0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000';
        var expected = '0xabaf29967fbafb35d97cab780a1333c0583f2ce39b1eaf0c7da0260baf57650d';
        var pHash = computePHashFromP(p);
        expect(pHash).to.be.eq(expected);
    });
    it('has a correct return from computePHash', function () {
        var expected = '0xabaf29967fbafb35d97cab780a1333c0583f2ce39b1eaf0c7da0260baf57650d';
        var pHash = computePHash({ nonce: '1', module: constants.AddressZero, data: '0x00', to: '0x00' });
        expect(pHash).to.be.eq(expected);
    });
    it('converts an object to a ghash', function () {
        var expected = '0x1802dfcb2df77afef24f20ce516bd6ec50cec35aa1ed6359a81fd6d950006902';
        var p = '0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000';
        var gHash = maybeCoerceToGHash({
            to: constants.AddressZero,
            tokenAddress: constants.AddressZero,
            p: p,
            nonce: utils.formatBytes32String('1'),
        });
        expect(gHash).to.be.eq(expected);
    });
    it("doesn't modify a ghash passed through", function () {
        var expected = '0x1802dfcb2df77afef24f20ce516bd6ec50cec35aa1ed6359a81fd6d950006902';
        var gHash = maybeCoerceToGHash(expected);
        expect(gHash).to.be.eq(expected);
    });
    it('creates a correct NHash', function () {
        var nHash = computeNHash({
            nonce: utils.formatBytes32String('1'),
            txHash: utils.formatBytes32String('1'),
            vOut: 1,
        });
    });
    it('creates a correct TransferRequest', function () {
        var transferRequest = new TransferRequest({
            asset: constants.AddressZero,
            module: constants.AddressZero,
            to: constants.AddressZero,
            underwriter: constants.AddressZero,
            amount: '1',
            data: '0x00',
            contractAddress: constants.AddressZero,
            chainId: 1
        });
        expect(transferRequest).to.be.instanceof(TransferRequest);
    });
    it('creates a valid gateway address', function () { return __awaiter(void 0, void 0, void 0, function () {
        var transferRequest, gatewayAddress, isValidAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transferRequest = new TransferRequest({
                        asset: constants.AddressZero,
                        module: constants.AddressZero,
                        to: constants.AddressZero,
                        underwriter: constants.AddressZero,
                        amount: '1',
                        data: '0x00',
                        contractAddress: constants.AddressZero,
                        chainId: 1
                    });
                    return [4 /*yield*/, transferRequest.toGatewayAddress({
                            isTest: true
                        })];
                case 1:
                    gatewayAddress = _a.sent();
                    isValidAddress = validate(gatewayAddress);
                    expect(isValidAddress).to.be.true;
                    return [2 /*return*/];
            }
        });
    }); });
    it('creates a valid EIP721 response', function () {
        var expected = {
            types: {
                EIP712Domain: [
                    {
                        name: 'name',
                        type: 'string',
                    },
                    {
                        name: 'version',
                        type: 'string',
                    },
                    {
                        name: 'chainId',
                        type: 'uint256',
                    },
                    {
                        name: 'verifyingContract',
                        type: 'address',
                    },
                ],
                TransferRequest: [
                    {
                        name: 'asset',
                        type: 'address',
                    },
                    {
                        name: 'amount',
                        type: 'uint256',
                    },
                    {
                        name: 'underwriter',
                        type: 'address',
                    },
                    {
                        name: 'module',
                        type: 'address',
                    },
                    {
                        name: 'nonce',
                        type: 'uint256',
                    },
                    {
                        name: 'data',
                        type: 'bytes',
                    },
                ],
            },
            domain: {
                name: 'ZeroController',
                version: '1',
                chainId: '1',
                verifyingContract: '0x0000000000000000000000000000000000000000',
            },
            message: {
                module: '0x0000000000000000000000000000000000000000',
                asset: '0x0000000000000000000000000000000000000000',
                amount: '1',
                data: '0x00',
                underwriter: '0x0000000000000000000000000000000000000000',
                nonce: '0x3100000000000000000000000000000000000000000000000000000000000000',
            },
            primaryType: 'TransferRequest',
        };
        var transferRequest = new TransferRequest({
            asset: constants.AddressZero,
            module: constants.AddressZero,
            to: constants.AddressZero,
            underwriter: constants.AddressZero,
            amount: '1',
            data: '0x00',
            contractAddress: constants.AddressZero,
            chainId: 1
        });
        var EIP712 = transferRequest.toEIP712(constants.AddressZero, 1);
        expect(EIP712).to.be.deep.eq(expected);
    });
});
