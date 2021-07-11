const Redis = require('ioredis-mock')
const PeerId = require('peer-id');
const redis = new Redis();

const genHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

class MockPubsub {
    constructor(peerId) {
        this.subscriptions = new Map();
        this.peerId = peerId
    }

    async publish(channel, msg) {
        const stringmessage = msg.toString()
        return redis.publish(channel, JSON.stringify({msg: stringmessage, peerInfo: {peerId: this.peerId.toB58String()}}))
    }

    async subscribe(channel, callback) {
            const subClient = redis.createConnectedClient()
            subClient.on('message', (c, msg) => {
                if(c === channel) callback(JSON.parse(msg))
            })
            await subClient.subscribe(channel)
            this.subscriptions.set(channel, subClient)
    }

    async unsubscribe(channel) {
        const subClient = this.subscriptions.get(channel)
        if(subClient) {
            subClient.unsubscribe()
        } else throw new Error('Never subscribed to this channel')
    }
}

class MockZeroConnection {
    constructor() {
      this.peerId = PeerId.createFromHexString(genHex(68))
      this.pubsub = new MockPubsub(this.peerId);
      redis.data.set(this.peerId.toB58String(), 'true')
      this.peerRouting = {
          findPeer: async function (id) {
              const exists = await redis.get(id)
              if(exists) {
                  return id
              } else throw new Error('Invalid keeper dial')
          }
      }
    }

    async handle(protocol, callback) {
        await this.pubsub.subscribe(`${protocol}/${this.peerId.toB58String()}`, callback)
    }

    async dialProtocol(peerId, protocol, payload) {
        await this.pubsub.publish(`${protocol}/${peerId}`, payload)
    }
}

module.exports = {
    MockZeroConnection,
    redis
}