require('./lib/silence-init');
var Zero = require('./');
var { RenJS } = require('@renproject/ren');

var deployments = require('./deployments/deployments');
var {contracts} = deployments[137].matic;
var r = new RenJS('mainnet');
var { getDefaultBitcoinClient } = require('./lib/rpc/btc');
var Client = require('bitcoin-core');
var ethers = require('ethers');
var provider = new ethers.providers.JsonRpcProvider('https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2');
var wallet = new ethers.Wallet(process.env.WALLET).connect(provider);
var getContract = (contract) => {
  return new ethers.Contract(require('./deployments/arbitrum/' + contract).address, require('./deployments/matic/' + contract).abi, wallet);
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
var zero = require('./');
var controller = getContract('ZeroController');
var upgraded = new ethers.Contract(controller.address, [ 'function setGasParameters(uint256, uint256, uint256)' ], wallet);
var vault = getContract('BTCVault');
var trivial = new ethers.Contract(getContract('TrivialUnderwriter').address, [ 'function loan(address, address, uint256, uint256, address, bytes, bytes)', 'function controller() view returns (address)', 'function owner() view returns (address)' ], wallet);
controller = new ethers.Contract(controller.address, [ 'function approveModule(address, bool)', 'function approvedModules(address) view returns (bool)' ], wallet);
var makeKeeper = async () => await zero.createZeroKeeper(await zero.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));

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


var getLock = async () => {
  return new ethers.Contract(await controller.lockFor(trivial.address), require('./artifacts/contracts/underwriter/ZeroUnderwriterLock.sol/ZeroUnderwriterLock').abi, trivial.signer);
};


var testAddress = '3Pu8uiAF2FvtiBaxDbvxhC2z7GsgDFWqHD';
//transferRequest.toGatewayAddress = () => testAddress;
//
var transferRequest = new Zero.TransferRequest(JSON.parse(`{"module":"0x59741D0210Dd24FFfDBa2eEEc9E130A016B8eb3F","to":"0x12fBc372dc2f433392CC6caB29CFBcD5082EF494","underwriter":"0xd0D8fA764352e33F40c66C75B3BC0204DC95973e","asset":"0xDBf31dF14B66535aF65AaC99C32e9eA844e14501","amount":"50000","data":"0x0000000000000000000000000000000000000000000000000000000000000000","nonce":"0xf4df5ab06d4e0689b491861ae8e289133eea8cbfff06eeb46958e5a126c2174b","pNonce":"0xf3c8648dd88a150e68e58e0cb3b2a798b5ee072047356371ff21d54ec9cbdcd6","chainId":42161,"contractAddress":"0x53f38bEA30fE6919e0475Fe57C2629f3D3754d1E","signature":"0x2730dae801320403d10dca560d115d6d6324ed0f331df9b720d892e4949ea7cf64dd17cb1ddbb5c84c2afb3eddf7b388491fca3fc93216124296a8f276266eec1c","_ren":{"utils":{},"_config":{"loadCompletedDeposits":true,"logger":{"level":0}},"_logger":{"level":0},"renVM":{"network":{"name":"mainnet","lightnode":"https://lightnode-mainnet.herokuapp.com","isTestnet":false},"v1":{"network":{"name":"mainnet","lightnode":"https://lightnode-mainnet.herokuapp.com","isTestnet":false},"logger":{"level":0},"provider":{"logger":{"level":0},"nodeURL":"https://lightnode-mainnet.herokuapp.com"}},"v2":{"network":{"name":"mainnet","lightnode":"https://lightnode-mainnet.herokuapp.com","isTestnet":false},"logger":{"level":0},"provider":{"logger":{"level":0},"nodeURL":"https://lightnode-mainnet.herokuapp.com"}}}},"_contractFn":"zeroCall","_contractParams":[{"name":"to","type":"address","value":"0x12fBc372dc2f433392CC6caB29CFBcD5082EF494"},{"name":"pNonce","type":"uint256","value":"0xf3c8648dd88a150e68e58e0cb3b2a798b5ee072047356371ff21d54ec9cbdcd6"},{"name":"module","type":"address","value":"0x59741D0210D4FFfDBa2eEEc9E130A016B8eb3F"},{"name":"data","type":"bytes","value":"0x0000000000000000000000000000000000000000000000000000000000000000"}],"status":"pending"}`));
