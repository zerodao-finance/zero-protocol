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
require('@nomiclabs/hardhat-ethers');
require('hardhat-deploy');
require('hardhat-deploy-ethers');
require('hardhat-gas-reporter');
require('@openzeppelin/hardhat-upgrades');
require('@nomiclabs/hardhat-etherscan');
require('dotenv').config();
require('./tasks/multisig');
require('./tasks/init-multisig');
var ethers = require('ethers');
if (!process.env.CHAIN_ID && process.env.CHAIN === 'ARBITRUM')
    process.env.CHAIN_ID = '42161';
if (!process.env.CHAIN_ID && process.env.CHAIN === 'MATIC')
    process.env.CHAIN_ID = '137';
if (!process.env.CHAIN_ID && process.env.CHAIN === 'ETHEREUM')
    process.env.CHAIN_ID = '1';
var override = require('./lib/test/inject-mock').override;
var RPC_ENDPOINTS = {
    ARBITRUM: 'https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
    MATIC: 'https://polygon-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
    ETHEREUM: 'https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2'
};
var deployParameters = require('./lib/fixtures');
if (process.argv.slice(1).includes('node')) {
    (function () { return __awaiter(_this, void 0, void 0, function () {
        var artifact, getImplementation, network, implementationAddress;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    artifact = require('./artifacts/contracts/test/MockGatewayLogicV1.sol/MockGatewayLogicV1');
                    getImplementation = function (proxyAddress) { return __awaiter(_this, void 0, void 0, function () {
                        var provider, _a, _b, _c, _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    provider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINTS[process.env.CHAIN]);
                                    _b = (_a = ethers.utils).getAddress;
                                    return [4 /*yield*/, provider.getStorageAt(proxyAddress, '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc')];
                                case 1:
                                    _d = (_c = (_e.sent())).substr;
                                    return [4 /*yield*/, provider.getNetwork()];
                                case 2: return [2 /*return*/, _b.apply(_a, [_d.apply(_c, [(_e.sent()).chainId === 1337 ? 0 : 26])])];
                            }
                        });
                    }); };
                    network = process.env.CHAIN || 'ARBITRUM';
                    return [4 /*yield*/, getImplementation(deployParameters[network]['btcGateway'])];
                case 1:
                    implementationAddress = _a.sent();
                    override(implementationAddress, artifact.deployedBytecode);
                    return [2 /*return*/];
            }
        });
    }); })()["catch"](function (err) { return console.error(err); });
}
var accounts = [
    process.env.WALLET || ethers.Wallet.createRandom().privateKey,
    process.env.UNDERWRITER || ethers.Wallet.createRandom().privateKey,
];
process.env.ETHEREUM_MAINNET_URL =
    process.env.ETHEREUM_MAINNET_URL || 'https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2';
var ETHERSCAN_API_KEYS = {
    ARBITRUM: '7PW6SPNBFYV1EM5E5NT36JW7ARMS1FB4HW',
    MATIC: 'I13U9EN9YQ9931GYK9CJYQS9ZF51D5Z1F9'
};
var ETHERSCAN_API_KEY = ETHERSCAN_API_KEYS[process.env.CHAIN || 'ARBITRUM'] || ETHERSCAN_API_KEYS['ARBITRUM'];
module.exports = {
    defaultNetwork: 'hardhat',
    abiExporter: {
        path: './abi',
        clear: false,
        flat: true
    },
    networks: {
        mainnet: {
            url: process.env.ETHEREUM_MAINNET_URL,
            accounts: accounts,
            chainId: 1
        },
        localhost: {
            live: false,
            saveDeployments: true,
            tags: ['development']
        },
        hardhat: {
            live: false,
            saveDeployments: true,
            tags: ['development', 'test'],
            chainId: process.env.CHAIN_ID && Number(process.env.CHAIN_ID),
            forking: {
                enabled: process.env.FORKING === 'true',
                url: RPC_ENDPOINTS[process.env.CHAIN || 'ETHEREUM']
            }
        },
        avalanche: {
            url: 'https://api.avax.network/ext/bc/C/rpc',
            accounts: accounts,
            chainId: 43114,
            live: true,
            saveDeployments: true,
            gasPrice: 470000000000
        },
        matic: {
            url: 'https://rpc-mainnet.maticvigil.com',
            accounts: accounts,
            chainId: 137,
            live: true,
            saveDeployments: true
        },
        arbitrum: {
            url: RPC_ENDPOINTS.ARBITRUM,
            accounts: accounts,
            chainId: 42161,
            live: true,
            saveDeployments: true,
            blockGasLimit: 700000
        }
    },
    gasReporter: {
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        currency: 'USD',
        enabled: process.env.REPORT_GAS === 'true',
        excludeContracts: ['contracts/libraries/']
    },
    solidity: {
        compilers: [
            {
                version: '0.5.16',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
            {
                version: '0.6.12',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
            {
                version: '0.7.6',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
            {
                version: '0.8.4',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
        ]
    },
    namedAccounts: {
        deployer: {
            "default": 0
        },
        underwriter: {
            "default": 1
        }
    },
    mocha: {
        timeout: 0,
        grep: process.env.GREP
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    }
};
