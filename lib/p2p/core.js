'use strict';
const libp2p = require('libp2p')
const createLogger = require('../logger')

class ZeroConnection extends libp2p {  }
class MockZeroConnection {

}

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
  }

  async unsubscribeKeepers() {
    this.log.debug('Keepers before unsubscription', this.keepers)
    this.conn.pubsub.unsubscribe('zero.keepers')
    this.log.info('Unsubscribed to keeper broadcasts')
    this.keepers = []
  }

  async publishTransferRequest(transferRequest) {
    if(this.keepers.length === 0) {
      this.log.error('Cannot publish transfer request if no keepers are found')
      return;
    }
    try {
      await this.conn.pubsub.publish('zero.keepers.new_transfer', Uint8Array.from(transferRequest))
      this.log.info('Published transfer request. Waiting for keeper confirmation.')
      this.conn.pubsub.subscribe('zero.keepers.dispatch_transfer', ({msg, peerId}) => {
        // todo: check msg interface
        if(msg.uuid === transferRequest.uuid) {
          this.log.info(`Transaction successfully dispatched. txId: ${msg.txId}, keeperId: ${peerId}`)
        } 
      })
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
  ZeroUser
}
