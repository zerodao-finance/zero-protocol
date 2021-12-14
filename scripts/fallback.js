'use strict';

const zero = require('../lib/zero');

(async () => {
  const wallet = new ethers.Wallet(process.env.WALLET, new ethers.providers.JsonRpcProvider(process.env.JSONRPC_URI || 'https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2'));
  const transferRequest = new zero.TrivialUnderwriterTransferRequest(JSON.parse(`{"module":"0x59741D0210Dd24FFfDBa2eEEc9E130A016B8eb3F","to":"0xC6ccaC065fCcA640F44289886Ce7861D9A527F9E","underwriter":"0xd0D8fA764352e33F40c66C75B3BC0204DC95973e","asset":"0xDBf31dF14B66535aF65AaC99C32e9eA844e14501","amount":"0x061a80","data":"0x0000000000000000000000000000000000000000000000000000000000000000","nonce":"0x451864533b79a3515a668360a274fcd8fb4a5cb39f80e2f5e3f9fd725f3e6b68","pNonce":"0x22191a85daace2b2bdc97aca44e92cc505e65522a56238f6610e80ab9aa5e30d","chainId":42161,"contractAddress":"0x53f38bEA30fE6919e0475Fe57C2629f3D3754d1E","signature":"0xe176c0114387659e19aa365ecc6b307f28765cdfe6fd1608a9997a00982bf7631e8729af954b713ca06baac07c51364c61551ca44cf3182ac5670dd0915f91401c"}`));
  transferRequest.setProvider(wallet.provider);
  const tx = await transferRequest.fallbackMint(wallet);
  console.log('waiting');
  console.log(await tx.wait());
})().catch((err) => console.error(err));
