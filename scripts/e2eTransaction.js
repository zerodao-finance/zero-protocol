var sdk = require('../');
var TransferRequest = require('../dist/lib/zero').default;

var makeZeroUser = async () => sdk.createZeroUser(await sdk.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));

const main = async () => {
    const user = await makeZeroUser();
    await user.conn.start();
    await user.subscribeKeepers();

    const transferRequest = new TransferRequest(
        '0x7015e79E82A8CBA16f70559747191F177B0B6b0A',
        '0x',
        '0x',
        '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501',
        String(1e16),
        '0x',
    );
    user.conn.on('peer:discovery', async () => await user.publishTransferRequest(transferRequest));
}

main()