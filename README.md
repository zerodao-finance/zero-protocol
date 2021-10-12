# zero-protocol

Project repo for the zeroDAO project, implementing short term lending on Ethereum as a framework for cross-chain asset transfer.

## Install

```js
yarn add zero-protocol
```

## Usage

```js

const { createZeroUser, TransferRequest } = require('zero-protocol');
const { ethers } = require('ethers');

const user = await createZeroUser();

await user.subscribeKeepers()

const request = TransferRequest({
  asset: RENBTC_ADDRESS,
  amount: ethers.utils.parseUnits('1', 8),
  nonce: ethers.utils.hexlify(ethers.utils.randomBytes(32)), // this nonce never gets published on chain,
  pNonce: ethers.utils.hexlify(ethers.utils.randomBytes(32)), // this nonce is public
  module: MODULE_ADDRESS, // use Swap.sol deployment to swap BTC to another asset on transfer
  data: '0x' // arguments to module
});

await request.sign(new ethers.Wallet(PRIVATE_KEY)); // assigns a property "signature" to the TransferRequest instance, using EIP712 to derive digest

user.publishTransferRequest(request); // publishes to libp2p

```

As a keeper/underwriter

```js

const { createZeroKeeper, TransferRequest } = require('zero-protocol');
const { ethers } = require('ethers');
const { getDefaultBitcoinClient } = require('zero-protocol/dist/lib/rpc/btc');

const keeper = await createZeroKeeper();

await keeper.advertiseAsKeeper() // begin emitting pubsub messages to libp2p

keeper.setTxDispatcher((transferRequest) => {
  await transferRequest.pollForFromTx(); // when a BTC deposit is made, the TransferRequest is mutated to mark it as safe to dispatch
  await underwriter.loan(transferRequest); // replace with your Underwriter implementation, see TrivialUnderwriter.sol
  const txHash = await transferRequest.submitToRenVM();
  const signature = await transferRequest.waitForSignature(); // takes 6 confirmations on "from" chain
  await underwriter.repay(transferRequest, signature); // loan is repaid, underwriter is credited
});

```

## Signaling Server

#### Start the Dev Signaling Server

Requirements: `docker-compose`

1. `make start_signal_server`


#### Stop the Dev Signaling Server

1. `make stop_signal_server`
