import { TransferRequest } from './TransferRequest';
import {MetaRequest} from './MetaRequest'
import { Contract } from '@ethersproject/contracts';

export class UnderwriterTransferRequest extends TransferRequest {
	async getController(signer) {
		console.log('getting controller');
		const underwriter = this.getUnderwriter(signer);
		console.log('got underwriter');
		return new Contract(
			await underwriter.controller(),
			[
				'function fallbackMint(address underwriter, address to, address asset, uint256 amount, uint256 actualAmount, uint256 nonce, address module, bytes32 nHash, bytes data, bytes signature)',
			],
			signer,
		);
	}
	async fallbackMint(signer, params = {}) {
		const controller = await this.getController(signer);
		const queryTxResult = await this.waitForSignature();
		console.log(this.destination());
		return await controller.fallbackMint(
			this.underwriter,
			this.destination(),
			this.asset,
			this.amount,
			queryTxResult.amount,
			this.pNonce,
			this.module,
			queryTxResult.nHash,
			this.data,
			queryTxResult.signature,
			params,
		);
	}
	getUnderwriter(signer) {
		return new Contract(
			this.underwriter,
			[
				'function controller() view returns (address)',
				'function repay(address, address, address, uint256, uint256, uint256, address, bytes32, bytes, bytes)',
				'function loan(address, address, uint256, uint256, address, bytes, bytes)',
				'function meta(address, address, address, uint256, bytes, bytes)',
			],
			signer,
		);
	}
	async loan(signer, params = {}) {
		const underwriter = this.getUnderwriter(signer);
		return await underwriter.loan(...this.getFuncParams('loan'), params);
	}
	getFuncParams(func: 'loan' | 'meta') {
		switch (func) {
			case 'loan':
				return [
					this.destination(),
					this.asset,
					this.amount,
					this.pNonce,
					this.module,
					this.data,
					this.signature,
				];
			case 'meta':
                //@ts-expect-error
				return [this.addressFrom, this.asset, this.module, this.pNonce, this.data, this.signature];
		}
	}
	async dry(signer, params = {}, func: 'loan' | 'meta' = 'loan') {
		const underwriter = this.getUnderwriter(signer);
		console.log('about to callstatic');
		return await underwriter.callStatic[func](...this.getFuncParams(func), params);
	}
	async repay(signer, params = {}) {
		const underwriter = this.getUnderwriter(signer);
		const { amount: actualAmount, nHash, signature } = await this.waitForSignature();
		return await underwriter.repay(
			this.underwriter,
			this.destination(),
			this.asset,
			this.amount,
			actualAmount,
			this.pNonce,
			this.module,
			nHash,
			this.data,
			signature,
			params,
		);
	}
}

export class  UnderwriterMetaRequest extends MetaRequest {
    getFuncParams(...params: any) {
        return UnderwriterTransferRequest.prototype.getFuncParams.call(this, ...params)
    }
    dry(...params: any) {
        return UnderwriterTransferRequest.prototype.dry.call(this, ...params)
    }
    getController(...params: any) {
        return UnderwriterTransferRequest.prototype.getController.call(this, ...params)
    }
    getUnderwriter(...params: any) {
        return UnderwriterTransferRequest.prototype.getUnderwriter.call(this, ...params)
    }
}
