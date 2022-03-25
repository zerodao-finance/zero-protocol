import { TransferRequest } from '../lib/zero';
import { expect } from 'chai';
import { LevelDBPersistenceAdapter } from '../lib/persistence/leveldb';
const hre = require('hardhat');

const { ethers } = hre;

const randomNonce = () => ethers.utils.hexlify(ethers.utils.randomBytes(32));

describe('leveldb', () => {
  it('should set and get a TransferRequest', async () => {
    const [ signer ] = await ethers.getSigners();
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
      contractAddress: ethers.constants.AddressZero
    });
    await transferRequest.sign(signer);
    process.env.ZERO_PERSISTENCE_DB = '::memory';
    const persistence = new LevelDBPersistenceAdapter();
    const key = await persistence.set(transferRequest);
    const result = await persistence.get(key)
    expect(transferRequest.destination()).to.eql(new TransferRequest(result).destination());
  });
  it('should retrive all TransferRequests', async () => {
    const [ signer ] = await ethers.getSigners();
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
      contractAddress: ethers.constants.AddressZero
    });
    await transferRequest.sign(signer);
    process.env.ZERO_PERSISTENCE_DB = '::memory';
    const persistence = new LevelDBPersistenceAdapter();
    await persistence.set(transferRequest);
    transferRequest.nonce = randomNonce();
    transferRequest.pNonce = randomNonce();
    await transferRequest.sign(signer);
    await persistence.set(transferRequest)
    const requests = await persistence.getAllTransferRequests();
    expect(requests.length).to.eql(2);
  });
});
