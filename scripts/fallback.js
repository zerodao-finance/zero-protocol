'use strict';

const zero = require('../lib/zero');

(async () => {
  const wallet = new ethers.Wallet(process.env.FALLBACK_WALLET, new ethers.providers.JsonRpcProvider(process.env.JSONRPC_URI));
  const transferRequest = new zero.TrivialUnderwriterTransferRequest(JSON.parse(`{"module":"0x59741D0210Dd24FFfDBa2eEEc9E130A016B8eb3F","to":"0xD903338baE3D5C59259E562a49E4ab177E3149a1","underwriter":"0xd0D8fA764352e33F40c66C75B3BC0204DC95973e","asset":"0xDBf31dF14B66535aF65AaC99C32e9eA844e14501","amount":"0x07a120","data":"0x0000000000000000000000000000000000000000000000000000000000000000","nonce":"0x9612aa2b9a3349c9cf1f74645411b6abbad2b381dd4d14a586bb75aa1e3e7d7f","pNonce":"0x58382794eee1dfa33bbe81b953f540769d66761edc701ec4019da3ca87e7983f","chainId":42161,"contractAddress":"0x53f38bEA30fE6919e0475Fe57C2629f3D3754d1E","signature":"0x005629b06117d9b8ab6dfc9f775e96d11e02add8467473e3907ebc8cc7784b9d5e390637665278ef0d8c76342ec0eead5d5e3446e03bbf9f3f7ffbdfd242ca131b"}`));
  const tx = await transferRequest.fallbackMint(wallet);
  console.log('waiting');
  console.log(await tx.wait());
})().catch((err) => console.error(err));
