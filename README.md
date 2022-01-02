# zero-protocol

Project repository for the complete zeroDAO software library and production contracts.

## Usage

In a frontend application this library can be used to initialize a connection to the libp2p network consisting of zeroDAO keepers and users. To run a cross-chain script, it is necessary to construct a `ZeroUser` instance, connect it to libp2p, then publish signed `TransferRequest` objects using its API. A TransferRequest is meant to be extended depending on the API of the underwriter contract that is meant to forward it. It is acceptable to use the TrivialUnderwriter contract provided with this repository to initialize an underwriter that delegates keeper permission to its owner, and has no special behavior. The SDK includes a `TrivialUnderwriterTransferRequest` subclass of the `TransferRequest` class which exposes `loan(signer)` `repay(signer)` and `fallbackMint(signer)` async methods to be used by an instance of `ZeroKeeper`

The complete API specification is a WIP.

### ZeroUser

`async ZeroUser#conn.start()`

Connects to libp2p. Must be called to begin discovering keepers or publishing.

(Will be deprecated in future releases -- Deprecation will not be a breaking change)

Example: 

```js
import { createZeroUser, createZeroConnection } from "zero-protocol/dist/lib/zero";
const zeroUser = createZeroUser(await createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));
await zeroUser.conn.start();
```


`async function ZeroUser#subscribeKeepers()`

Begins listening for keepers to be discovered on the libp2p socket.

Example:

```js

zeroUser.subscribeKeepers();
zeroUser.on('keeper', (address) => { console.log('keeper discovered with address ' + address) });

```



`async function ZeroUser#publishTransferRequest(transferRequest)`


Publishes a TransferRequest object. Ensure that you have called `await transferRequest.sign(signer)`

```js

await zeroUser.publishTransferRequest(transferRequest)

```



### TransferRequest


A TransferRequest object is the primary object through which the client will script asset transfers.

`TransferRequest.prototype.constructor`

```js

import deployments from 'zero-protocol/deployments/deployments';

const CHAIN_ID = 42161; // Arbitrum
const NETWORK_NAME = 'arbitrum';
const IS_TESTNET = false;

const transferRequest = new TransferRequest({
  amount: ethers.utils.parseUnits('0.0015', 8), // transfer 0.0015 BTC
  asset: RENBTC_ADDRESS, // can be any RenVM asset, not just renBTC
  module: deployments[CHAIN_ID][NETWORK_NAME].contracts.ArbitrumConvert.address, // use the ArbitrumConvert module from zero-protocol/contracts/modules/ArbitrumConvert.sol
  nonce: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
  pNonce: ethers.utils.hexlify(ethers.utils.randomBytes(32)), // nonce and pNonce must be unique every time, there is no special meaning to them,
  data: '0x' // arbitrary data passed as an argument to the module
});

const mint = await transferRequest.submitToRenVM(IS_TESTNET); // returns the same object returned by ren-js lockAndMint, no side effects if both keeper and user submit
console.log(mint.depositAddress); // logs the BTC address to which someone must send the EXACT BTC specified in the TransferRequest
const deposit = await new Promise((resolve) => mint.on('deposit', resolve));


const confirmed = await deposit.confirmed();
confirmed.on('deposit', (currentConfirmations, totalNeeded) => {
  console.log(currentConfirmations + '/' + totalNeeded + ' confirmations seen');
});

const signed = await deposit.signed();
signed.on('status', (status) => {
  if (status === 'signed') console.log('RenVM has produced signature');
});


```


`function TransferRequest#fallbackMint(signer)`

Use this function only if a keeper has not successfully initiated a loan associated with the TransferRequest but confirmations have been seen by RenVM and there is a signature. The user who signed the TransferRequest will receive RenBTC and no scripting will occur.

Example:

```js

await transferRequest.fallbackMint(signer);


```


### Development Environment

For development, you can construct a mock keeper with fixtures provided in the SDK and it will not require an active libp2p connection. A helper function to mutate the runtime environment hosting the zeroDAO SDK is provided and will overwrite the prototype methods of the ZeroUser and TransferRequest classes so a ZeroUser will always communicate publishTransferRequest calls to all mock keepers in the environment, instead of publishing to libp2p. TransferRequest methods are overridden to simulate a rapidly confirming cross-chain transfer, without needing to send live funds.

Currently supported networks are Polygon and Arbitrum.


To use these mocks, it is necessary to first run either

```shell

yarn node:arbitrum

```

Or

```shell

yarn node:polygon

```

Depending on the network you are targeting.

This will initialize a hardhat node on http://localhost:8545 with overrides in the hardhat VM that will mock RenVM gateway contracts in the forked network.

In the client application, to enable mocks you use the code

```js

import { createMockKeeper, enableGlobalMockRuntime } from "zero-protocol/lib/mock";

await createMockKeeper();
await enableGlobalMockRuntime()

```
