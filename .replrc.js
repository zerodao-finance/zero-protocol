
var { ethers } = require('ethers');
var BadgerBridgeZeroController = require('./artifacts/contracts/controllers/BadgerBridgeZeroController.sol/BadgerBridgeZeroController');

var provider = new ethers.providers.InfuraProvider('mainnet');


var factory = new ethers.ContractFactory(BadgerBridgeZeroController.abi, BadgerBridgeZeroController.bytecode, new ethers.Wallet(process.env.WALLET, provider));
var transferRequest = new (require('./dist/lib/UnderwriterRequest').UnderwriterTransferRequest)(JSON.parse("{\"requestType\":\"transfer\",\"module\":\"0x85f6583762Bc76d775eAB9A7456db344f12409F7\",\"to\":\"0x0235175496c649B9AF7C78f7550D6d7cb453F0Fa\",\"underwriter\":\"0x5556834773F7c01e11a47449D56042cDF6Df9128\",\"asset\":\"0x85f6583762Bc76d775eAB9A7456db344f12409F7\",\"amount\":\"0x035b60\",\"data\":\"0x0000000000000000000000000000000000000000000000000000000000004ab0\",\"nonce\":\"0x33c8c14ab6d4e9b32a4dcf9025610e4083c6ad3750eb89c3c42f5ebc11c26b5a\",\"pNonce\":\"0x33e9d4207195209f10d80d257d8aa102e9e9a055f852e11da908e717ad28cf70\",\"chainId\":10,\"contractAddress\":\"0x5556834773F7c01e11a47449D56042cDF6Df9128\",\"signature\":\"0x4e582527cdda318ccf9396b816b1d02471880645e7ba507ccf1b139fba456b110e85f8395191748a072772a6171017e78f25cb712c4df64c2a78b2c6d7da19d11b\"}"))
