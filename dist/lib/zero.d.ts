/// <reference types="node" />
import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import { Buffer } from "buffer";
import type { SignerWithAddress } from 'hardhat-deploy-ethers/dist/src/signers';
import { BigNumberish } from 'ethers';
import { EIP712TypedData } from '@0x/types';
import { ZeroConnection, ZeroKeeper, ZeroUser } from './p2p';
import { PersistenceAdapter } from './persistence';
import { GatewayAddressInput } from './types';
declare type ZeroSigner = Wallet & SignerWithAddress & Signer;
export declare class TransferRequest {
    module: string;
    to: string;
    underwriter: string;
    asset: string;
    nonce: string;
    pNonce: string;
    amount: string;
    data: string;
    contractAddress: string;
    chainId: number | string;
    signature: string;
    private _destination;
    constructor(params: {
        module: string;
        to: string;
        underwriter: string;
        asset: string;
        amount: BigNumberish;
        data: string;
        nonce?: BigNumberish;
        pNonce?: BigNumberish;
        contractAddress?: string;
        chainId?: number;
        signature?: string;
    });
    destination(contractAddress?: string, chainId?: number | string, signature?: string): string;
    waitForSignature(isTest: any): Promise<any>;
    computeMintTxHash(isTest: any): Promise<any>;
    submitToRenVM(isTest: any): Promise<any>;
    pollForFromChainTx(isTest: boolean): Promise<{
        hash: any;
        vout: any;
    }>;
    setUnderwriter(underwriter: string): boolean;
    toEIP712Digest(contractAddress: string, chainId?: number): Buffer;
    toEIP712(contractAddress: string, chainId?: number): EIP712TypedData;
    _computeGHash(): string;
    getGPubKey(): Promise<string>;
    toGatewayAddress(input: GatewayAddressInput): Promise<string>;
    sign(signer: ZeroSigner, contractAddress: string): Promise<string>;
}
export declare function createZeroConnection(address: string): Promise<ZeroConnection>;
export declare function createZeroUser(connection: ZeroConnection, persistence?: PersistenceAdapter<any, any>): ZeroUser;
export declare function createZeroKeeper(connection: ZeroConnection): ZeroKeeper;
export {};
