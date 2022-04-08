
var { ethers } = require('ethers');
var BadgerBridgeZeroController = require('./deployments/localhost/BadgerBridgeZeroController');

var { TEST_KEEPER_ADDRESS } = require('./dist/lib/mock');

var provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

var checkKeeperBalance = async () => ethers.utils.formatEther(await provider.getBalance(TEST_KEEPER_ADDRESS))

var contract = new ethers.Contract(BadgerBridgeZeroController.address, ['function earn()'], provider.getSigner(0));

var earn = async () => await contract.earn();

