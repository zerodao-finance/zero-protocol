/// <reference types="node" />
import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import type { SignerWithAddress } from 'hardhat-deploy-ethers/dist/src/signers';
import { BigNumberish } from 'ethers';
import { EIP712TypedData } from '@0x/types';
import { ZeroConnection, ZeroKeeper, ZeroUser } from './p2p';
import { PersistenceAdapter } from './persistence';
import { GatewayAddressInput } from './types';
declare type ZeroSigner = Wallet & SignerWithAddress & Signer;
export default class TransferRequest {
    module: string;
    to: string;
    underwriter: string;
    asset: string;
    nonce: string;
    pNonce: string;
    amount: string;
    data: string;
    constructor(module: string, to: string, underwriter: string, asset: string, amount: BigNumberish, data: string, nonce?: BigNumberish, pNonce?: BigNumberish);
    setUnderwriter(underwriter: string): boolean;
    toEIP712Digest(contractAddress: string, chainId?: number): Buffer;
    toEIP712(contractAddress: string, chainId?: number): EIP712TypedData;
    toGatewayAddress(input: GatewayAddressInput): any;
    sign(signer: ZeroSigner, contractAddress: string): Promise<any>;
}
export declare function createZeroConnection(address: string): Promise<ZeroConnection>;
export declare function createZeroUser(connection: ZeroConnection, persistence?: PersistenceAdapter<any, any>): ZeroUser;
export declare function createZeroKeeper(connection: ZeroConnection): ZeroKeeper;
export {};
