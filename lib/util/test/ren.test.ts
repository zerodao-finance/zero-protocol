import { Bitcoin, Ethereum } from '@renproject/chains';
import RenJS from '@renproject/ren';
import { generateGHash, fromHex } from '@renproject/utils';
import hre from 'hardhat';
// @ts-expect-error
const hardhatEthers = hre.ethers;
import { ethers, Wallet } from 'ethers';
import { computeGatewayAddress } from '../renvm';
import { expect } from 'chai';

import 'mocha';

let ren: RenJS;
let signer: Wallet;

describe.only('[Ren Utils]', () => {
	// beforeEach(async () => {
	// 	ren = new RenJS('testnet', { useV2TransactionFormat: true });
	// 	[signer] = await hardhatEthers.getSigners();
	// });

	// it('[computeGatewayAddress] should create gateway address', async () => {
	// 	const gwayAddress = await computeGatewayAddress(ren, {
	// 		from: 'btc',
	// 		signer: signer,
	// 		asset: 'BTC',
	// 		data: '0x',
	// 		module: '?',
	// 		to: ethers.constants.AddressZero,
	// 		pNonce: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
	// 	});
	// 	expect(gwayAddress).to.have.lengthOf(35);
	// 	expect(Bitcoin.utils.addressIsValid(gwayAddress, 'testnet')).to.eql(true);
	// });

	it('test', async () => {
		ren = new RenJS('testnet', { useV2TransactionFormat: true });
		[signer] = await hardhatEthers.getSigners();
		const gHash = generateGHash(
			[],
			ethers.constants.AddressZero,
			ethers.constants.AddressZero,
			fromHex('0x1212'),
			true,
		);
		const btc = Bitcoin('testnet');
		const gPubKey = await ren.renVM.selectPublicKey(
			ren.renVM.selector({
				asset: btc.asset,
				from: btc,
				to: Ethereum({ provider: signer.provider, signer }),
			}),
			btc.name,
		);
		const gatewayAddress = btc.getGatewayAddress(btc.asset, gPubKey, gHash);
		console.log(gatewayAddress);
	});
});
