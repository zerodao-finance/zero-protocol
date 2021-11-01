
var { RenJS } = require('@renproject/ren');

var r = new RenJS('mainnet');
var { getDefaultBitcoinClient } = require('./lib/rpc/btc');
var Client = require('bitcoin-core');
var ethers = require('ethers');
var provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/8_zmSL_WeJCxMIWGNugMkRgphmOCftMm");
var wallet = new ethers.Wallet(process.env.WALLET).connect(provider);
var renVMStrategy = new ethers.Contract('0xc8E5aEd8eF691FcA4BFEFD6b57Faf91dD13E1761', [ 'function want() view returns (uint256)', 'function balanceOf() external view returns (uint256)', 'function controller() view returns (address)', 'function withdrawAll()', 'function want() view returns (address) '], wallet);
var dummy = new ethers.Contract('0x8494edba025c79C1e7771557701c96b3c90073cC', [ 'function balanceOf(address) view returns (uint256)'], wallet);
var renbtc = new ethers.Contract('0xDBf31dF14B66535aF65AaC99C32e9eA844e14501', [ 'function balanceOf(address) view returns (uint256)' ], wallet);
var controller = new ethers.Contract('0x45ADA688563bF68F3a03DB1F2FCe6DB8ECDd02da', [ 'function governance() view returns (address)', 'function inCaseTokensGetStuck(address, uint256)', 'function withdrawAll(address)' ], wallet);
var vault = new ethers.Contract('0xCc04A6517ffF3f6E858A37C135823c346768f55A', [ 'function balanceOf(address) view returns (uint256)' ], wallet);
var trivial = new ethers.Contract('0x6aDAA06DB0B37AeCc90e3713E103877c8Dc2f0b3', [ 'function owner() view returns (address)' ], wallet);
//var makeKeeper = async () => await zero.createZeroKeeper(await zero.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));
/*
var makeUser = async () => await zero.createZeroUser(await zero.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));
var peerId = require('peer-id');

var peerInfo = require('peer-info');
var f = async () => {
  const user = await makeUser();
  await user.conn.start();
  await user.publishTransferRequest({});
  return user;
};

var btc = getDefaultBitcoinClient();

var { TransferRequest } = zero;
var ethers = require('ethers');
var wallet = ethers.Wallet.createRandom();

var connectToMainnet = function (signer) {
  wallet = wallet.connect(new ethers.providers.InfuraProvider('mainnet'));
};

connectToMainnet();

var transferRequest = new TransferRequest({
  asset: ethers.constants.AddressZero,
  amount: '1',
  nonce: '0x00',
  pNonce: '0x00',
  data: '0x',
  underwriter: ethers.constants.AddressZero,
  module: ethers.constants.AddressZero
});




var testAddress = '3Pu8uiAF2FvtiBaxDbvxhC2z7GsgDFWqHD';
transferRequest.toGatewayAddress = () => testAddress;
*/
