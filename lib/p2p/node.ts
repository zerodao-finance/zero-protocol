'use strict';
import libp2p from 'libp2p';
// @ts-expect-error
import TCP from 'libp2p-tcp';
// @ts-expect-error
import WS from 'libp2p-websockets';
// @ts-expect-error
import Mplex from 'libp2p-mplex';
// @ts-expect-error
import SECIO from 'libp2p-secio';
// @ts-expect-error
import MultiCastDNS from 'libp2p-mdns';
import KadDHT from 'libp2p-kad-dht';
import PeerInfo from 'peer-info';
import GossipSub from 'libp2p-gossipsub';
// @ts-expect-error
import WStar from 'libp2p-websocket-star';
// @ts-expect-error
import wrtc from 'wrtc';
import { NodeOptions } from './types';
import MultiAddr from 'multiaddr';

const returnOp = <T>(v: T): T => v;

const presets: {
	[index: string]: string;
} = {
	lendnet: '/dns4/lendnet.0confirmation.com/tcp/443/wss/p2p-webrtc-star/',
	zeronet: '/dns4/zeronet.0confirmation.com/tcp/443/wss/p2p-webrtc-star/',
};

const fromPresetOrMultiAddr = (address: string): MultiAddr => new MultiAddr(presets[address] || address);

export const createNode = async (options: NodeOptions) => {
	const peerInfo = options.peerInfo || (await PeerInfo.create());
	const multiaddr = fromPresetOrMultiAddr(options.multiaddr);
	peerInfo.multiaddrs.add(multiaddr);
	const dhtEnable = typeof options.dht === 'undefined' || options.dht === true;
	const socket = await libp2p.create({
		peerInfo,
		addresses: {
			listen: ['/ip4/0.0.0.0/tcp/0'],
		},
		modules: {
			transport: [TCP, WS, WStar],
			streamMuxer: [Mplex],
			connEncryption: [SECIO],
			// Related: https://githubmemory.com/repo/ChainSafe/js-libp2p-gossipsub/issues/154
			// @ts-expect-error
			pubsub: GossipSub,
			peerDiscovery: [MultiCastDNS],
			dht: dhtEnable ? KadDHT : undefined,
		},
		config: {
			peerDiscovery: {
				[MultiCastDNS.tag]: {
					enabled: true,
					interval: 20e3,
				},
			},
			transport: {
				[WStar.prototype[Symbol.toStringTag]]: {
					upgrader: {
						localPeer: peerInfo.id,
						upgradeInbound: returnOp,
						upgradeOutbound: returnOp,
					},
					wrtc,
				},
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
	await socket.start();
	await socket.pubsub.start();
	return socket;
};
