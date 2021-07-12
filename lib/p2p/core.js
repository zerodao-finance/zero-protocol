'use strict';
const libp2p = require('libp2p')
const createLogger = require('../logger')
const {MockZeroConnection} = require('./mocks');
const { bufferToString, stringToBuffer, fromJSONtoBuffer, fromBufferToJSON } = require('./util');
const pipe = require('it-pipe')
const lp = require('it-length-prefixed')
class ZeroConnection extends libp2p {  }


class ZeroUser {
  constructor(connection) {
    this.conn = connection;
    this.keepers = [];
    this.log = createLogger('zero.user')
  }

  async subscribeKeepers() {
    this.conn.pubsub.on('zero.keepers', async (message) => {
      const {data, from} = message
      const {address} = fromBufferToJSON(data)
      if(!this.keepers.includes(from)) {
        try {
          this.keepers.push(from)
          this.log.debug(`Keeper Details: `, {
            from
          })
          this.log.info(`Found keeper: ${from} with address ${address}`)
        } catch (e) {
          this.log.error(`Timed out finding keeper: ${from}`)
          this.log.debug(e.message)
        }
      }
    })
    this.conn.pubsub.subscribe('zero.keepers')
    this.log.info('Subscribed to keeper broadcasts')
  }

  async unsubscribeKeepers() {
    this.log.debug('Keepers before unsubscription', this.keepers)
    try {
      await this.conn.pubsub.unsubscribe('zero.keepers')
    } catch (e) {
      this.log.error('Could not unsubscribe to keeper broadcasts')
      this.log.debug(e.message)
    }

    this.log.info('Unsubscribed to keeper broadcasts')
    this.keepers = []
  }

  async publishTransferRequest(transferRequest) {
    if(this.keepers.length === 0) {
      this.log.error('Cannot publish transfer request if no keepers are found')
      return;
    }
    try {
      let ackReceived = false;
      await this.conn.handle('/zero/user/confirmation', async ({stream}) => {
        pipe(stream.source, lp.decode(), async function(rawData) {
          let string = []
          for await (const msg of rawData) {
            string.push(msg.toString())
          }
          const {txConfirmation} = JSON.parse(string.join(''))
          ackReceived = true;
          this.log.info(`txDispatch confirmed: ${txConfirmation}`)
        })
      })
      for(const keeper of this.keepers) {
        if(ackReceived !== true) {
          try {
            const signallingServer = this.conn.transportManager.getAddrs()[0];
            const peerAddr = `${signallingServer}/p2p/${keeper}`
            const {stream} = await this.conn.dialProtocol(peerAddr, '/zero/keeper/dispatch')
            pipe(JSON.stringify(transferRequest), lp.encode(), stream.sink)
            this.log.info(`Published transfer request to ${keeper}. Waiting for keeper confirmation.`)
          } catch (e) {
            this.log.error(`Failed dialing keeper: ${keeper} for txDispatch`)
            this.log.debug(e.message)
          }
        } else {
          break;
        }
      }
    } catch (e) {
      this.log.error('Could not publish transfer request')
      this.log.debug(e.message)
      return;
    }
  }
}

class ZeroKeeper {
  constructor(connection) {
    this.conn = connection;
    this.dispatches = [];
    this.log = createLogger('zero.keeper')
  }

  async advertiseAsKeeper(address) {
    this.active = setInterval(async () => {
      try {
        await this.conn.pubsub.publish('zero.keepers', fromJSONtoBuffer(
          {
            address,
          }
        ))
        this.log.debug(`Made presence known ${this.conn.peerId.toB58String()}`)
      } catch (e) {
        console.debug(e)
        this.log.info('Could not make presence known. Retrying in 1s')
        this.log.debug(e.message)
      }
    }, 1000);
    this.log.info('Started to listen for tx dispatch requests')
  }

  async setTxDispatcher(callback) {
    const handler = ({connection, stream}) => {
      pipe(stream.source, lp.decode(), async function(rawData) {
        // TODO: match handle and dialProtocol spec
        if(process?.env.NODE_ENV === 'test') {
          callback(fromBufferToJSON(stream.source))
          return;
        }
        let string = []
        for await (const msg of rawData) {
          string.push(msg.toString())
        }
        callback(JSON.parse(string.join('')))
      })
    }
    await this.conn.handle('/zero/keeper/dispatch', handler)
    this.log.info('Set the tx dispatcher')
  }

  destroy() {
    clearTimeout(this.active)
  }
}

module.exports = {
  ZeroKeeper,
  ZeroUser,
  ZeroConnection,
  MockZeroConnection,
}
