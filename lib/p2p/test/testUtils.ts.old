import BigNumber from 'bignumber.js';
import { TransferRequest } from '../../types';

const wait = async (ms: number): Promise<void> => await new Promise((r) => setTimeout(r, ms));
const transferRequest: TransferRequest = {
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
