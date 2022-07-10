"use strict";
const libp2p = require("libp2p");
const WS = require("libp2p-websockets");
const Mplex = require("libp2p-mplex");
const { NOISE } = require('libp2p-noise');
const KadDHT = require("libp2p-kad-dht");
const Bootstrap = require("libp2p-bootstrap");
const PeerInfo = require("peer-info");
const PeerId = require("peer-id");
const GossipSub = require("libp2p-gossipsub");
const RelayConstants = require('libp2p/src/circuit/constants')
const { FaultTolerance } = require('libp2p/src/transport-manager')
const WStar = require("libp2p-webrtc-star");
const isBrowser = require("is-browser");
const returnOp = (v) => v;
const ethers = require("ethers");
const Libp2p = require("libp2p");

const wrtc = require("wrtc");
const cryptico = require('cryptico-js');
import crypto from "libp2p-crypto";

const globalObject = require('the-global-object');
const { Buffer } = require('buffer');
globalObject.Buffer = globalObject.Buffer || Buffer;
const base64url = require('base64url');
const { mapValues } = require('lodash');
const { hexlify } = require('@ethersproject/bytes');

const mapToBuffers = (o) => mapValues(o, (v) => base64url(v.toByteArray && Buffer.from(v.toByteArray()) || Buffer.from(hexlify(v).substr(2), 'hex')));

const cryptoFromSeed = async function (seed) {
  const key = mapToBuffers(await cryptico.generateRSAKey(seed, 2048));
  key.dp = key.dmp1;
  key.dq = key.dmq1;
  key.qi = key.coeff;
  return crypto.keys.supportedKeys.rsa.unmarshalRsaPrivateKey(new crypto.keys.supportedKeys.rsa.RsaPrivateKey(key, key).marshal());
};

const coerceBuffersToHex = (v) => {
  if (v instanceof Uint8Array || Buffer.isBuffer(v))
    return ethers.utils.hexlify(v);
  if (Array.isArray(v)) return v.map(coerceBuffersToHex);
  if (typeof v === "object") {
    return Object.keys(v).reduce((r, key) => {
      r[key] = coerceBuffersToHex(v[key]);
      return r;
    }, {});
  }
  return v;
};

const coerceHexToBuffers = (v) => {
  if (typeof v === "string" && v.substr(0, 2) === "0x")
    return Buffer.from(v.substr(2), "hex");
  if (Array.isArray(v)) return v.map(coerceHexToBuffers);
  if (typeof v === "object") {
    return Object.keys(v).reduce((r, key) => {
      r[key] = coerceHexToBuffers(v[key]);
      return r;
    }, {});
  }
  return v;
};
const ln = (v) => ((console.log(v)), v);

export class ZeroP2P extends Libp2p {
  static PRESETS = {
    MAINNET: '/dns4/p2p.zerodao.com/tcp/443/wss/p2p-webrtc-star/',
    'DEV-MAINNET': '/dns4/devp2p.zerodao.com/tcp/443/wss/p2p-webrtc-star/'
  };
  static fromPresetOrMultiAddr(multiaddr) {
    return this.PRESETS[(multiaddr || '').toUpperCase() || 'MAINNET'] || multiaddr;
  }
  static toMessage(password) {
    return (
      "/zerop2p/1.0.0/" +
      ethers.utils.solidityKeccak256(["string"], ["/zerop2p/1.0.0/" + password])
    );
  }
  static async peerIdFromSeed(seed) {
    return await PeerId.createFromPrivKey((await cryptoFromSeed(seed)).bytes);
  }
  static async fromSeed({ signer, seed, multiaddr }) {
    return new this({
      peerId: await this.peerIdFromSeed(seed),
      multiaddr,
      signer,
    });
  }
  static async fromPassword({ signer, multiaddr, password }) {
    return await this.fromSeed({
      signer,
      multiaddr,
      seed: await signer.signMessage(this.toMessage(password)),
    });
  }
  async start() {
    await super.start();
    await this.pubsub.start();
  }
  setSigner(signer) {
    this.signer = signer;
    this.addressPromise = this.signer.getAddress();
  }
  constructor(options) {
    const multiaddr = ZeroP2P.fromPresetOrMultiAddr(
      options.multiaddr || "mainnet"
    );
    console.log("listening on", multiaddr)
    super({
      peerId: options.peerId,
      connectionManager: {
        minConnections: 25
      },
      relay: {
        enabled: true,
        advertise: {
          bootDelay: RelayConstants.ADVERTISE_BOOT_DELAY,
          enabled: false,
          ttl: RelayConstants.ADVERTISE_TTL
        },
        hop: {
          enabled: false,
          active: false
        },
        autoRelay: {
          enabled: false,
          maxListeners: 2
        }
      },
      addresses: {
        listen: [multiaddr]
      },
      modules: {
        transport: [WStar],
        streamMuxer: [Mplex],
        connEncryption: [NOISE],
        pubsub: GossipSub,
        peerDiscovery: [Bootstrap],
        dht: KadDHT,
      },
      config: {
        peerDiscovery: {
          autoDial: true,
          [Bootstrap.tag]: {
            enabled: true,
            list: [
              multiaddr + 'QmXRimgxFGd8FEFRX8FvyzTG4jJTJ5pwoa3N5YDCrytASu'
            ],
          },
        },
        transport: {
          [WStar.prototype[Symbol.toStringTag]]: {
            wrtc: !isBrowser && wrtc,
          },
        },
        dht: {
          enabled: true,
          kBucketSize: 20,
        },
        pubsub: {
          enabled: true,
          emitSelf: false,
        },
      },
    });
    this.setSigner(options.signer);
  }
};
