import { Bitcoin, Ethereum } from '@renproject/chains';
import RenJS from '@renproject/ren';
import { ethers, Wallet } from 'ethers';
import { computeGatewayAddress } from '../renvm';
import { expect } from 'chai';

import 'mocha';

let ren: RenJS;
let signer: Wallet;

describe('[Ren Utils]', () => {
	beforeEach(async () => {
		ren = new RenJS('testnet', { useV2TransactionFormat: true });
		signer = ethers.Wallet.createRandom().connect(
			new ethers.providers.JsonRpcProvider('https://eth-kovan.alchemyapi.io/v2/FA67QTTYt3Id7cfmoQLTYvjtgeY6Q3y1'),
		);
	});

	it('[computeGatewayAddress] should create gateway address', async () => {
		const gwayAddress = await computeGatewayAddress(ren, {
			from: 'btc',
			signer: signer,
			asset: 'BTC',
			data: '0x',
			module: '?',
			pNonce: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
		});
		expect(gwayAddress).to.have.lengthOf(35);
		expect(Bitcoin.utils.addressIsValid(gwayAddress, 'testnet')).to.eql(true);
	});
});
