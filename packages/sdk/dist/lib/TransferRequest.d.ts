/// <reference types="node" />
import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import { GatewayAddressInput } from "@zerodao/common";
import { Buffer } from "buffer";
import { BigNumberish } from "ethers";
import { EIP712TypedData } from "@0x/types";
export declare class ReleaseRequest {
}
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
    chainId: string | number;
    signature: string;
    private _destination;
    private _contractFn;
    private _contractParams;
    private _ren;
    _queryTxResult: any;
    provider: any;
    _mint: any;
    requestType: string;
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
        chainId?: string | number;
        signature?: string;
    });
    destination(contractAddress?: string, chainId?: number | string, signature?: string): string;
    setProvider(provider: any): this;
    submitToRenVM(): Promise<any>;
    waitForSignature(): Promise<any>;
    setUnderwriter(underwriter: string): boolean;
    toEIP712Digest(contractAddress?: string, chainId?: number): Buffer;
    toEIP712(contractAddress: string, chainId?: number): EIP712TypedData;
    toGatewayAddress(input: GatewayAddressInput): Promise<string>;
    sign(signer: Wallet & Signer, contractAddress?: string): Promise<string>;
}
