
var { ethers } = require('ethers');
var BadgerBridgeZeroController = require('./artifacts/contracts/controllers/BadgerBridgeZeroController.sol/BadgerBridgeZeroController');

var provider = new ethers.providers.InfuraProvider('mainnet');


var factory = new ethers.ContractFactory(BadgerBridgeZeroController.abi, BadgerBridgeZeroController.bytecode, new ethers.Wallet(process.env.WALLET || ethers.Wallet.createRandom().privateKey, provider));

var { UnderwriterTransferRequest } = require('./lib/UnderwriterRequest');
var transferRequest = new UnderwriterTransferRequest(require('../debugTR'));

