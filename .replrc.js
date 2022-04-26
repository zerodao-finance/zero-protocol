
var { ethers } = require('ethers');
var BadgerBridgeZeroController = require('./deployments/mainnet/BadgerBridgeZeroController');
var level = require('./lib/persistence/leveldb');

var { TEST_KEEPER_ADDRESS } = require('./dist/lib/mock');

var provider = new ethers.providers.InfuraProvider('mainnet');

var checkKeeperBalance = async () => ethers.utils.formatEther(await provider.getBalance(TEST_KEEPER_ADDRESS))

var contract = new ethers.Contract(BadgerBridgeZeroController.address, BadgerBridgeZeroController.abi, provider);

var earn = async () => await contract.earn();

