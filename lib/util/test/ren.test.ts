import { Bitcoin, Ethereum } from '@renproject/chains';
import RenJS from '@renproject/ren';
import { ethers } from 'ethers';
import { computeGatewayAddress } from '../renvm';
import { expect } from 'chai';

import 'mocha';

let ren: RenJS;
let ethereumProvider: {
	provider: ethers.providers.JsonRpcProvider;
	signer: ethers.Wallet;
};

describe('[Ren Utils]', () => {
	beforeEach(async () => {
		ren = new RenJS('testnet', { useV2TransactionFormat: true });
		ethereumProvider = {
			provider: new ethers.providers.JsonRpcProvider(
				'https://eth-kovan.alchemyapi.io/v2/FA67QTTYt3Id7cfmoQLTYvjtgeY6Q3y1',
			),
			signer: ethers.Wallet.createRandom(),
		};
	});

	it('[computeGatewayAddress] should create gateway address', async () => {
		const gwayAddress = await computeGatewayAddress(ren, {
			from: Bitcoin(),
			to: Ethereum(ethereumProvider).Address(ethereumProvider.signer.address),
			asset: 'BTC',
		});
		expect(gwayAddress).to.have.lengthOf(35);
		expect(Bitcoin.utils.addressIsValid(gwayAddress, 'testnet')).to.eql(true);
	});
});
