/// <reference types="node" />
import './silence-init';
import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import { Contract } from "@ethersproject/contracts";
import { Buffer } from "buffer";
import { BigNumberish } from 'ethers';
import { EIP712TypedData } from '@0x/types';
import { ZeroConnection, ZeroKeeper, ZeroUser } from './p2p';
import { GatewayAddressInput } from './types';
import { PersistenceAdapter } from './persistence';
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
    provider: any;
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
    setProvider(provider: any): this;
    submitToRenVM(isTest: any): Promise<any>;
    waitForSignature(): Promise<any>;
    setUnderwriter(underwriter: string): boolean;
    toEIP712Digest(contractAddress: string, chainId?: number): Buffer;
    toEIP712(contractAddress: string, chainId?: number): EIP712TypedData;
    toGatewayAddress(input: GatewayAddressInput): Promise<string>;
    sign(signer: Wallet & Signer, contractAddress: string): Promise<string>;
}
export declare class DelegateUnderwriterTransferRequest extends TransferRequest {
    getController(signer: any): Promise<Contract>;
    fallbackMint(signer: any, params?: {}): Promise<any>;
    getDelegateUnderwriter(signer: any): Contract;
    loan(signer: any, params?: {}): Promise<any>;
    dry(signer: any, params?: {}): Promise<any>;
    repay(signer: any, params?: {}): Promise<any>;
}
export declare function createZeroConnection(address: string): Promise<ZeroConnection>;
export declare function createZeroUser(connection: ZeroConnection, persistence?: PersistenceAdapter<any, any>): ZeroUser;
export declare function createZeroKeeper(connection: ZeroConnection): ZeroKeeper;
//# sourceMappingURL=zero.d.ts.map