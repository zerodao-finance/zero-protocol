import { expect } from 'chai';
import sinon from 'sinon';
import { ZeroUser, ZeroKeeper, createNode } from '..';
import 'mocha';
import { ZeroConnection } from '../core';
const wait = async (ms: number): Promise<void> => await new Promise((r) => setTimeout(r, ms));

const connOptions = { multiaddr: '/dns4/stomp.dynv6.net/tcp/443/wss/p2p-webrtc-star/' };

describe('subscribeToKeeper', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('should subscribe to keeper broadcasts', async () => {
        const connectionOne = await createNode(connOptions);
        const connectionTwo = await createNode(connOptions);
        const zeroUser = new ZeroUser(connectionOne as ZeroConnection);
        const zeroKeeper = new ZeroKeeper(connectionTwo as ZeroConnection);
        await zeroKeeper.advertiseAsKeeper('0x1234');
        await wait(1000);
        await zeroUser.subscribeKeepers();
        await wait(1000);
        expect(zeroUser.keepers).to.be.an('array').of.length(1);
    });

});
