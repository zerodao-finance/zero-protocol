'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const libp2p = require('libp2p');
const TCP = require('libp2p-tcp');
const WS = require('libp2p-websockets');
const Mplex = require('libp2p-mplex');
const SECIO = require('libp2p-secio');
const KadDHT = require('libp2p-kad-dht');
const Bootstrap = require('libp2p-bootstrap');
const PeerInfo = require('peer-info');
const GossipSub = require('libp2p-gossipsub');
const WStar = require('libp2p-webrtc-star');
const isBrowser = require('is-browser');
const returnOp = (v) => v;
const ln = (v) => ((console.log(v)), v);
const presets = {
    lendnet: '/dns4/lendnet.0confirmation.com/tcp/443/wss/p2p-webrtc-star/',
    zeronet: '/dns4/zeronet.0confirmation.com/tcp/443/wss/p2p-webrtc-star/',
};
const fromPresetOrMultiAddr = (multiaddr) => presets[multiaddr] || multiaddr;
const wrtc = require('wrtc');
console.log(wrtc);
module.exports = {
    createNode: (options) => __awaiter(void 0, void 0, void 0, function* () {
        /*
        const peerInfo = options.peerInfo || (await PeerInfo.create());
        */
        const multiaddr = fromPresetOrMultiAddr(options.multiaddr);
        /*
        peerInfo.multiaddrs.add(multiaddr);
        */
        const dhtEnable = typeof options.dht === 'undefined' || options.dht === true;
        const socket = yield libp2p.create({
            //	peerInfo,
            addresses: {
                listen: [
                    multiaddr
                ]
            },
            modules: {
                transport: [WS, WStar],
                streamMuxer: [Mplex],
                connEncryption: [SECIO],
                pubsub: GossipSub,
                peerDiscovery: [Bootstrap],
                dht: dhtEnable ? KadDHT : undefined,
            },
            config: {
                peerDiscovery: {
                    autoDial: true,
                    [Bootstrap.tag]: {
                        enabled: true,
                        list: [options.multiaddr + '/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64'],
                    }
                },
                transport: {
                    [WStar.prototype[Symbol.toStringTag]]: {
                        wrtc: ln(!isBrowser && wrtc)
                    }
                },
                dht: {
                    enabled: dhtEnable,
                    kBucketSize: 20,
                },
                pubsub: {
                    enabled: true,
                    emitSelf: false,
                },
            },
        });
        return socket;
    }),
};
