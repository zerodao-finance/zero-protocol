import BigNumber from 'bignumber.js';
import type { SignerWithAddress } from 'hardhat-deploy-ethers/dist/src/signers';
import { ethers } from 'ethers';
import { signTypedDataUtils } from '@0x/utils';
import { EIP712_TYPES } from './config/constants';
import RenVM from './util/renvm';
import { computeP } from './util/helpers';

export class TransferRequest {
	public module: string;
	public to: string;
	public underwriter: string;
	public asset: string;
	public nonce: number;
	public pNonce: number;
	public amount: string;
	public data: any;

	constructor(module, to, underwriter, asset, amount, data, nonce?, pNonce?) {
		this.module = module;
		this.to = to;
		this.underwriter = underwriter;
		this.asset = asset;
		this.amount = amount;
		this.data = data;
		this.nonce = nonce ?? ethers.utils.hexlify(ethers.utils.randomBytes(32));
		this.pNonce = pNonce ?? ethers.utils.hexlify(ethers.utils.randomBytes(32));
	}

	setUnderwriter(underwriter: string): boolean {
		if (!ethers.utils.isAddress(underwriter)) return false;
		this.underwriter = ethers.utils.getAddress(underwriter);
		return true;
	}

	toEIP712Digest(contractAddress, chainId: number = 1) {
		return signTypedDataUtils.generateTypedDataHash(this.toEIP712(contractAddress, chainId));
	}

	toEIP712(contractAddress: string, chainId: number = 1) {
		return {
			types: EIP712_TYPES,
			domain: {
				name: 'ZeroController',
				version: '1',
				chainId: chainId || '1',
				verifyingContract: contractAddress || ethers.constants.AddressZero,
			},
			message: {
				module: this.module,
				asset: this.asset,
				amount: this.amount.toString(),
				data: this.data,
				underwriter: this.underwriter,
				nonce: this.pNonce,
			},
			primaryType: 'TransferRequest',
		};
	}

	toGatewayAddress({ mpkh, isTest }) {
		const renvm = new RenVM(null, {});
		return renvm.computeGatewayAddress({
			mpkh: mpkh,
			isTestnet: isTest,
			g: {
				p: computeP(this.pNonce, this.data),
				nonce: this.nonce,
				tokenAddress: this.asset,
				to: this.module,
			},
		});
	}

	async sign(signer: SignerWithAddress, contractAddress: string) {
		const provider = signer.provider as ethers.providers.JsonRpcProvider;
		const { chainId } = await signer.provider.getNetwork();
		try {
			return await provider.send('eth_signTypedData_v4', [
				await signer.getAddress(),
				this.toEIP712(contractAddress, chainId),
			]);
		} catch (e) {
			console.error(e);
			// in case this is not available in the signer
			return await signer.signMessage(ethers.utils.hexlify(this.toEIP712Digest(contractAddress, chainId)));
		}
	}
}

export const createTransferRequest = (
	module: string,
	to: string,
	asset: string,
	underwriter: string,
	amount: string,
	data: string,
	nonce?: string,
	pNonce?: string,
) => {
	return new TransferRequest(
		(module = module),
		(to = to),
		(underwriter = underwriter),
		(asset = asset),
		(amount = amount),
		(data = data),
		(nonce = nonce ?? null),
		(pNonce = pNonce ?? null),
	);
};
