import { TransferRequest, BurnRequest } from '../lib/zero';
import { expect } from 'chai';
import { LevelDBPersistenceAdapter } from '../lib/persistence/leveldb';
import * as fixtures from '../lib/fixtures';
const hre = require('hardhat');

const { ethers } = hre;

const randomNonce = () => ethers.utils.hexlify(ethers.utils.randomBytes(32));

describe('leveldb', () => {
	it('should set and get a TransferRequest', async () => {
		const [signer] = await ethers.getSigners();
		const { chainId } = await signer.provider.getNetwork();
		const transferRequest = new TransferRequest({
			to: await signer.getAddress(),
			amount: ethers.utils.parseUnits('0.05', 8),
			asset: ethers.constants.AddressZero,
			nonce: randomNonce(),
			chainId,
			pNonce: randomNonce(),
			data: '0x',
			module: ethers.constants.AddressZero,
			underwriter: ethers.constants.AddressZero,
			contractAddress: ethers.constants.AddressZero,
		});
		await transferRequest.sign(signer);
		process.env.ZERO_PERSISTENCE_DB = '::memory';
		const persistence = new LevelDBPersistenceAdapter();
		const key = await persistence.set(transferRequest);
		const result = await persistence.get(key);
		expect(transferRequest.destination()).to.eql(new TransferRequest(result).destination());
	});
	it('should retrive all TransferRequests', async () => {
		const [signer] = await ethers.getSigners();
		const { chainId } = await signer.provider.getNetwork();
		const transferRequest = new TransferRequest({
			to: await signer.getAddress(),
			amount: ethers.utils.parseUnits('0.05', 8),
			asset: ethers.constants.AddressZero,
			nonce: randomNonce(),
			chainId,
			pNonce: randomNonce(),
			data: '0x',
			module: ethers.constants.AddressZero,
			underwriter: ethers.constants.AddressZero,
			contractAddress: ethers.constants.AddressZero,
		});
		await transferRequest.sign(signer);
		process.env.ZERO_PERSISTENCE_DB = '::memory';
		const persistence = new LevelDBPersistenceAdapter();
		await persistence.set(transferRequest);
		transferRequest.nonce = randomNonce();
		transferRequest.pNonce = randomNonce();
		await transferRequest.sign(signer);
		await persistence.set(transferRequest);
		const requests = await persistence.getAllTransferRequests();
		expect(requests.length).to.eql(2);
	});
	it('should store and differentiate between burn/transferrequests', async () => {
		const [signer] = await ethers.getSigners();
		const asset = fixtures[process.env.CHAIN].renBTC;
		BurnRequest.prototype.sign = async function(signer, contractAddress) {
			this.signature = ethers.utils.hexlify(ethers.utils.randomBytes(64))
			return this.signature
		}
		const { chainId } = await signer.provider.getNetwork();
		const burnRequest = new BurnRequest({
			owner: await signer.getAddress(),
			amount: ethers.utils.parseUnits('0.05', 8),
			deadline: ethers.utils.hexlify(Math.floor((+new Date() + 10000) / 1000)),
			asset,
			destination: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
			underwriter: ethers.constants.AddressZero,
			chainId,
			contractAddress: ethers.constants.AddressZero,
		});
		await burnRequest.sign(signer);
		process.env.ZERO_PERSISTENCE_DB = '::memory';
		const persistence = new LevelDBPersistenceAdapter();
		await persistence.set(burnRequest);
		burnRequest.amount = ethers.utils.parseUnits('0.04', 8);
		await burnRequest.sign(signer, ethers.constants.AddressZero);
		await persistence.set(burnRequest);
		let requests = await persistence.getAllTransferRequests();
		expect(requests.length).to.eql(2);

		const transferRequest = new TransferRequest({
			to: await signer.getAddress(),
			amount: ethers.utils.parseUnits('0.05', 8),
			asset: ethers.constants.AddressZero,
			nonce: randomNonce(),
			chainId,
			pNonce: randomNonce(),
			data: '0x',
			module: ethers.constants.AddressZero,
			underwriter: ethers.constants.AddressZero,
			contractAddress: ethers.constants.AddressZero,
		});
		await transferRequest.sign(signer);
		await persistence.set(transferRequest)
		requests = await persistence.getAllTransferRequests();
		expect(requests.length).to.eql(3)
		expect(requests.map(d => d.requestType)).to.include.members(['transfer', 'burn'])
	});
});
