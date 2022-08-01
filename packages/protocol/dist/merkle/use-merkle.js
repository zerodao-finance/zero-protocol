"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.useMerkleGenerator = void 0;
var merkle_tree_1 = __importDefault(require("./merkle-tree"));
var ethers_1 = require("ethers");
var buffer_1 = require("buffer");
var balance_tree_1 = __importDefault(require("./balance-tree"));
var parse_balance_map_1 = require("./parse-balance-map");
var fs = require("fs-extra");
function genLeaf(address, value) {
    return buffer_1.Buffer.from(ethers_1.ethers.utils
        .solidityKeccak256(['address', 'uint256'], [address, value])
        .slice(2), 'hex');
}
function balanceTreeFriendly(airdropList, decimals) {
    var list = [];
    Object.entries(airdropList).map(function (v) {
        list.push({ account: v[0], amount: ethers_1.ethers.utils.parseUnits(v[1], decimals) });
    });
    return list;
}
function useMerkleGenerator(merkleConfig) {
    var balanceTree = new balance_tree_1["default"](balanceTreeFriendly(merkleConfig.airdrop, merkleConfig.decimals));
    var merkleTree = new merkle_tree_1["default"](Object.entries(merkleConfig.airdrop).map(function (_a) {
        var address = _a[0], tokens = _a[1];
        return genLeaf(ethers_1.ethers.utils.getAddress(address), ethers_1.ethers.utils.parseUnits(tokens.toString(), merkleConfig.decimals));
    }));
    var hexRoot = balanceTree.getHexRoot();
    // Create merkle result json for client
    var merkleResult = (0, parse_balance_map_1.parseBalanceMap)(merkleConfig.airdrop);
    return merkleResult;
}
exports.useMerkleGenerator = useMerkleGenerator;
