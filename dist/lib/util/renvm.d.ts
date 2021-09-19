declare class RenVM {
    cachedProxyCodeHash: any;
    shifterBorrowProxyBytecode: any;
    private InitializationActionsABI;
    constructor(cachedProxyCodeHash: any, shifterBorrowProxy: any);
    computeGatewayAddress: ({ isTestnet, g, mpkh }: any) => any;
    initializeCodeHash: () => Promise<any>;
    computeLiquidityRequestHash: ({ shifterPool, token, nonce, amount, gasRequested, forbidLoan, actions, }: any) => string;
    computeBorrowProxyAddress: ({ shifterPool, borrower, token, nonce, amount, forbidLoan, actions }: any) => string;
}
export default RenVM;
