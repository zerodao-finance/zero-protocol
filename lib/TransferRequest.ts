import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import { hexlify, arrayify } from "@ethersproject/bytes";
import { randomBytes } from "@ethersproject/random";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { GatewayAddressInput } from "./types";
import { recoverAddress } from "@ethersproject/transactions";
import { Buffer } from "buffer";
import { BigNumberish, ethers } from "ethers";
import { signTypedDataUtils } from "@0x/utils";
import { EIP712TypedData } from "@0x/types";
import { EIP712_TYPES } from "./config/constants";
import { Zcash, Bitcoin } from "@renproject/chains";
import { utils } from "@renproject/utils";
import RenJS, { Gateway, GatewayTransaction } from "@renproject/ren";
import { EthArgs } from "@renproject/interfaces";
import { getProvider } from "./deployment-utils";

import fixtures from './fixtures';

const assetToRenVMChain = (assetName) => {
  switch (assetName) {
    case 'renBTC': return Bitcoin;
    case 'renZEC': return Zcash;
    default:
      return Bitcoin;
  }
};

const renVMChainToAssetName = (chain) => {
  switch (chain) {
    case Bitcoin:
      return 'BTC';
    case Zcash:
      return 'ZEC';
  }
};


export class ReleaseRequest {}

export class TransferRequest {
  public module: string;
  public to: string;
  public underwriter: string;
  public asset: string;
  public nonce: string;
  public pNonce: string;
  public amount: string;
  public data: string;
  public contractAddress: string;
  public chainId: string | number;
  public signature: string;
  private _destination: string;
  private _contractFn: string;
  private _contractParams: EthArgs;
  private _ren: RenJS;
  public _queryTxResult: any;
  public provider: any;
  public _mint: any;
  public requestType = "transfer";
  private network: string;

