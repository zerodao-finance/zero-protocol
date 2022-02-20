import MerkleTree from "./merkle-tree";
import { ethers } from "ethers";
import { Buffer } from 'buffer';
import BalanceTree from "./balance-tree";
import { parseBalanceMap } from "./parse-balance-map";
const fs = require("fs-extra");

function genLeaf(address, value) {
    return Buffer.from(
        ethers.utils
            .solidityKeccak256(['address', 'uint256'], [address, value])
            .slice(2),
        'hex'
    )
}

function balanceTreeFriendly(airdropList: any, decimals) {
    const list = [];
    Object.entries(airdropList).map((v: any) => {
        list.push({ account: v[0], amount: ethers.utils.parseUnits(v[1], decimals) })
    })
    return list;
}

export function useMerkleGenerator(merkleConfig: { decimals: number, airdrop: { [ key: string ]: string } }) {
    const balanceTree = new BalanceTree(balanceTreeFriendly(merkleConfig.airdrop, merkleConfig.decimals));
    const merkleTree = new MerkleTree(
        Object.entries(merkleConfig.airdrop).map(([address, tokens]) =>
            genLeaf(
                ethers.utils.getAddress(address),
                ethers.utils.parseUnits(tokens.toString(), merkleConfig.decimals)
            )
        )
    );
    const hexRoot = balanceTree.getHexRoot();

    // Create merkle result json for client
    const merkleResult = parseBalanceMap(merkleConfig.airdrop);

    return merkleResult;
}
