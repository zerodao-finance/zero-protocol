'use strict';

const hre = require('hardhat');

const {
  ethers,
  deployments
} = hre;
const { expect } = require('chai');

const { override } = require('../lib/test/inject-mock');

const GatewayLogicV1 = require('../artifacts/contracts/test/GatewayLogicV1.sol/GatewayLogicV1');
const BTCVault = require('../artifacts/contracts/vaults/BTCVault.sol/BTCVault');
const BTCGATEWAY_MAINNET_ADDRESS = '0xe4b679400F0f267212D5D812B95f58C83243EE71';
const RENBTC_MAINNET_ADDRESS = '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d';
const STRATEGY_ADDRESS = '0x36C02dA8a0983159322a80FFE9F24b1acfF8B570';
const CONTROLLER_ADDRESS = '0x0E801D84Fa97b50751Dbf25036d067dCf18858bF';

const getImplementation = async (proxyAddress) => {
  const [{ provider }] = await ethers.getSigners();
  return ethers.utils.getAddress((await provider.getStorageAt(proxyAddress, '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc')).substr(26));
};

const ZeroUnderwriterLock = require('../artifacts/contracts/underwriter/ZeroUnderwriterLock.sol/ZeroUnderwriterLock');

const setupUnderwriter = async (signer, amountOfRenBTC = '100') => {
  const vault = (await ethers.getContract('BTCVault')).connect(signer);
  const renbtcGateway = getGateway(signer);
  await renbtcGateway.mint(ethers.utils.randomBytes(32), ethers.utils.parseUnits(amountOfRenBTC, 8), ethers.utils.randomBytes(32), '0x');
  const underwriterFactory = (await ethers.getContractFactory('TrivialUnderwriter')).connect(signer);
  const controller = await ethers.getContract('ZeroController');
  const { address: underwriterAddress } = await underwriterFactory.deploy(controller.address);
  const renbtc = getRenBTC(signer);
  await renbtc.approve(vault.address, ethers.constants.MaxUint256);
  await vault.deposit(ethers.utils.parseUnits(amountOfRenBTC, 8));
  const from = await signer.getAddress();
  await vault.approve(controller.address, await vault.balanceOf(from));
  await controller.mint(underwriterAddress, vault.address);
  const lock = await controller.lockFor(underwriterAddress);
  return new ethers.Contract(lock, ZeroUnderwriterLock.abi, signer);
};

const getGateway = (signer) => {
  return new ethers.Contract(BTCGATEWAY_MAINNET_ADDRESS, GatewayLogicV1.abi, signer);
};

const getRenBTC = (signer) => {
  return new ethers.Contract(RENBTC_MAINNET_ADDRESS, BTCVault.abi, signer);
};

describe('Zero', () => {
  before(async () => {
    await deployments.fixture();
    const artifact = await deployments.getArtifact('MockGatewayLogicV1');
    const implementationAddress = await getImplementation(BTCGATEWAY_MAINNET_ADDRESS);

    override(implementationAddress, artifact.deployedBytecode);
  });
  it('mock should work', async () => {
    const abi = ['function mint(bytes32, uint256, bytes32, bytes) returns (uint256)', 'function mintFee() view returns (uint256)'];
    const { abi: erc20Abi } = await deployments.getArtifact('BTCVault');
    const [signer] = await ethers.getSigners();
    const btcGateway = new ethers.Contract(BTCGATEWAY_MAINNET_ADDRESS, abi, signer);
    const renbtc = new ethers.Contract(RENBTC_MAINNET_ADDRESS, erc20Abi, signer);
    const signerAddress = await signer.getAddress();
    await btcGateway.mint(ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.defaultAbiCoder.encode(['uint256', 'bytes'], [0, '0x'])]), ethers.utils.parseUnits('100', 8), ethers.utils.solidityKeccak256(['string'], ['random ninputs']), '0x');
    expect(Number(ethers.utils.formatUnits(await renbtc.balanceOf(signerAddress), 8))).to.be.gt(0);
  });
  it('should add a strategy', async () => {
    const [signer] = await ethers.getSigners();

    const { abi: erc20Abi } = await deployments.getArtifact('BTCVault');
    const { abi: controllerABI } = await deployments.getArtifact('ZeroController');
    const { abi: strategyABI } = await deployments.getArtifact('StrategyRenVM');

    const lock = await setupUnderwriter(signer);
    const btcGateway = new ethers.Contract(BTCGATEWAY_MAINNET_ADDRESS, erc20Abi, signer);
    const renbtc = new ethers.Contract(RENBTC_MAINNET_ADDRESS, erc20Abi, signer);

    const strategy = new ethers.Contract(STRATEGY_ADDRESS, strategyABI, signer)
    const controller = new ethers.Contract(CONTROLLER_ADDRESS, controllerABI, signer)



    console.log('Initialized strategy in controller.')

  })
  it('should be able to launch an underwriter', async () => {
    const [signer] = await ethers.getSigners();
    const lock = await setupUnderwriter(signer);
    console.log(lock.address);
  });
});
