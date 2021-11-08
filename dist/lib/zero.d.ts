/// <reference types="node" />
import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import { Contract } from "@ethersproject/contracts";
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
    private _contractFn;
    private _contractParams;
    private _ren;
    _queryTxResult: any;
    _mint: any;
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
    submitToRenVM(isTest: any): Promise<any>;
    waitForSignature(): Promise<any>;
    setUnderwriter(underwriter: string): boolean;
    toEIP712Digest(contractAddress: string, chainId?: number): Buffer;
    toEIP712(contractAddress: string, chainId?: number): EIP712TypedData;
    toGatewayAddress(input: GatewayAddressInput): Promise<string>;
    sign(signer: ZeroSigner, contractAddress: string): Promise<string>;
}
export declare class TrivialUnderwriterTransferRequest extends TransferRequest {
    getController(signer: any): Promise<Contract>;
    fallbackMint(signer: any, params?: {}): Promise<any>;
    getTrivialUnderwriter(signer: any): Contract;
    loan(signer: any): Promise<any>;
    repay(signer: any, params?: {}): Promise<any>;
}
export declare function createZeroConnection(address: string): Promise<ZeroConnection>;
export declare function createZeroUser(connection: ZeroConnection, persistence?: PersistenceAdapter<any, any>): ZeroUser;
export declare function createZeroKeeper(connection: ZeroConnection): ZeroKeeper;
export {};
