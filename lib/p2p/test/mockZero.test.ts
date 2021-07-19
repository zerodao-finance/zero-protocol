import { expect } from 'chai';
import sinon from 'sinon';
import { ZeroKeeper, ZeroUser, MockZeroConnection, fromJSONtoBuffer } from '..';
import { wait, transferRequest } from './testUtils';
import pipe from 'it-pipe';
import lp from 'it-length-prefixed';
import 'mocha';

let mock: MockZeroConnection;

describe('MockZeroConnection', () => {
	beforeEach(() => {
		mock = new MockZeroConnection();
	});

	afterEach(() => {
		sinon.restore();
		mock = null;
	});

	it('should initialize', () => {
		expect(mock.peerId).to.not.be.undefined;
		expect(mock.pubsub).to.not.be.undefined;
		expect(mock.peerRouting).to.not.be.undefined;
	});

	it('should be able to mock libp2p.handle', async () => {
		const spy = sinon.spy();
		await mock.handle('/foo', spy);
		await mock.pubsub.publish(`test/p2p/${mock.peerId.toB58String()}`, fromJSONtoBuffer({ foo: 'bar' }));
		await wait(10);
		expect(spy.calledOnce).to.eql(true);
		mock.destroy();
	});

	it('should be able to mock libp2p.dialProtocol', async () => {
		const spy = sinon.spy();
		const mock2 = new MockZeroConnection();
		await mock2.handle('/foo', spy);
		const { stream } = await mock.dialProtocol(`test/p2p/${mock2.peerId.toB58String()}`, '/foo');
		pipe(JSON.stringify({ foo: 'bar' }), lp.encode(), stream.sink);
		await wait(100);
		expect(spy.calledOnce).to.eql(true);
		mock.destroy();
		mock2.destroy();
	});

	it('should initialize a user', async () => {
		const user = new ZeroUser(mock);
		expect(user.keepers).to.be.an('array').of.length(0);
		expect(user.log).to.not.be.undefined;
	});

	it('should allow user to subscribe to new keepers', async () => {
		const user = new ZeroUser(new MockZeroConnection());
		const keeper = new ZeroKeeper(new MockZeroConnection());

		await keeper.advertiseAsKeeper('0x12345');
		await wait(10);
		await user.subscribeKeepers();
		await wait(1000);
		expect(user.keepers).to.be.an('array').of.length(1);
		expect(user.keepers).to.eql([keeper.conn.peerId.toB58String()]);
		keeper.destroy();
	});

	it('should allow users to unsubscribe to keepers', async () => {
		const user = new ZeroUser(new MockZeroConnection());
		const keeper = new ZeroKeeper(new MockZeroConnection());
		const keeper2 = new ZeroKeeper(new MockZeroConnection());
		await keeper.advertiseAsKeeper('0x12345');
		await wait(10);
		await user.subscribeKeepers();
		await wait(500);
		await user.unsubscribeKeepers();
		await wait(250);
		await keeper2.advertiseAsKeeper('0x56789');

		expect(user.keepers).to.be.an('array').of.length(0);
		expect(user.keepers).to.not.include(keeper2.conn.peerId.toB58String());
		keeper.destroy();
		keeper2.destroy();
	});

	it('should publish a tx dispatch request', async () => {
		const user = new ZeroUser(new MockZeroConnection());
		const keeper = new ZeroKeeper(new MockZeroConnection());

		const spy = sinon.spy();
		await keeper.setTxDispatcher(spy);
		await keeper.advertiseAsKeeper('0x12345');

		await wait(500);
		await user.subscribeKeepers();
		await wait(500);
		await user.publishTransferRequest(transferRequest);
		await wait(500);
		expect(spy.calledOnce).to.eql(true);
	});
});
