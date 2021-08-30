import BigNumber from 'bignumber.js';
const wait = async (ms) => await new Promise((r) => setTimeout(r, ms));
const transferRequest = {
    amount: new BigNumber(10),
    asset: 'BTC',
    data: 'test',
    module: 'any',
    nonce: 1,
    pNonce: 2,
    to: 'test',
    underwriter: 'foo',
};
export { wait, transferRequest };
//# sourceMappingURL=testUtils.js.map