const {MockZeroConnection, redis} = require('../utils/mockZero')
const {expect} = require('chai');
const sinon = require('sinon');
const { ZeroUser, ZeroKeeper } = require('../core');

const wait = async (ms) => await new Promise(r => setTimeout(r, ms));

let mock;
describe('MockZeroConnection', () => {
    beforeEach(()=> {
        mock = new MockZeroConnection()
    })

    it('should initialize', () => {
        expect(mock.peerId).to.not.be.undefined
        expect(mock.pubsub).to.not.be.undefined
        expect(mock.peerRouting).to.not.be.undefined
    })

    it('should be able to mock libp2p.handle', async () => {
        const spy = sinon.spy();
        await mock.handle('/foo', spy)
        await mock.pubsub.publish(`/foo/${mock.peerId.toB58String()}`, 'foo')
        await wait(10)
        expect(spy.calledOnce).to.eql(true)
    })

    it('should be able to mock libp2p.dialProtocol', async () => {
        const spy = sinon.spy()
        const mock2 = new MockZeroConnection()
        await mock2.handle('/foo', spy)
        await mock.dialProtocol(mock2.peerId.toB58String(), '/foo', 'foo')
        await wait(10)
        expect(spy.calledOnce).to.eql(true)
    })

    it('should initialize a user', async () => {
        const user = new ZeroUser(mock)
        expect(user.keepers).to.be.an('array').of.length(0)
        expect(user.log).to.not.be.undefined
    })

    it('should allow user to subscribe to new keepers', async () => {
        const user = new ZeroUser(new MockZeroConnection())
        const keeper = new ZeroKeeper(new MockZeroConnection())

        await keeper.advertiseAsKeeper('0x12345')
        await wait(10)
        await user.subscribeKeepers()
        await wait(1000)
        expect(user.keepers).to.be.an('array').of.length(1)
        expect(user.keepers).to.eql([keeper.conn.peerId.toB58String()])
    })

    it('should allow users to unsubscribe to keepers', async () => {
        const user = new ZeroUser(new MockZeroConnection())
        const keeper = new ZeroKeeper(new MockZeroConnection())
        const keeper2 = new ZeroKeeper(new MockZeroConnection())
        await keeper.advertiseAsKeeper('0x12345')
        await wait(10)
        await user.subscribeKeepers()
        await wait(500)
        await user.unsubscribeKeepers()
        await wait(250)
        await keeper2.advertiseAsKeeper('0x56789')

        expect(user.keepers).to.be.an('array').of.length(0)
        expect(user.keepers).to.not.include(keeper2.conn.peerId.toB58String())
    })
})