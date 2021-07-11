'use strict';
const libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const WS = require('libp2p-websockets')
const Mplex = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const MultiCastDNS = require('libp2p-mdns')
const KadDHT = require('libp2p-kad-dht')
const PeerInfo = require('peer-info');
const GossipSub = require('libp2p-gossipsub');
const WStar = require('libp2p-webrtc-star');
const returnOp = (v) => v;

const presets = {
  lendnet: '/dns4/lendnet.0confirmation.com/tcp/443/wss/p2p-webrtc-star/',
  zeronet: '/dns4/zeronet.0confirmation.com/tcp/443/wss/p2p-webrtc-star/'
};

const fromPresetOrMultiAddr = (multiaddr) => presets[multiaddr] || multiaddr;

const wrtc = require('wrtc');

module.exports = {
  createNode: async (options) => {
    const peerInfo = options.peerInfo || await PeerInfo.create();
    const bootstrapNode = fromPresetOrMultiAddr(options.multiaddr);
    peerInfo.multiaddrs.add(bootstrapNode);
    const dhtEnable = typeof options.dht === 'undefined' || options.dht === true;
    const socket = await libp2p.create({
      peerInfo,
      addresses: {
        listen: ['/ip4/0.0.0.0/tcp/0']
      },
      modules: {
        transport: [ TCP, WS, WStar ],
        streamMuxer: [ Mplex ],
        connEncryption: [ SECIO ],
        pubsub: GossipSub,
        peerDiscovery: [ MultiCastDNS ],
        dht: dhtEnable ? KadDHT : undefined
      },
      config: {
        peerDiscovery: {
          [MultiCastDNS.tag]: {
            enabled: true,
            interval: 20e3,
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
    await socket.start()
    await socket.pubsub.start()
    socket.bootstrapNode = bootstrapNode;
    return socket;
  },
}