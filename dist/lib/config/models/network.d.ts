import { ZeroToken } from '../tokens';
export declare enum SUPPORTED_NETWORKS {
    BSC = "bsc",
    ETH = "eth",
    MATIC = "matic"
}
export declare enum NETWORK_IDS {
    ETH = 1,
    BSC = 56,
    MATIC = 137
}
export declare abstract class Network {
    private static idToNetwork;
    private static symbolToNetwork;
    readonly symbol: SUPPORTED_NETWORKS;
    readonly id: NETWORK_IDS;
    readonly name: string;
    readonly tokens: ZeroToken[];
    readonly baseCurrency: ZeroToken;
    constructor(symbol: SUPPORTED_NETWORKS, id: NETWORK_IDS, name: string, tokens: ZeroToken[], baseCurrency: ZeroToken);
    static register(network: Network): void;
    static networkFromId(id: number): Network;
    static networkFromSymbol(symbol: string): Network;
}
//# sourceMappingURL=network.d.ts.map