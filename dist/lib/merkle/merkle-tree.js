"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var ethereumjs_util_1 = require("ethereumjs-util");
var MerkleTree = /** @class */ (function () {
    function MerkleTree(elements) {
        this.elements = __spreadArray([], elements, true);
        // Sort elements
        this.elements.sort(Buffer.compare);
        // Deduplicate elements
        this.elements = MerkleTree.bufDedup(this.elements);
        this.bufferElementPositionIndex = this.elements.reduce(function (memo, el, index) {
            memo[(0, ethereumjs_util_1.bufferToHex)(el)] = index;
            return memo;
        }, {});
        // Create layers
        this.layers = this.getLayers(this.elements);
    }
    MerkleTree.prototype.getLayers = function (elements) {
        if (elements.length === 0) {
            throw new Error('empty tree');
        }
        var layers = [];
        layers.push(elements);
        // Get next layer until we reach the root
        while (layers[layers.length - 1].length > 1) {
            layers.push(this.getNextLayer(layers[layers.length - 1]));
        }
        return layers;
    };
    MerkleTree.prototype.getNextLayer = function (elements) {
        return elements.reduce(function (layer, el, idx, arr) {
            if (idx % 2 === 0) {
                // Hash the current element with its pair element
                layer.push(MerkleTree.combinedHash(el, arr[idx + 1]));
            }
            return layer;
        }, []);
    };
    MerkleTree.combinedHash = function (first, second) {
        if (!first) {
            return second;
        }
        if (!second) {
            return first;
        }
        return (0, ethereumjs_util_1.keccak256)(MerkleTree.sortAndConcat(first, second));
    };
    MerkleTree.prototype.getRoot = function () {
        return this.layers[this.layers.length - 1][0];
    };
    MerkleTree.prototype.getHexRoot = function () {
        return (0, ethereumjs_util_1.bufferToHex)(this.getRoot());
    };
    MerkleTree.prototype.getProof = function (el) {
        var idx = this.bufferElementPositionIndex[(0, ethereumjs_util_1.bufferToHex)(el)];
        if (typeof idx !== 'number') {
            throw new Error('Element does not exist in Merkle tree');
        }
        return this.layers.reduce(function (proof, layer) {
            var pairElement = MerkleTree.getPairElement(idx, layer);
            if (pairElement) {
                proof.push(pairElement);
            }
            idx = Math.floor(idx / 2);
            return proof;
        }, []);
    };
    MerkleTree.prototype.getHexProof = function (el) {
        var proof = this.getProof(el);
        return MerkleTree.bufArrToHexArr(proof);
    };
    MerkleTree.getPairElement = function (idx, layer) {
        var pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
        if (pairIdx < layer.length) {
            return layer[pairIdx];
        }
        else {
            return null;
        }
    };
    MerkleTree.bufDedup = function (elements) {
        return elements.filter(function (el, idx) {
            return idx === 0 || !elements[idx - 1].equals(el);
        });
    };
    MerkleTree.bufArrToHexArr = function (arr) {
        if (arr.some(function (el) { return !Buffer.isBuffer(el); })) {
            throw new Error('Array is not an array of buffers');
        }
        return arr.map(function (el) { return '0x' + el.toString('hex'); });
    };
    MerkleTree.sortAndConcat = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return Buffer.concat(__spreadArray([], args, true).sort(Buffer.compare));
    };
    return MerkleTree;
}());
exports["default"] = MerkleTree;
