import { getZeroContracts } from '../helpers';
import { ethers } from 'ethers';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
chai.use(chaiAsPromised);
const { expect } = chai;

import sinon from 'sinon';
import 'mocha';

describe.only('[Helper utils]', () => {
	it('[getZeroContracts] should throw if contracts not found', async () => {
		const signer = ethers.Wallet.createRandom().connect(
			new ethers.providers.JsonRpcProvider('https://eth-kovan.alchemyapi.io/v2/FA67QTTYt3Id7cfmoQLTYvjtgeY6Q3y1'),
		);
		const contracts = getZeroContracts(signer);
		expect(contracts).to.be.rejectedWith('No contracts were found on this chain. Please check the provider');
	});

	it('[getZeroContracts] should return contracts', async () => {
		const signer = ethers.Wallet.createRandom().connect(
			new ethers.providers.JsonRpcProvider('https://eth-kovan.alchemyapi.io/v2/FA67QTTYt3Id7cfmoQLTYvjtgeY6Q3y1'),
		);
		sinon.stub(signer.provider, 'getNetwork').returns(
			Promise.resolve({
				chainId: 31337,
				name: 'localhost',
			}),
		);
		const contracts = await getZeroContracts(signer);
		expect(contracts).to.not.be.undefined;
	});
});
