'use strict';

const hre = require('hardhat');
const { createTransferRequest } = require('../lib/zero');
const { abi: IUniswapV2Router02 } = require('../artifacts/@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol/IUniswapV2Router02.json')

const {
  ethers,
  deployments
} = hre;
const { expect, assert } = require('chai');

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
  it('should be able to launch an underwriter', async () => {
    const [signer] = await ethers.getSigners();
    const lock = await setupUnderwriter(signer);
  });
  it('should deposit in vault', async () => {
    const [ signer ] = await ethers.getSigners();
    const lock = await setupUnderwriter(signer);

    const { abi: erc20abi } = await deployments.getArtifact('BTCVault')
    const renbtc = new ethers.Contract(RENBTC_MAINNET_ADDRESS, erc20abi, signer);

    const BTCVault = await ethers.getContract('BTCVault', signer)
    const signerAddress = await signer.getAddress();

    const beforeBalance = (await renbtc.balanceOf(BTCVault.address)).toNumber() / await renbtc.decimals();
    const addedAmount = 10;
    await BTCVault.deposit(addedAmount * await renbtc.decimals());
    const afterBalance = (await renbtc.balanceOf(BTCVault.address)).toNumber() / await renbtc.decimals();

    assert(beforeBalance + addedAmount == afterBalance, 'Balances not adding up');
  });
  it('should transfer overflow funds to strategy vault', async () => {
    const [ signer ] = await ethers.getSigners();
    await setupUnderwriter(signer);
    const { abi: erc20abi } = await deployments.getArtifact('BTCVault');
    const signerAddress = await signer.getAddress();

    const renbtc = new ethers.Contract(RENBTC_MAINNET_ADDRESS, erc20abi, signer);
    const decimals = await renbtc.decimals();

    const BTCVault = await ethers.getContract('BTCVault', signer)
    const Controller = await ethers.getContract('ZeroController', signer)
    const Strategy = await ethers.getContract('StrategyRenVM', signer)
    const StrategyVault = new ethers.Contract('0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E', erc20abi, signer)

    const getBalances = async () => {
      const vaultBalance = (await renbtc.balanceOf(BTCVault.address)).toNumber() / decimals;
      const controllerBalance = (await renbtc.balanceOf(Controller.address)).toNumber() / decimals;
      const strategyBalance = (await renbtc.balanceOf(Strategy.address)).toNumber() / decimals;
      const strategyVaultBalance = (await Strategy.balanceOf()).toNumber() / decimals;
      console.log("Vault Balance:", vaultBalance);
      console.log("Controller Balance:", controllerBalance);
      console.log("Strategy Balance", strategyBalance);
      console.log("Strategy-Vault Balance:", strategyVaultBalance);
    }

    console.log("Strategy wants", await Strategy.want());

    await getBalances();
    await BTCVault.earn();
    console.log("Called BTCVault.earn()");
    await getBalances();
  });
  it('should make a swap', async () => {
    const [ signer ] = await ethers.getSigners();
    const lock = await setupUnderwriter(signer);
    
    const Controller = await ethers.getContract('ZeroController', signer);
    const BTCVault = await ethers.getContract('BTCVault', signer)
  
    const SushiswapRouter = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';
    
  
    await BTCVault.earn();
    const transferRequest = createTransferRequest({
      module: "Swap",
      to: await signer.getAddress(),
      nonce: '0x' + ethers.utils.randomBytes(32).toString('hex'),
      pNonce: '0x' + ethers.utils.randomBytes(32).toString('hex'),
      amount: 100,
      data: '0x'
    });
  
    transferRequest.setUnderwriter(lock)
    await transferRequest.sign(signer, SushiswapRouter);
  
  })
});


