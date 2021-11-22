
var Zero = require('./');
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
  return new ethers.Contract(require('./deployments/matic/' + contract).address, require('./deployments/matic/' + contract).abi, wallet);
};
var renVMStrategy = getContract('StrategyRenVM');
var dummy = getContract('DummyVault');
var renbtc = new ethers.Contract('0xDBf31dF14B66535aF65AaC99C32e9eA844e14501', [
  'function approve(address, uint256) returns (bool)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address, uint256) returns (bool)'
], wallet);
var usdc = new ethers.Contract('0x2791bca1f2de4661ed88a30c99a7a9449aa84174', [ 'function transfer(address, uint256)', 'function balanceOf(address) view returns (uint256)' ], wallet);
var wbtc = new ethers.Contract('0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', [ 'function transfer(address, uint256)', 'function balanceOf(address) view returns (uint256)' ], wallet);
var controller = getContract('ZeroController');
var vault = getContract('BTCVault');
var trivial = getContract('TrivialUnderwriter');
controller = new ethers.Contract(controller.address, [ 'function setFee(uint256)', 'function setBaseFeeByAsset(address, uint256)' ], wallet);
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
