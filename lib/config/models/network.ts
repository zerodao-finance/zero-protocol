import { ZeroToken } from '../tokens';

export enum SUPPORTED_NETWORKS {
	BSC = 'bsc',
	ETH = 'eth',
	MATIC = 'matic',
}

export enum NETWORK_IDS {
	ETH = 1,
	BSC = 56,
	MATIC = 137,
}

export abstract class Network {
	private static idToNetwork: Record<number, Network> = {};
	private static symbolToNetwork: Record<string, Network> = {};
	readonly symbol: SUPPORTED_NETWORKS;
	readonly id: NETWORK_IDS;
	readonly name: string;
	readonly tokens: ZeroToken[];
	readonly baseCurrency: ZeroToken;

	constructor(
		symbol: SUPPORTED_NETWORKS,
		id: NETWORK_IDS,
		name: string,
		tokens: ZeroToken[],
		baseCurrency: ZeroToken,
	) {
		this.symbol = symbol;
		this.name = name;
		this.id = id;
		this.tokens = tokens;
		this.baseCurrency = baseCurrency;
		Network.register(this);
	}

	static register(network: Network): void {
		Network.idToNetwork[network.id] = network;
		Network.symbolToNetwork[network.symbol] = network;
	}

	static networkFromId(id: number): Network {
		return Network.idToNetwork[id];
	}

	static networkFromSymbol(symbol: string): Network {
		return Network.symbolToNetwork[symbol];
	}
}
