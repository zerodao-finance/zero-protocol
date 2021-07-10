'use strict';
const libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const WebsocketStar = require('libp2p-websocket-star')
const WS = require('libp2p-websockets')
const Mplex = require('libp2p-mplex')
const SPDY = require('libp2p-spdy')
const SECIO = require('libp2p-secio')
const Bootstrap = require('libp2p-bootstrap')
const KadDHT = require('libp2p-kad-dht')
const bluebird = require('bluebird');
const PeerInfo = require('peer-info');
const GossipSub = require('libp2p-gossipsub');
const pull = require('pull-stream');
const EventEmitter = require('events').EventEmitter;
const WStar = require('libp2p-webrtc-star');
const returnOp = (v) => v;

const { jsonBuffer, tryParse, tryStringify } = require('./util');

const presets = {
  lendnet: '/dns4/lendnet.0confirmation.com/tcp/443/wss/p2p-webrtc-star/',
  zeronet: '/dns4/zeronet.0confirmation.com/tcp/443/wss/p2p-webrtc-star/'
};

const fromPresetOrMultiAddr = (multiaddr) => presets[multiaddr] || multiaddr;

const wrtc = require('wrtc');

module.exports = {
  createNode: async (options, wrtc) => {
    const peerInfo = options.peerInfo || await PeerInfo.create();
    const bootstrapNode = fromPresetOrMultiAddr(options.multiaddr);
    peerInfo.multiaddrs.add(bootstrapNode);
    const dhtEnable = typeof options.dht === 'undefined' || options.dht === true;
    const socket = await libp2p.create({
      peerInfo,
      modules: {
        transport: [ TCP, WS, WStar ],
        streamMuxer: [ Mplex ],
        connEncryption: [ SECIO ],
        pubsub: GossipSub,
        peerDiscovery: [ Bootstrap, PubSubPeerDiscovery ],
        dht: dhtEnable ? KadDHT : undefined
      },
      config: {
        peerDiscovery: {
          bootstrap: {
            enabled: true,
            list: [
              bootstrapNode + '/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64'
            ]
          },
        },
        transport: {
          [ WStar.prototype[Symbol.toStringTag] ]: {
            upgrader: {
              localPeer: peerInfo.id,
              upgradeInbound: returnOp,
              upgradeOutbound: returnOp
            },
            wrtc
          }
        },
        dht: {
          enabled: dhtEnable,
          kBucketSize: 20
        },
        pubsub: {
          enabled: true,
          emitSelf: false
        }
      }
    });
    socket.bootstrapNode = bootstrapNode;
    return Object.setPrototypeOf(socket, ZeroNode.prototype);
  },
}