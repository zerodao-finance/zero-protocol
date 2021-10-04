var sdk = require('../');
var TransferRequest = require('../dist/lib/zero').default;
const controllerABI = require('../artifacts/contracts/controllers/ZeroController.sol/ZeroController.json');
import { Contract } from 'ethers';

// Constants
TRIVIAL_UNDERWRITER_ADDRESS = '0x7771db3eC689378272E8647Cd3201610FF684c40'

var makeUser = async () => {
    const user = sdk.createZeroUser(await sdk.createZeroConnection('/dns4/lourdehaufen.dynv6.net/tcp/443/wss/p2p-webrtc-star/'));
    await user.conn.start();
    await user.subscribeKeepers();
    return user;
}

const getUnderwriterImpl = async (signer) => {
    return new Contract(TRIVIAL_UNDERWRITER_ADDRESS, controllerABI, signer);
}

const main = async () => {
    const user = await makeUser();

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

const signLoan = async (msg) => {
    console.log(msg)
}

main()