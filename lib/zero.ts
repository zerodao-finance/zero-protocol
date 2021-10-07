import { BigNumber } from '@ethersproject/bignumber';
import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import type { SignerWithAddress } from 'hardhat-deploy-ethers/dist/src/signers';
import { BigNumberish, ethers } from 'ethers';
import { signTypedDataUtils } from '@0x/utils';
import { EIP712TypedData } from '@0x/types';
import { EIP712_TYPES } from './config/constants';
import RenVM from './util/renvm';
import { computeP } from './util/helpers';
import { createNode, ZeroConnection, ZeroKeeper, ZeroUser } from './p2p';
import { PersistenceAdapter } from './persistence';
import { GatewayAddressInput } from './types';

type ZeroSigner = Wallet & SignerWithAddress & Signer;

export default class TransferRequest {
	public module: string;
	public to: string;
	public underwriter: string;
	public asset: string;
	public nonce: string;
	public pNonce: string;
	public amount: string;
	public data: string;

	constructor(
		module: string,
		to: string,
		underwriter: string,
		asset: string,
		amount: BigNumberish,
		data: string,
		nonce?: BigNumberish,
		pNonce?: BigNumberish,
	) {
		this.module = module;
		this.to = to;
		this.underwriter = underwriter;
		this.asset = asset;
		this.amount = amount.toString();
		this.data = data;
		this.nonce = nonce
			? ethers.utils.formatBytes32String(nonce.toString())
			: ethers.utils.hexlify(ethers.utils.randomBytes(32));
		this.pNonce = pNonce
			? ethers.utils.formatBytes32String(pNonce.toString())
			: ethers.utils.hexlify(ethers.utils.randomBytes(32));
	}

	setUnderwriter(underwriter: string): boolean {
		if (!ethers.utils.isAddress(underwriter)) return false;
		this.underwriter = ethers.utils.getAddress(underwriter);
		return true;
	}

	toEIP712Digest(contractAddress: string, chainId: number = 1): Buffer {
		return signTypedDataUtils.generateTypedDataHash(this.toEIP712(contractAddress, chainId));
	}

	toEIP712(contractAddress: string, chainId: number = 1): EIP712TypedData {
		return {
			types: EIP712_TYPES,
			domain: {
				name: 'ZeroController',
				version: '1',
				chainId: chainId.toString() || '1',
				verifyingContract: contractAddress || ethers.constants.AddressZero,
			},
			message: {
				module: this.module,
				asset: this.asset,
				amount: this.amount.toString(),
				data: this.data,
				underwriter: this.underwriter,
				nonce: this.pNonce.toString(),
			},
			primaryType: 'TransferRequest',
		};
	}

	toGatewayAddress(input: GatewayAddressInput) {
		const renvm = new RenVM(null, {});
		return renvm.computeGatewayAddress({
			mpkh: input.mpkh,
			isTestnet: input.isTest,
			g: {
				p: computeP(this.pNonce, this.module, this.data),
				nonce: this.nonce,
				tokenAddress: this.asset,
				to: input.destination,
			},
		});
	}

	async sign(signer: ZeroSigner, contractAddress: string) {
		const provider = signer.provider as ethers.providers.JsonRpcProvider;
		const { chainId } = await signer.provider.getNetwork();
		try {
			const payload = this.toEIP712(contractAddress, chainId);
			delete payload.types.EIP712Domain;
			return await signer._signTypedData(payload.domain, payload.types, payload.message)
		} catch (e) {
			return await provider.send('eth_signTypedData_v4', [
				await signer.getAddress(),
				this.toEIP712(contractAddress, chainId),
			]);
		}
	}
}

export async function createZeroConnection(address: string): Promise<ZeroConnection> {
	const connOptions = {
		multiaddr: address,
	};
	return await createNode(connOptions);
}

export function createZeroUser(connection: ZeroConnection, persistence?: PersistenceAdapter<any, any>) {
	return new ZeroUser(connection, persistence);
}

export function createZeroKeeper(connection: ZeroConnection) {
	return new ZeroKeeper(connection);
}
