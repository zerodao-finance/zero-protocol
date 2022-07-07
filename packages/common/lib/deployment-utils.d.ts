import { Wallet } from '@ethersproject/wallet';
import { Signer } from '@ethersproject/abstract-signer';
import type { SignerWithAddress } from 'hardhat-deploy-ethers/dist/src/signer-with-address';
import { ethers } from 'ethers';
import { Polygon, Ethereum, Arbitrum, Avalanche } from '@renproject/chains';
export declare const CONTROLLER_DEPLOYMENTS: {
    [x: string]: string;
};
export declare const RPC_ENDPOINTS: {
    Arbitrum: string;
    Avalanche: string;
    Polygon: string;
    Ethereum: string;
};
export declare const RENVM_PROVIDERS: {
    Arbitrum: typeof Arbitrum;
    Polygon: typeof Polygon;
    Ethereum: typeof Ethereum;
    Avalanche: typeof Avalanche;
};
export declare const getVanillaProvider: (request: any) => ethers.providers.JsonRpcProvider;
export declare const getRenVMChain: (transferRequest: any) => any;
export declare const logger: {
    debug(v: any): void;
};
export declare type ZeroSigner = Wallet & SignerWithAddress & Signer;
