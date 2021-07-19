import { MockPubsub, stringToBuffer } from '../mocks/mockZero';
import PeerId from 'peer-id';
import sinon from 'sinon';
import { expect } from 'chai';
import { wait } from './testUtils';
import { fromBufferToJSON } from '..';

const peerOne = PeerId.createFromHexString('1234');
const peerTwo = PeerId.createFromHexString('5678');
import 'mocha';

describe('MockPubSub', () => {
	afterEach(() => {
		sinon.restore();
	});

	it('Should subscribe to a topic/channel', async () => {
		const instance = new MockPubsub(peerOne);
		const cb = (msg: any) => msg;
		await instance.on('foo', cb);
		await instance.subscribe('foo');
		expect(instance.subscriptions['foo'].callbacks).to.eql([cb]);
	});

	it('should receive messages from subscription', async () => {
		const instanceOne = new MockPubsub(peerOne);
		const instanceTwo = new MockPubsub(peerTwo);
		const spy = (msg: any) => {
			const { data, from } = msg;
			const parsed = fromBufferToJSON(data);
			expect(parsed.foo).to.eql('bar');
			expect(parsed.nested.works).to.eql(true);
		};
		await instanceOne.on('foo', spy);
		await instanceOne.subscribe('foo');
		const payload = {
			foo: 'bar',
			nested: {
				works: true,
			},
		};
		await instanceTwo.publish('foo', stringToBuffer(JSON.stringify(payload)));
		await instanceOne.unsubscribe('foo');
	});

	it('should unsubscribe from channel/topic', async () => {
		const instanceOne = new MockPubsub(peerOne);
		const instanceTwo = new MockPubsub(peerTwo);
		const cb = sinon.spy();
		await instanceOne.on('foo', cb);
		await instanceOne.subscribe('foo');
		await wait(100);
		await instanceOne.unsubscribe('foo');
		await instanceTwo.publish('foo', stringToBuffer('bar'));
		await wait(100);
		expect(cb.called).to.eql(false);
	});
});