  _getNetwork() {
    return new (assetToRenVMChain(['renBTC', 'renZEC'].find((v) => Object.values(fixtures).find((network) => Object.entries(network).find(([token, address]) => v === token && ethers.utils.getAddress(address) === ethers.utils.getAddress(this.asset))))))({ network: (this.network as any) });
  }
  _getNetworkName() {
    return renVMChainToAssetName(this._getNetwork().constructor);
  }
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
    network?: "mainnet" | "testnet";
  }) {
    this.module = params.module;
    this.to = params.to;
    this.underwriter = params.underwriter;
    this.asset = params.asset;
    this.amount = ethers.utils.hexlify(
      typeof params.amount === "number"
        ? params.amount
        : typeof params.amount === "string"
        ? ethers.BigNumber.from(params.amount)
        : params.amount
    );
    this.data = params.data;
    this.nonce = params.nonce
      ? hexlify(params.nonce)
      : hexlify(randomBytes(32));
    this.pNonce = params.pNonce
      ? hexlify(params.pNonce)
      : hexlify(randomBytes(32));
    this.chainId = params.chainId;
    this.contractAddress = params.contractAddress;
    this.signature = params.signature;
    this.network = params.network || 'mainnet';
    this._ren = new RenJS(this.network).withChain(this._getNetwork());
    this._contractFn = "zeroCall";
    this._contractParams = [
      {
        name: "to",
        type: "address",
        value: this.to,
      },
      {
        name: "pNonce",
        type: "uint256",
        value: this.pNonce,
      },
      {
        name: "module",
        type: "address",
        value: this.module,
      },
      {
        name: "data",
        type: "bytes",
        value: this.data,
      },
    ];
  }

  destination(
    contractAddress?: string,
    chainId?: number | string,
    signature?: string
  ) {
    if (this._destination) return this._destination;
    const payload = this.toEIP712(
      contractAddress || this.contractAddress,
      Number(chainId || this.chainId)
    );
    delete payload.types.EIP712Domain;
    const digest = _TypedDataEncoder.hash(
      payload.domain,
      payload.types,
      payload.message
    );
    return (this._destination = recoverAddress(
      digest,
      signature || this.signature
    ));
  }

  setProvider(provider) {
    this.provider = provider;
    return this;
  }

  async submitToRenVM(): Promise<Gateway> {
    if (this._mint) return this._mint;
    const eth = getProvider(this);
    this._ren = this._ren.withChain(eth);
    const result = (this._mint = this._ren.gateway({
      asset: this._getNetworkName(),
      from: this._getNetwork().GatewayAddress(),
      to: eth.Contract({
        to: this.contractAddress,
        method: this._contractFn,
        params: this._contractParams,
        withRenParams: true,
      }),
      //@ts-ignore
      nonce: arrayify(this.nonce),
    }));

    return result;
  }

  async waitForSignature() {
    if (this._queryTxResult) return this._queryTxResult;
    const mint = await this.submitToRenVM();
    console.log("Gateway: ", mint.gatewayAddress);
    const deposit: GatewayTransaction<any> = await new Promise((resolve) => {
      mint.on("transaction", (tx) => {
        console.log("transaction received");
        resolve(tx);
      });
    });
    await deposit.in.wait();

    await deposit.renVM.submit();
    await deposit.renVM.wait();

    console.log((deposit as any).queryTxResult);
    const queryTx = (deposit as any).queryTxResult.tx;
    const { amount, sig: signature } = queryTx.out;
    const { nhash, phash } = queryTx.in;
    console.log(hexlify(deposit.pHash), hexlify(phash));
    console.log(hexlify(deposit.nHash), hexlify(nhash));
    // const { signature, nhash, phash, amount } =
    //   deposit._state.queryTxResult.out;
    const result = (this._queryTxResult = {
      amount: String(amount),
      nHash: hexlify(nhash),
      pHash: hexlify(phash),
      signature: hexlify(signature),
    });
    return result;
  }

  setUnderwriter(underwriter: string): boolean {
    if (!ethers.utils.isAddress(underwriter)) return false;
    this.underwriter = ethers.utils.getAddress(underwriter);
    return true;
  }

  toEIP712Digest(contractAddress?: string, chainId?: number): Buffer {
    return signTypedDataUtils.generateTypedDataHash(
      this.toEIP712(
        contractAddress || this.contractAddress,
        Number(chainId || this.chainId)
      )
    );
  }

  toEIP712(contractAddress: string, chainId?: number): EIP712TypedData {
    this.contractAddress = contractAddress || this.contractAddress;
    this.chainId = chainId || this.chainId;
    return {
      types: { ...EIP712_TYPES },
      domain: {
        name: "ZeroController",
        version: "1",
        chainId: String(this.chainId) || "1",
        verifyingContract: this.contractAddress || ethers.constants.AddressZero,
      },
      message: {
        module: this.module,
        asset: this.asset,
        amount: this.amount,
        data: this.data,
        underwriter: this.underwriter,
        nonce: this.pNonce,
      },
      primaryType: "TransferRequest",
    };
  }

  async toGatewayAddress(input: GatewayAddressInput): Promise<string> {
    const mint = await this.submitToRenVM();
    return mint.gatewayAddress;
  }

  async sign(
    signer: Wallet & Signer,
    contractAddress?: string
  ): Promise<string> {
    const provider = signer.provider as ethers.providers.JsonRpcProvider;
    const { chainId } = await signer.provider.getNetwork();
    this.chainId = chainId;
    try {
      const payload = this.toEIP712(contractAddress, chainId);
      delete payload.types.EIP712Domain;
      console.log(payload.types);
      const sig = await signer._signTypedData(
        payload.domain,
        payload.types,
        payload.message
      );
      return (this.signature = ethers.utils.joinSignature(
        ethers.utils.splitSignature(sig)
      ));
    } catch (e) {
      console.error(e);
      return (this.signature = await provider.send("eth_signTypedData_v4", [
        await signer.getAddress(),
        this.toEIP712(this.contractAddress || contractAddress, chainId),
      ]));
    }
  }
}
