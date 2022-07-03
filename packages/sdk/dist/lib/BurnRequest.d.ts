/// <reference types="node" />
import { Wallet } from '@ethersproject/wallet';
import { Signer } from '@ethersproject/abstract-signer';
import { GatewayAddressInput } from '@zerodao/common';
import { Buffer } from 'buffer';
import { BigNumberish } from 'ethers';
import { EIP712TypedData } from '@0x/types';
import { BurnAndRelease } from '@renproject/ren';
/**
 * Supposed to provide a way to execute other functions while using renBTC to pay for the gas fees
 * what a flow to test would look like:
 * -> underwriter sends request to perform some operation on some contract somewhere
 * -> check if renBTC amount is debited correctly
 */
export declare class BurnRequest {
    amount: string;
    underwriter: string;
    deadline: number;
    asset: string;
    nonce: string;
    pNonce: string;
    data: string;
    contractAddress: string;
    btcTo: string;
    chainId: number | string;
    signature: string;
    _destination: string;
    private _contractFn;
    private _contractParams;
    private _ren;
    private gatewayIface;
    _queryTxResult: any;
    provider: any;
    _burn: any;
    owner: string;
    keeper: any;
    assetName: string;
    tokenNonce: string;
    destination: any;
    requestType: string;
    constructor(params: {
        owner: string;
        underwriter: string;
        asset: string;
        amount: string;
        deadline: number;
        destination: string;
        data?: string;
        nonce?: BigNumberish;
        pNonce?: BigNumberish;
        contractAddress?: string;
        chainId?: number;
        signature?: string;
    });
    setProvider(provider: any): this;
    submitToRenVM(isTest: any): Promise<any>;
    waitForTxNonce(burn: ReturnType<BurnAndRelease['burn']>): Promise<any>;
    setUnderwriter(underwriter: string): boolean;
    toEIP712Digest(contractAddress: string, chainId?: number): Buffer;
    getExpiry(nonce?: string | number): string;
    toEIP712(contractAddress: string, chainId?: number): EIP712TypedData;
    toGatewayAddress(input: GatewayAddressInput): Promise<string>;
    sign(signer: Wallet & Signer, contractAddress?: string): Promise<string>;
    waitForHostTransaction(): Promise<unknown>;
    waitForRemoteTransaction(): Promise<import("send-crypto/build/main/lib/utxo").UTXO>;
}
