import BigNumber from '@ethersproject/bignumber';
import { TransferRequest } from '../zero';
import { constants, utils } from 'ethers';
import { computeP, computePHash, computePHashFromP, maybeCoerceToGHash, computeNHash } from '../util/helpers';
import { expect } from 'chai';
import { validate } from 'bitcoin-address-validation';
import 'mocha';

describe('computeP unit test', () => {
	it('has a correct return for computeP', () => {
		const expected =
			'0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000';
		const pReturn = computeP('0x00', '1', constants.AddressZero, '0x00');
		expect(pReturn).to.be.eq(expected);
	});
	it('has a correct return for computePHashFromP', () => {
		const p =
			'0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000';
		const expected = '0xabaf29967fbafb35d97cab780a1333c0583f2ce39b1eaf0c7da0260baf57650d';
		const pHash = computePHashFromP(p);
		expect(pHash).to.be.eq(expected);
	});
	it('has a correct return from computePHash', () => {
		const expected = '0xabaf29967fbafb35d97cab780a1333c0583f2ce39b1eaf0c7da0260baf57650d';
		const pHash = computePHash({ nonce: '1', module: constants.AddressZero, data: '0x00', to: '0x00' });
		expect(pHash).to.be.eq(expected);
	});
	it('converts an object to a ghash', () => {
		const expected = '0x1802dfcb2df77afef24f20ce516bd6ec50cec35aa1ed6359a81fd6d950006902';
		const p =
			'0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000';
		const gHash = maybeCoerceToGHash({
			to: constants.AddressZero,
			tokenAddress: constants.AddressZero,
			p: p,
			nonce: utils.formatBytes32String('1'),
		});
		expect(gHash).to.be.eq(expected);
	});
	it("doesn't modify a ghash passed through", () => {
		const expected = '0x1802dfcb2df77afef24f20ce516bd6ec50cec35aa1ed6359a81fd6d950006902';
		const gHash = maybeCoerceToGHash(expected);
		expect(gHash).to.be.eq(expected);
	});
	it('creates a correct NHash', () => {
		const nHash = computeNHash({
			nonce: utils.formatBytes32String('1'),
			txHash: utils.formatBytes32String('1'),
			vOut: 1,
		});
	});
	it('creates a correct TransferRequest', () => {
		const transferRequest = new TransferRequest({
			asset: constants.AddressZero,
			module: constants.AddressZero,
 			to: constants.AddressZero,
			underwriter: constants.AddressZero,
			amount: '1',
			data: '0x00',
      contractAddress: constants.AddressZero,
      chainId: 1
    });
		expect(transferRequest).to.be.instanceof(TransferRequest);
	});
	it('creates a valid gateway address', async () => {
		const transferRequest = new TransferRequest({
			asset: constants.AddressZero,
			module: constants.AddressZero,
 			to: constants.AddressZero,
			underwriter: constants.AddressZero,
			amount: '1',
			data: '0x00',
      contractAddress: constants.AddressZero,
      chainId: 1
    });
		const gatewayAddress = await transferRequest.toGatewayAddress({
			isTest: true
		});
		const isValidAddress = validate(gatewayAddress);
		expect(isValidAddress).to.be.true;
	});
	it('creates a valid EIP721 response', () => {
		const expected = {
			types: {
				EIP712Domain: [
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'version',
						type: 'string',
					},
					{
						name: 'chainId',
						type: 'uint256',
					},
					{
						name: 'verifyingContract',
						type: 'address',
					},
				],
				TransferRequest: [
					{
						name: 'asset',
						type: 'address',
					},
					{
						name: 'amount',
						type: 'uint256',
					},
					{
						name: 'underwriter',
						type: 'address',
					},
					{
						name: 'module',
						type: 'address',
					},
					{
						name: 'nonce',
						type: 'uint256',
					},
					{
						name: 'data',
						type: 'bytes',
					},
				],
			},
			domain: {
				name: 'ZeroController',
				version: '1',
				chainId: '1',
				verifyingContract: '0x0000000000000000000000000000000000000000',
			},
			message: {
				module: '0x0000000000000000000000000000000000000000',
				asset: '0x0000000000000000000000000000000000000000',
				amount: '1',
				data: '0x00',
				underwriter: '0x0000000000000000000000000000000000000000',
				nonce: '0x3100000000000000000000000000000000000000000000000000000000000000',
			},
			primaryType: 'TransferRequest',
		};
		const transferRequest = new TransferRequest({
			asset: constants.AddressZero,
			module: constants.AddressZero,
 			to: constants.AddressZero,
			underwriter: constants.AddressZero,
			amount: '1',
			data: '0x00',
      contractAddress: constants.AddressZero,
      chainId: 1
    });
		const EIP712 = transferRequest.toEIP712(constants.AddressZero, 1);
		expect(EIP712).to.be.deep.eq(expected);
	});
});
