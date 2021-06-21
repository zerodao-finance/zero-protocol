'use strict';

const hre = require('hardhat');

const {
  ethers,
  deployments
} = hre;
const { expect } = require('chai');

const { override } = require('../lib/test/inject-mock');

const GatewayLogicV1 = require('../artifacts/contracts/test/GatewayLogicV1.sol/GatewayLogicV1');
const BTCGATEWAY_MAINNET_ADDRESS = '0xe4b679400F0f267212D5D812B95f58C83243EE71';
const RENBTC_MAINNET_ADDRESS = '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d';

const getImplementation = async (proxyAddress) => {
  const [ { provider } ] = await ethers.getSigners();
  return ethers.utils.getAddress((await provider.getStorageAt(proxyAddress, '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc')).substr(26));
};

describe('Zero', () => {
  before(async () => {
   const artifact = await deployments.getArtifact('MockGatewayLogicV1');
    const implementationAddress = await getImplementation(BTCGATEWAY_MAINNET_ADDRESS);
   
    override(implementationAddress, artifact.deployedBytecode);
  });
  it('mock should work', async () => {
    const abi = [ 'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)', 'function mintFee() view returns (uint256)' ];
    const { abi: erc20Abi } = await deployments.getArtifact('BTCVault');
    const [ signer ] = await ethers.getSigners();
    const btcGateway = new ethers.Contract(BTCGATEWAY_MAINNET_ADDRESS, abi, signer);
    const renbtc = new ethers.Contract(RENBTC_MAINNET_ADDRESS, erc20Abi, signer);
    const signerAddress = await signer.getAddress();
    await btcGateway.mint(ethers.utils.solidityKeccak256(['bytes'], [ ethers.utils.defaultAbiCoder.encode(['uint256', 'bytes'], [ 0, '0x' ]) ]), ethers.utils.parseUnits('100', 8), ethers.utils.solidityKeccak256(['string'], ['random ninputs']), '0x');
    expect(Number(ethers.utils.formatUnits(await renbtc.balanceOf(signerAddress), 8))).to.be.gt(0);
  });
});
