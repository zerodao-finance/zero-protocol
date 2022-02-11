import hre from 'hardhat';
import { expect } from 'chai'
import { override } from '../lib/test/inject-mock'
import { Wallet, Contract, providers, utils } from 'ethers'
import GatewayLogicV1 from '../artifacts/contracts/test/GatewayLogicV1.sol/GatewayLogicV1.json';
import BTCVault from '../artifacts/contracts/vaults/BTCVault.sol/BTCVault.json'
import { Signer } from '@ethersproject/abstract-signer'

//Import merkle sdk
import MerkleTree from '../lib/merkle/merkle-tree'
import BalanceTree from '../lib/merkle/balance-tree'
// import { zeroDistributor } from '../../zero-app/src/utils/constants';

/**
 * Merkle Airdrop Config
 */
const config = {
    decimals: 18,
    airdrop: {
      "0xe32d9D1F1484f57F8b5198f90bcdaBC914de0B5A": "100",
      "0x7f78Da15E8298e7afe6404c54D93cb5269D97570": "100",
      "0xdd2fd4581271e230360230f9337d5c0430bf44c0": "100"
    }
  };

const deployParameters = require('../lib/fixtures')
const network = process.env.CHAIN || 'ETHEREUM'

// @ts-expect-error
const { ethers, deployments } = hre

//TODO: validate deployment of all contracts
//TODO: mint zBTC and test balance of all contracts
//TODO: test adding address to merkle sdk and creating Merkle Contract
//TODO: mint to all Merkle valid addresses
//TODO: check balances of merkle valid addresses

const getContract = async (...args: any[]) => {
    try {
        return (await ethers.getContract(...args));
    } catch (e) {
        console.error(e)
        return new ethers.Contract(ethers.constants.AddressZero, [], (await ethers.getSigner ())[0]);
    }
};

const getContractFactory = async (...args: any[]) => {
    try {
       return ( await ethers.getContractFactory(...args)) 
    } catch (e) {
        return new ethers.ContractFactory('0x', [], (await ethers.getSigners())[0]);
    }
};

const getImplementation = async (proxyAddress: string) => {
	const [{ provider }] = await ethers.getSigners();
	return utils.getAddress(
		(
			await provider.getStorageAt(
				proxyAddress,
				'0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
			)
		).substr((await provider.getNetwork()).chainId === 1337 ? 0 : 26),
	);
};


const getFixtures = async () => {
    const [signer] = await ethers.getSigners();
    const controller = await getContract('ZeroController', signer)
    const { abi: erc20abi } = await deployments.getArtifact('BTCVault');
    const { chainId } = await controller.provider.getNetwork();

    return {
        signer: signer,
        signerAddress: await signer.getAddress(),
        controller: controller,
        btcVault: await getContract('BTCVault', signer),
        zeroToken: await getContract('ZERO', signer),
        zeroDistributor: await getContract('ZeroDistributor', signer),
        renBTC: new Contract(deployParameters[network]['renBTC'], GatewayLogicV1.abi, signer),
        //@ts-ignore
        gateway: new Contract(deployParameters[network]['btcGateway'], GatewayLogicV1.abi, signer)
    }
}

const getBalances = async () => {
    return;
}

/**
 * Merkle Airdrop Client Functions
 */

function genLeaf (address, value) {
    return Buffer.from(
        ethers.utils
            .solidityKeccak256(['address', 'uint256', [address, value]])
            .slice(2),
        'hex'
    )
}

const gasnow = require('ethers-gasnow')
describe('ZERO', () => {
    var prop;
    before(async () => {
        await deployments.fixture();
        const artifact = await deployments.getArtifact('MockGatewayLogicV1');
        // @ts-ignore
        const implementationAddress = await getImplementation(deployParameters[network]['btcGateway']);
        override(implementationAddress, artifact.deployedBytecode);
        const { gateway } = await getFixtures();
        await gateway.mint(utils.randomBytes(32), utils.parseUnits('50', 8), utils.randomBytes(32), '0x');
    });

    beforeEach(async function () {
        console.log('\n')
        //@ts-ignore
        console.log('='.repeat(32), 'Beginning Test', '='.repeat(32))
        console.log('Test:', this.currentTest.title, '\n');
        console.log('Initial Balances:')
        await getBalances()
    })
    // it('mock gateway should work', async () => {
	// 	const abi = [
	// 		'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
	// 		'function mintFee() view returns (uint256)',
	// 	];
	// 	const { abi: erc20Abi } = await deployments.getArtifact('BTCVault');
	// 	const [signer] = await ethers.getSigners();
	// 	const signerAddress = await signer.getAddress();
	// 	//@ts-ignore
	// 	const btcGateway = new ethers.Contract(deployParameters[network]['btcGateway'], abi, signer);
	// 	//@ts-ignore
	// 	const renbtc = new ethers.Contract(deployParameters[network]['renBTC'], erc20Abi, signer);
	// 	await btcGateway.mint(
	// 		ethers.utils.solidityKeccak256(
	// 			['bytes'],
	// 			[ethers.utils.defaultAbiCoder.encode(['uint256', 'bytes'], [0, '0x'])],
	// 		),
	// 		ethers.utils.parseUnits('50', 8),
	// 		ethers.utils.solidityKeccak256(['string'], ['random ninputs']),
	// 		'0x',
	// 	);
	// 	expect(Number(ethers.utils.formatUnits(await renbtc.balanceOf(signerAddress), 8))).to.be.gt(0);
	// });
    it('should do basic set up of deployed contracts', async () => {
        const { zeroToken, zeroDistributor } = await getFixtures()
        let treasury = await zeroDistributor.treasury()
        await zeroToken.mint( treasury, ethers.utils.parseUnits("88000000.00000000", 8))
    })
    
    it('should confirm the basic config', async () => {
        const [ owner ] = await ethers.getSigners()
        const { zeroDistributor, zeroToken } = await getFixtures()
        let treasury = await zeroDistributor.treasury()
        console.log(ethers.utils.formatUnits(await zeroToken.balanceOf(treasury), 8))
        expect(Number(ethers.utils.formatUnits(await zeroToken.balanceOf(treasury), 8))).to.equal(88000000)
        expect(await zeroToken.owner()).to.equal(owner.address)
    })

    it("should build a merkle tree from the test config and try to claim tokens", async () => {
        const merkleTree = new MerkleTree(
            Object.entries(config.airdrop).map(([address, tokens]) =>
              genLeaf(
                ethers.utils.getAddress(address),
                ethers.utils.parseUnits(tokens.toString(), config.decimals).toString()
              )
            )
          );
          
    })
})