export declare function selectFixture(chainId: any): {
    renBTC: string;
    wETH: string;
    wNative: string;
    btcGateway: string;
    USDC: string;
    WBTC: string;
    Router: string;
    sushiRouter: string;
    Curve_Ren: string;
    gatewayRegistry: string;
    safeProxyFactory: string;
    multiSend: string;
    safeMasterCopy: string;
} | {
    AVAX: string;
    renBTC: string;
    Curve_Ren: string;
    aTricrypto: string;
    WBTC: string;
    USDC: string;
    Curve_SBTC: string;
    Curve_TriCryptoTwo: string;
    Router: string;
    btcGateway: string;
};
export declare function tokenMapping({ tokenName, chainId }: {
    tokenName: any;
    chainId: any;
}): any;
export declare function reverseTokenMapping({ tokenAddress, chainId }: {
    tokenAddress: any;
    chainId: any;
}): string;
