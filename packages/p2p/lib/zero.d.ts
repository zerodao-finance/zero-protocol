import { ZeroConnection } from "./types";
import { Signer } from "@ethersproject/abstract-signer";
export declare function createZeroConnection(signer: Signer, address?: string): Promise<ZeroConnection>;
