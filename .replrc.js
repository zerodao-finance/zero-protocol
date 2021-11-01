
var { RenJS } = require('@renproject/ren');

var deployments = require('./deployments/deployments');
var {contracts} = deployments[137].matic;
var r = new RenJS('mainnet');
var { getDefaultBitcoinClient } = require('./lib/rpc/btc');
var Client = require('bitcoin-core');
var ethers = require('ethers');
var provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/8_zmSL_WeJCxMIWGNugMkRgphmOCftMm");
var wallet = new ethers.Wallet(process.env.WALLET).connect(provider);
var getContract = (contract) => {
  return new ethers.Contract(contracts[contract].address, contracts[contract].abi, wallet);
};
var renVMStrategy = getContract('StrategyRenVM');
var dummy = getContract('DummyVault');
var renbtc = new ethers.Contract('0xDBf31dF14B66535aF65AaC99C32e9eA844e14501', [
  'function approve(address, uint256) returns (bool)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address, uint256) returns (bool)'
], wallet);
var controller = new ethers.Contract(contracts.ZeroController.address, [
  'function governance() view returns (address)',
  'function inCaseTokensGetStuck(address, uint256)',
  'function withdrawAll(address)',
  'function mint(address, address)',
  'function lockFor(address) view returns (address)'
], wallet);
var vault = getContract('BTCVault');
var trivial = getContract('TrivialUnderwriter');
//var makeKeeper = async () => await zero.createZeroKeeper(await zero.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));

//var makeUser = async () => await zero.createZeroUser(await zero.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));
var peerId = require('peer-id');

var peerInfo = require('peer-info');
var f = async () => {
  const user = await makeUser();
  await user.conn.start();
  await user.publishTransferRequest({});
  return user;
};

var btc = getDefaultBitcoinClient();

//var { TransferRequest } = zero;
var ethers = require('ethers');
//var wallet = ethers.Wallet.createRandom();

/*
var connectToMainnet = function (signer) {
  wallet = wallet.connect(new ethers.providers.InfuraProvider('mainnet'));
};
*/

//connectToMainnet();

/*
var transferRequest = new TransferRequest({
  asset: ethers.constants.AddressZero,
  amount: '1',
  nonce: '0x00',
  pNonce: '0x00',
  data: '0x',
  underwriter: ethers.constants.AddressZero,
  module: ethers.constants.AddressZero
});
*/




var testAddress = '3Pu8uiAF2FvtiBaxDbvxhC2z7GsgDFWqHD';
//transferRequest.toGatewayAddress = () => testAddress;
