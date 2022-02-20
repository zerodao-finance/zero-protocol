"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.useMerkleGenerator = void 0;
var config_1 = require("./config");
var merkle_tree_1 = __importDefault(require("../lib/merkle/merkle-tree"));
var ethers_1 = require("ethers");
var buffer_1 = require("buffer");
var balance_tree_1 = __importDefault(require("../lib/merkle/balance-tree"));
function genLeaf(address, value) {
    return buffer_1.Buffer.from(ethers_1.ethers.utils
        .solidityKeccak256(['address', 'uint256'], [address, value])
        .slice(2), 'hex');
}
function balanceTreeFriendly(airdropList, decimals) {
    var list = [];
    Object.entries(airdropList).map(function (_a) {
        var address = _a[0], tokens = _a[1];
        list.push({ account: address, amount: ethers_1.ethers.utils.parseUnits(tokens, decimals) });
    });
    return list;
}
function useMerkleGenerator() {
    var balanceTree = new balance_tree_1["default"](balanceTreeFriendly(config_1.merkleConfig.airdrop, config_1.merkleConfig.decimals));
    var merkleTree = new merkle_tree_1["default"](Object.entries(config_1.merkleConfig.airdrop).map(function (_a) {
        var address = _a[0], tokens = _a[1];
        return genLeaf(ethers_1.ethers.utils.getAddress(address), ethers_1.ethers.utils.parseUnits(tokens.toString(), config_1.merkleConfig.decimals));
    }));
    var hexRoot = merkleTree.getHexRoot();
    return {
        balanceTree: balanceTree,
        hexRoot: hexRoot,
        merkleTree: merkleTree,
        decimals: config_1.merkleConfig.decimals
    };
}
exports.useMerkleGenerator = useMerkleGenerator;
