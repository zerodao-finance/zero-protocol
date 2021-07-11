const Redis = require('ioredis-mock')
const PeerId = require('peer-id');
const redis = new Redis();

const genHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

class MockPubsub {
    constructor(peerId) {
        this.subscriptions = {};
        this.peerId = peerId
    }

    on(channel, callback) {
        if(this.subscriptions[channel]) {
            this.subscriptions[channel] = [...this.subscriptions[channel], callback]
        } else {
            this.subscriptions[channel] = [callback]
        }
    }

    async publish(channel, msg) {
        const stringmessage = msg.toString()
        return redis.publish(channel, JSON.stringify({msg: stringmessage, peerInfo: {peerId: this.peerId.toB58String()}}))
    }

    async subscribe(channel) {
            const subClient = redis.createConnectedClient()
            if(!this.subscriptions[channel]) {
                throw new Error('Cannot subscribe to channel with no handlers')
            }
            subClient.on('message', (c, msg) => {
                if(c === channel) {
                    this.subscriptions[channel].forEach((cb) => cb(msg))
                }
            })
            await subClient.subscribe(channel)
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
        const channel = `${protocol}/${this.peerId.toB58String()}`
        await this.pubsub.on(channel, callback)
        await this.pubsub.subscribe(channel)
    }

    async dialProtocol(peerId, protocol, payload) {
        await this.pubsub.publish(`${protocol}/${peerId}`, payload)
    }
}

module.exports = {
    MockZeroConnection,
    redis
}