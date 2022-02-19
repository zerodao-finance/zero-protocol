import { merkleConfig } from "./config";
import MerkleTree from "../lib/merkle/merkle-tree";
import { ethers } from "ethers";
import { Buffer } from 'buffer';
import BalanceTree from "../lib/merkle/balance-tree";
import { parseBalanceMap } from "../lib/merkle/parse-balance-map";
const fs = require("fs");

function genLeaf(address, value) {
    return Buffer.from(
        ethers.utils
            .solidityKeccak256(['address', 'uint256'], [address, value])
            .slice(2),
        'hex'
    )
}

function balanceTreeFriendly(airdropList, decimals) {
    const list = [];
    Object.entries(airdropList).map(([address, tokens]) => {
        list.push({ account: address, amount: ethers.utils.parseUnits(tokens, decimals) })
    })
    return list;
}

export function useMerkleGenerator() {
    const balanceTree = new BalanceTree(balanceTreeFriendly(merkleConfig.airdrop, merkleConfig.decimals));
    const merkleTree = new MerkleTree(
        Object.entries(merkleConfig.airdrop).map(([address, tokens]) =>
            genLeaf(
                ethers.utils.getAddress(address),
                ethers.utils.parseUnits(tokens.toString(), merkleConfig.decimals)
            )
        )
    );
    const hexRoot = merkleTree.getHexRoot();

    // Create merkle result json for client
    const merkleResult = parseBalanceMap(merkleConfig.airdrop);
    fs.writeFile('merkle/result.json', JSON.stringify(merkleResult, null, 4), (err) => {if(err) throw err})

    return {
        balanceTree,
        hexRoot,
        merkleTree,
        decimals: merkleConfig.decimals
    }
}