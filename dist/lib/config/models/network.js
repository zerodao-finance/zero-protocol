"use strict";
exports.__esModule = true;
exports.Network = exports.NETWORK_IDS = exports.SUPPORTED_NETWORKS = void 0;
require("../tokens");
var SUPPORTED_NETWORKS;
(function (SUPPORTED_NETWORKS) {
    SUPPORTED_NETWORKS["BSC"] = "bsc";
    SUPPORTED_NETWORKS["ETH"] = "eth";
    SUPPORTED_NETWORKS["MATIC"] = "matic";
})(SUPPORTED_NETWORKS = exports.SUPPORTED_NETWORKS || (exports.SUPPORTED_NETWORKS = {}));
var NETWORK_IDS;
(function (NETWORK_IDS) {
    NETWORK_IDS[NETWORK_IDS["ETH"] = 1] = "ETH";
    NETWORK_IDS[NETWORK_IDS["BSC"] = 56] = "BSC";
    NETWORK_IDS[NETWORK_IDS["MATIC"] = 137] = "MATIC";
})(NETWORK_IDS = exports.NETWORK_IDS || (exports.NETWORK_IDS = {}));
var Network = /** @class */ (function () {
    function Network(symbol, id, name, tokens, baseCurrency) {
        this.symbol = symbol;
        this.name = name;
        this.id = id;
        this.tokens = tokens;
        this.baseCurrency = baseCurrency;
        Network.register(this);
    }
    Network.register = function (network) {
        Network.idToNetwork[network.id] = network;
        Network.symbolToNetwork[network.symbol] = network;
    };
    Network.networkFromId = function (id) {
        return Network.idToNetwork[id];
    };
    Network.networkFromSymbol = function (symbol) {
        return Network.symbolToNetwork[symbol];
    };
    Network.idToNetwork = {};
    Network.symbolToNetwork = {};
    return Network;
}());
exports.Network = Network;
