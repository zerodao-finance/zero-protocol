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
const returnOp = (v) => v;

const { jsonBuffer, tryParse, tryStringify } = require('./util');

const presets = {
  lendnet: '/dns4/lendnet.0confirmation.com/tcp/443/wss/p2p-webrtc-star/',
  zeronet: '/dns4/zeronet.0confirmation.com/tcp/443/wss/p2p-webrtc-star/'
};

const fromPresetOrMultiAddr = (multiaddr) => presets[multiaddr] || multiaddr;

const WStar = require('libp2p-webrtc-star');

const createNode = async (options, wrtc) => {
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
      peerDiscovery: [ Bootstrap ],
      dht: dhtEnable ? KadDHT : undefined
    },
    config: {
      peerDiscovery: {
        bootstrap: {
          enabled: true,
          list: [
/*
            '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
            '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
            '/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
            '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
            '/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
            '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64'
*/
            bootstrapNode + '/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64'
          ]
        }
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
  const _connectedDeferred = {};
  _connectedDeferred.promise = new Promise((resolve, reject) => {
    _connectedDeferred.resolve = resolve;
    _connectedDeferred.reject = reject;
  });
  const _foundPeerDeferred = {};
  _foundPeerDeferred.promise = new Promise((resolve, reject) => {
    _foundPeerDeferred.resolve = resolve;
    _foundPeerDeferred.reject = reject;
  });
  return Object.assign(Object.create({
    async start() {
      this.socket.on('peer:connect', () => this._connectedDeferred.resolve());
      this.socket.on('peer:discovery', async (peer) => {
        try {
          await this.socket.dial(peer);
        } catch (e) {
          console.error(e);
        }
        if (this._foundPeerDeferred.resolve) {
          this._foundPeerDeferred.resolve();
          delete this._foundPeerDeferred.resolve;
        }
      });
      await this.socket.start();
    },
    async waitForPeer() {
      return await this._foundPeerDeferred.promise;
    },
    async waitForConnect() {
      return await this._connectedDeferred.promise;
    },
    async publish(topic, data) {
      return this.socket.pubsub.publish(topic, jsonBuffer(data));
    },
    async unsubscribe(topic) {
      return await this.socket.pubsub.unsubscribe(topic);
    },
    async handleProtocol(name, fn) {
      return this.socket.handle(name, async ({
        stream,
      }) => {
        let buffer = '';
        for await (const chunk of stream) {
          buffer += chunk.toString('utf8');
        }
        return fn(buffer);
      });
    },
    async subscribe(topic, handler) {
      return this.socket.pubsub.subscribe(topic, (msg) => handler({ msg, data: tryParse(msg.data) }));
    },
    async getSubscribers(topic) {
      return this.socket.pubsub.getSubscribers(topic);
    },
    async findPeer(peerId) {
      return await this.peerRouting.findPeer(peerId);
    }
  }), {
    _connectedDeferred,
    _foundPeerDeferred,
    socket
  });
};

Object.assign(module.exports, {
  createNode
});
