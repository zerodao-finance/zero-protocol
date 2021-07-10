'use strict';
const libp2p = require('libp2p')
const createLogger = require('../logger')
const {MockZeroConnection} = require('./utils')
class ZeroConnection extends libp2p {  }


class ZeroUser {
  constructor(connection) {
    this.conn = connection;
    this.keepers = [];
    this.log = createLogger('zero.user')
  }

  async subscribeKeepers() {
    this.conn.pubsub.subscribe('zero.keepers', async ({msg, peerInfo}) => {
      const {peerId} = peerInfo
      try {
        const peer = await this.conn.peerRouting.findPeer(peerId);
        this.keepers.push(peerId)
        this.log.debug(`Keeper Details: `, {
          peer
        })
        this.log.info(`Found keeper: ${peerInfo}`)
      } catch (e) {
        this.log.error(`Timed out finding keeper: ${peerId}`)
      }      
    })
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
      await this.conn.handle('/zero/user/confirmation', async ({ txConfirmation }) => {
        ackReceived = true;
        this.log.info(`txDispatch confirmed: ${txConfirmation}`)
      })
      for(const keeper of this.keepers) {
        if(ackReceived !== true) {
          try {
            await this.conn.dialProtocol(keeper, '/zero/keeper/dispatch', Uint8Array.from(transferRequest))
          } catch (e) {
            this.log.error(`Failed dialing keeper: ${keeper} for txDispatch`)
            this.log.debug(e.message)
          }
        } else {
          break;
        }
      }
      this.log.info('Published transfer request. Waiting for keeper confirmation.')
    } catch (e) {
      this.log.error('Could not publish transfer request')
      this.log.debug(e.message)
      return;
    }
  }
}
class ZeroKeeper {}

module.exports = {
  ZeroKeeper,
  ZeroUser,
  ZeroConnection,
  MockZeroConnection,
}
