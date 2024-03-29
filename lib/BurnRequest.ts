import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import { hexlify } from "@ethersproject/bytes";
import { randomBytes } from "@ethersproject/random";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { GatewayAddressInput } from "./types";
import { recoverAddress } from "@ethersproject/transactions";
import { Base58 } from "@ethersproject/basex";
import { Buffer } from "buffer";
import { BigNumberish, ethers } from "ethers";
import { signTypedDataUtils } from "@0x/utils";
import { EIP712TypedData } from "@0x/types";
import { Bitcoin } from "@renproject/chains";
import RenJS from "@renproject/ren";
import { EthArgs } from "@renproject/interfaces";
import {
  CONTROLLER_DEPLOYMENTS,
  getVanillaProvider,
  getProvider,
} from "./deployment-utils";
import fixtures from "./fixtures";
// @ts-ignore
import { BTCHandler } from "send-crypto/build/main/handlers/BTC/BTCHandler";
import { ZECHandler } from "send-crypto/build/main/handlers/ZEC/ZECHandler";
import { EIP712_TYPES } from "./config/constants";
/**
 * Supposed to provide a way to execute other functions while using renBTC to pay for the gas fees
 * what a flow to test would look like:
 * -> underwriter sends request to perform some operation on some contract somewhere
 * -> check if renBTC amount is debited correctly
 */

const isZcashAddress = (hex) => Buffer.from(ethers.utils.hexlify(hex).substr(2), 'hex').toString('utf8')[0] === 't';

