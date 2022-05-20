'use strict';
const libp2p = require('libp2p');
const WS = require('libp2p-websockets');
const Mplex = require('libp2p-mplex');
const SECIO = require('libp2p-secio');
const { NOISE } = require('libp2p-noise')
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

module.exports = {
	createNode: async (options) => {
		/*
		const peerInfo = options.peerInfo || (await PeerInfo.create());
		*/
		const multiaddr = fromPresetOrMultiAddr(options.multiaddr);
		/*
		peerInfo.multiaddrs.add(multiaddr);
		*/
		const dhtEnable = typeof options.dht === 'undefined' || options.dht === true;
		console.log(options.multiaddr + 'QmXRimgxFGd8FEFRX8FvyzTG4jJTJ5pwoa3N5YDCrytASu')
		const socket = await libp2p.create({
		//	peerInfo,
			addresses: {
				listen: [
					multiaddr
				]
			},
			modules: {
				transport: [WS, WStar],
				streamMuxer: [Mplex],
				connEncryption: [NOISE],
				pubsub: GossipSub,
				peerDiscovery: [Bootstrap],
				dht: dhtEnable ? KadDHT : undefined,
			},
			config: {
				peerDiscovery: {
					autoDial: true,
					[Bootstrap.tag]: {
						enabled: true,
						list: [ 
							// options.multiaddr + 'QmbSXn6jzUigdwjgLG9XBFgJ4D4e9ErEmTJcz7YWfVc65d',
							// options.multiaddr + 'QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64', 
							options.multiaddr + 'QmXRimgxFGd8FEFRX8FvyzTG4jJTJ5pwoa3N5YDCrytASu'
						],
					}
				},
				transport: {
					[ WStar.prototype[Symbol.toStringTag] ]: {
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
	},
};
