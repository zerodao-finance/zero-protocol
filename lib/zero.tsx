import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { signTypedDataUtils } from '@0x/utils';
import { EIP712_TYPES } from './config/constants';
import RenVM from './util/renvm';
import { computeP } from './util/helpers';

export class TransferRequest {
	public module: any;
	public to: string;
	public underwriter: string;
	public asset: any;
	public nonce: number;
	public pNonce: number;
	public amount: BigNumber;
	public data: any;

	constructor(module, to, underwriter, asset, nonce, pNonce, amount, data) {
		this.module = module;
		this.to = to;
		this.underwriter = underwriter;
		this.asset = asset;
		this.nonce = nonce;
		this.pNonce = pNonce;
		this.amount = amount;
		this.data = data;
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
		const renvm = new RenVM();
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

	async sign(signer: ethers.providers.JsonRpcSigner, contractAddress: string) {
		const { chainId } = await signer.provider.getNetwork();
		try {
			return await signer.provider.send('eth_signTypedData_v4', [
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