export class BurnRequest {
  public amount: string;
  public underwriter: string;
  public deadline: number;
  public asset: string;
  public nonce: string;
  public pNonce: string;
  public data: string;
  public contractAddress: string;
  public btcTo: string;
  public chainId: number | string;
  public signature: string;
  public _destination: string;
  private _contractFn: string;
  private _contractParams: EthArgs;
  private _ren: RenJS;
  private gatewayIface: ethers.utils.Interface;
  public _queryTxResult: any;
  public provider: any;
  public _burn: any;
  public owner: string;
  public keeper: any;
  public assetName: string;
  public tokenNonce: string;
  public destination: any;
  public requestType = "burn";

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
  }) {
    this.destination = params.destination;
    this._destination = params.destination;
    this.owner = params.owner;
    this.underwriter = params.underwriter;
    this.asset = params.asset;
    this.data = params.data || "0x";
    console.log("params.nonce", params.nonce);
    this.nonce = params.nonce
      ? hexlify(params.nonce)
      : hexlify(randomBytes(32));
    this.pNonce = params.pNonce
      ? hexlify(params.pNonce)
      : hexlify(randomBytes(32));
    this.chainId = params.chainId;
    this.amount = params.amount;
    this.deadline = params.deadline;
    this.contractAddress = params.contractAddress;
    this.signature = params.signature;
    //this._config =
    //
    this.gatewayIface = new ethers.utils.Interface([
      "event LogBurn(bytes _to, uint256 _amount, uint256 indexed _n, bytes indexed _indexedTo)",
    ]);
    this._ren = new (RenJS as any)("mainnet", { loadCompletedDeposits: true });
    this._contractFn = "burn";
    //TODO: figure out exactly what values go in here
    this._contractParams = [
      {
        name: "_to",
        type: "bytes",
        value: this.destination,
      },
      {
        name: "amount",
        type: "uint256",
        value: this.amount,
      },
    ];
  }

  setProvider(provider) {
    this.provider = provider;
    return this;
  }
  setUnderwriter(underwriter: string): boolean {
    if (!ethers.utils.isAddress(underwriter)) return false;
    this.underwriter = ethers.utils.getAddress(underwriter);
    return true;
  }

  toEIP712Digest(contractAddress: string, chainId?: number): Buffer {
    return signTypedDataUtils.generateTypedDataHash(
      this.toEIP712(
        contractAddress || this.contractAddress,
        Number(chainId || this.chainId)
      )
    );
  }
  getExpiry(nonce?: string | number) {
    nonce = nonce || this.tokenNonce;
    console.log([
      this.asset,
      this.amount,
      this.deadline,
      nonce,
      this.data,
      this.destination,
    ]);
    return ethers.utils.solidityKeccak256(
      ["address", "uint256", "uint256", "uint256", "bytes", "bytes"],
      [
        this.asset,
        this.amount,
        this.deadline,
        nonce,
        this.data,
        this.destination,
      ]
    );
  }
  toEIP712(contractAddress: string, chainId?: number): EIP712TypedData {
    this.contractAddress = contractAddress || this.contractAddress;
    this.chainId = chainId || this.chainId;
    return {
      types: {
        EIP712Domain:
          Number(this.chainId) == 137 &&
          this.asset.toLowerCase() == fixtures.MATIC.USDC.toLowerCase()
            ? [
                {
                  name: "name",
                  type: "string",
                },
                {
                  name: "version",
                  type: "string",
                },
                {
                  name: "verifyingContract",
                  type: "address",
                },
                {
                  name: "salt",
                  type: "bytes32",
                },
              ]
            : EIP712_TYPES.EIP712Domain,
        Permit: [
          {
            name: "holder",
            type: "address",
          },
          {
            name: "spender",
            type: "address",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "expiry",
            type: "uint256",
          },
          {
            name: "allowed",
            type: "bool",
          },
        ],
      },
      primaryType: "Permit",
      domain: {
        name: this.assetName,
        version: "1",
        chainId: String(this.chainId) || "1",
        verifyingContract: this.asset || ethers.constants.AddressZero,
      },
      message: {
        holder: this.owner,
        spender: contractAddress,
        nonce: this.tokenNonce,
        expiry: this.getExpiry(),
        allowed: "true",
      },
    };
  }
  async sign(
    signer: Wallet & Signer,
    contractAddress?: string
  ): Promise<string> {
    const provider = signer.provider as ethers.providers.JsonRpcProvider;
    const { chainId } = await signer.provider.getNetwork();

    const token = new ethers.Contract(
      this.asset,
      [
        "function DOMAIN_SEPARATOR() view returns (bytes32)",
        "function name() view returns (string)",
        "function nonces(address) view returns (uint256)",
      ],
      signer.provider
    );
    this.assetName = await token.name();
    this.tokenNonce = (
      await token.nonces(await signer.getAddress())
    ).toString();
    console.log(this.assetName, this.tokenNonce);
    try {
      const payload = this.toEIP712(contractAddress, chainId);
      console.log(payload);
      delete payload.types.EIP712Domain;
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
  getRenAssetName() {
    return isZcashAddress(this.destination) ? 'renZEC' : 'renBTC';
  }
  getRenAsset() {
    var deployment_chain =
      CONTROLLER_DEPLOYMENTS[
        ethers.utils.getAddress(this.contractAddress)
      ].toLowerCase();
    deployment_chain =
      deployment_chain == "polygon" ? "matic" : deployment_chain;

    const network = ((v) => (v === "ethereum" ? "mainnet" : v))(
      deployment_chain
    );
    const provider = getVanillaProvider(this);
    const renAsset = new ethers.Contract(
      fixtures[
        ((v) => (v === "mainnet" ? "ethereum" : v))(network).toUpperCase()
      ][this.getRenAssetName()],
      [
        "event Transfer(address indexed from, address indexed to, uint256 amount)",
      ],
      provider
    );
    return renAsset;
  }
  async waitForHostTransaction() {
    const renAsset = this.getRenAsset();
    return await new Promise((resolve, reject) => {
      const filter = renAsset.filters.Transfer(
        this.contractAddress,
        ethers.constants.AddressZero
      );
      const done = (rcpt) => {
        renAsset.off(filter, listener);
        resolve(rcpt);
      };
      const listener = (from, to, amount, evt) => {
        (async () => {
          console.log("evt", evt);
          if (this.asset == ethers.constants.AddressZero) {
            const tx = await evt.getTransaction();
            if (
              tx.from === this.owner &&
              ethers.utils.hexlify(tx.value) ===
                ethers.utils.hexlify(this.amount)
            )
              return done(await evt.getTransactionReceipt());
          } else {
            const receipt = await evt.getTransactionReceipt();
            console.log("receipt", receipt);
            const { logs } = await evt.getTransactionReceipt();
            const decoded = logs
              .map((v) => {
                try {
                  return renAsset.interface.parseLog(v);
                } catch (e) {
                  console.error(e);
                }
              })
              .filter(Boolean);
            const events = logs.map((v, i) => ({ log: v, event: decoded[i] }));
            console.log("events", events);
            if (
              events.find(
                (v) =>
                  v.event.args.from.toLowerCase() ===
                    this.owner.toLowerCase() &&
                  ethers.utils.hexlify(this.amount) ===
                    ethers.utils.hexlify(
                      (v.event.args && v.event.args.amount) || 0
                    )
              )
            )
              return done(receipt);
          }
        })().catch((err) => console.error(err));
      };
      renAsset.on(filter, listener);
    });
  }
  getHandlerForDestinationChain() {
    return isZcashAddress(this.destination) ? ZECHandler : BTCHandler;
  }
  getNormalizedDestinationAddress() {
    if (isZcashAddress(this.destination)) return Buffer.from(ethers.utils.hexlify(this.destination).substr(2), 'hex').toString('utf8'); // implement zcash encoding here
    const arrayed = Array.from(ethers.utils.arrayify(this.destination));
    let address;
    if (arrayed.length > 40) address = Buffer.from(arrayed).toString("utf8");
    else address = ethers.utils.base58.encode(this.destination);
    return address;
  }
  async waitForRemoteTransaction() {
    const { length } = await (this.getHandlerForDestinationChain()).getUTXOs(false, {
      address: this.getNormalizedDestinationAddress(),
      confirmations: 0,
    });
    while (true) {
      try {
        const utxos = await (this.getHandlerForDestinationChain()).getUTXOs(false, {
          address: this.getNormalizedDestinationAddress(),
          confirmations: 0,
        });
        if (utxos.length > length) return utxos[utxos.length - 1];
      } catch (e) {
        console.error(e);
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}
