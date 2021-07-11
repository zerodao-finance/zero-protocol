const { expect } = require('chai');
const {ZeroUser, ZeroKeeper} = require('../core')
const {createNode} = require('../node')
const {wait} = require('./testUtils')
let zeroUser;
let zeroKeeper;

describe.only('E2E', () => {
    beforeEach(async () => {
        const connOptions = {multiaddr: '/dns4/localhost/tcp/9090/ws/p2p-webrtc-star/'}
        const connectionOne = await createNode(connOptions)
        const connectionTwo = await createNode(connOptions)
        zeroUser = new ZeroUser(connectionOne)
        zeroKeeper = new ZeroKeeper(connectionTwo)
    })

    afterEach(() => {
        zeroUser = null;
        zeroKeeper = null;
    })

    it('should subscribe to keeper broadcasts', async () => {
        await zeroKeeper.advertiseAsKeeper('0x1234')
        await wait(1000)
        await zeroUser.subscribeKeepers()
        await wait(1000)
        expect(zeroUser.keepers).to.be.an('array').of.length(1)
    })
})