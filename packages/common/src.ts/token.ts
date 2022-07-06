import fixtures from "./fixtures";
import { isAddress, getAddress } from "@ethersproject/address";
import { AddressZero } from "@ethersproject/constants";
import _ from "lodash";
export function selectFixture(chainId) {
    switch (chainId) {
        case "42161":
            return fixtures.ARBITRUM;
        case "43114":
            return fixtures.AVALANCHE;
        case "137":
            return fixtures.MATIC;
        default:
            return fixtures.ETHEREUM;
    }
}


export function tokenMapping({tokenName, chainId}) {
    const fixture: any = selectFixture(chainId);

    switch (tokenName.toLowerCase()) {
        case "avax":
            return AddressZero;
        case "eth":
            return AddressZero;
        case "renbtc":
            return fixture.renBTC
        case "wbtc":
            return fixture.WBTC;
        case "ibbtc":
            return fixture.ibBTC;
        case "usdc":
            return fixture.USDC;
    }
}

export function reverseTokenMapping({tokenAddress, chainId}) {
    const checksummedAddress = isAddress(tokenAddress)
    ? getAddress(String(tokenAddress))
    : "";

    const fixture = selectFixture(chainId)
    if (checksummedAddress == AddressZero) return "ETH"
    let tokenName = _.findKey(fixture, function(v) { return getAddress(v) == checksummedAddress})
    return tokenName
}

