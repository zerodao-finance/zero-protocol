import { expect } from 'chai';
import sinon from 'sinon';
import { ZeroUser, ZeroKeeper, createNode } from '..';
import { wait } from './testUtils';
import 'mocha';

let zeroUser;
let zeroKeeper;

describe.skip('E2E', () => {
	beforeEach(async () => {
		const connOptions = { multiaddr: '/dns4/localhost/tcp/9090/ws/p2p-webrtc-star/' };
		const connectionOne = await createNode(connOptions);
		const connectionTwo = await createNode(connOptions);
		zeroUser = new ZeroUser(connectionOne);
		zeroKeeper = new ZeroKeeper(connectionTwo);
	});

	afterEach(() => {
		zeroUser = null;
		zeroKeeper = null;
		sinon.restore();
	});

	it.skip('should subscribe to keeper broadcasts', async () => {
		await zeroKeeper.advertiseAsKeeper('0x1234');
		await wait(1000);
		await zeroUser.subscribeKeepers();
		await wait(1000);
		expect(zeroUser.keepers).to.be.an('array').of.length(1);
	});

	it('should publish a transfer request', async () => {
		await zeroKeeper.advertiseAsKeeper('0x1234');
		await wait(1000);
		await zeroUser.subscribeKeepers();
		await wait(1000);

		const spy = (foo) => expect(foo.foo).to.eql('bar');
		await zeroKeeper.setTxDispatcher(spy);
		await wait(1000);
		await zeroUser.publishTransferRequest({ foo: 'bar' });
		await wait(500);
	});
});
