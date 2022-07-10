import { ZeroConnection } from "./types";
import { ZeroP2P } from './zerop2p';
import { v4 as uuidv4 } from 'uuid';
import { Signer } from "@ethersproject/abstract-signer";

export async function createZeroConnection(signer: Signer, address?: string): Promise<ZeroConnection> {
	var connOptions = Object.create({ multiaddr: address, signer: signer, password: uuidv4()})
	//@ts-ignore
	//expects libp2p options that will be generated when super() is called on the class
	return await ZeroP2P.fromPassword(connOptions)
}