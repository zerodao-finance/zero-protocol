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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var libp2p = require('libp2p');
var WS = require('libp2p-websockets');
var Mplex = require('libp2p-mplex');
var SECIO = require('libp2p-secio');
var KadDHT = require('libp2p-kad-dht');
var Bootstrap = require('libp2p-bootstrap');
var PeerInfo = require('peer-info');
var GossipSub = require('libp2p-gossipsub');
var WStar = require('libp2p-webrtc-star');
var isBrowser = require('is-browser');
var returnOp = function (v) { return v; };
var ln = function (v) { return ((console.log(v)), v); };
var presets = {
    lendnet: '/dns4/lendnet.0confirmation.com/tcp/443/wss/p2p-webrtc-star/',
    zeronet: '/dns4/zeronet.0confirmation.com/tcp/443/wss/p2p-webrtc-star/'
};
var fromPresetOrMultiAddr = function (multiaddr) { return presets[multiaddr] || multiaddr; };
var wrtc = require('wrtc');
module.exports = {
    createNode: function (options) { return __awaiter(void 0, void 0, void 0, function () {
        var multiaddr, dhtEnable, socket;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    multiaddr = fromPresetOrMultiAddr(options.multiaddr);
                    dhtEnable = typeof options.dht === 'undefined' || options.dht === true;
                    return [4 /*yield*/, libp2p.create({
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
                                dht: dhtEnable ? KadDHT : undefined
                            },
                            config: {
                                peerDiscovery: (_a = {
                                        autoDial: true
                                    },
                                    _a[Bootstrap.tag] = {
                                        enabled: true,
                                        list: [options.multiaddr + '/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64']
                                    },
                                    _a),
                                transport: (_b = {},
                                    _b[WStar.prototype[Symbol.toStringTag]] = {
                                        wrtc: ln(!isBrowser && wrtc)
                                    },
                                    _b),
                                dht: {
                                    enabled: dhtEnable,
                                    kBucketSize: 20
                                },
                                pubsub: {
                                    enabled: true,
                                    emitSelf: false
                                }
                            }
                        })];
                case 1:
                    socket = _c.sent();
                    return [2 /*return*/, socket];
            }
        });
    }); }
};
