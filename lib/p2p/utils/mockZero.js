const Redis = require('ioredis-mock')
const PeerInfo = require('peer-info');
const redis = new Redis();

class MockPubsub {
    constructor(peerId) {
        this.subscriptions = new Map();
        this.peerId = peerId
    }

    async publish(channel, msg) {
        return redis.publish(channel, JSON.stringify({msg, peerInfo: {peerId: this.peerId}}))
    }

    async subscribe(channel, callback) {
            const subClient = redis.createConnectedClient()
            subClient.on('message', (c, msg) => {
                const cbArray = this.subscriptions.get(c)
                if(c === channel) cbArray.forEach(callback(JSON.parse(msg)))
            })
            await subClient.psubscribe(channel)
            this.subscriptions.set(channel, subClient)
    }

    async unsubscribe(channel) {
        const subClient = this.subscriptions.get(channel)
        if(subClient) {
            subClient.punsubscribe()
        } else throw new Error('Never subscribed to this channel')
    }
}

class MockZeroConnection {
    constructor() { 
      PeerInfo.create().then((pId) => this.peerId = pId)
      this.pubsub = new MockPubsub(this.peerId);
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
        await this.pubsub.subscribe(protocol, callback)
    }

    async dialProtocol(peerId, protocol, payload) {
        await this.pubsub.publish(protocol+peerId, payload)
    }
}

module.exports = {
    MockZeroConnection
}