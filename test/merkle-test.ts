import hre from 'hardhat';
import { expect } from 'chai'
import { override } from '../lib/test/inject-mock'
import { Wallet, Contract, providers, utils } from 'ethers'
import GatewayLogicV1 from '../artifacts/contracts/test/GatewayLogicV1.sol/GatewayLogicV1.json';
import BTCVault from '../artifacts/contracts/vaults/BTCVault.sol/BTCVault.json'
import { Signer } from '@ethersproject/abstract-signer'

//Import merkle sdk
import MerkleTree from '../lib/merkle/merkle-tree'
import { Buffer } from 'buffer'
import keccak256  from 'keccak256';
import BalanceTree from '../lib/merkle/balance-tree'
import { parseBalanceMap } from '../lib/merkle/parse-balance-map'
// import { zeroDistributor } from '../../zero-app/src/utils/constants';

/**
 * Merkle Airdrop Config
 */


const deployParameters = require('../lib/fixtures')
const network = process.env.CHAIN || 'ETHEREUM'

// @ts-expect-error
const { ethers, deployments } = hre
import { BigNumber } from 'ethers'

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
        return new ethers.Contract(ethers.constants.AddressZero, [], (await ethers.getSigners())[0]);
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
    const [signer, treasury, add1, add2, add3] = await ethers.getSigners();
    const controller = await getContract('ZeroController', signer)
    const { abi: erc20abi } = await deployments.getArtifact('BTCVault');
    const { chainId } = await controller.provider.getNetwork();

    return {
        owner: signer,
        treasury: treasury,
        adrresses: [add1, add2, add3],
        signerAddress: await signer.getAddress(),
        controller: controller,
        btcVault: await getContract('BTCVault', signer),
        zeroToken: await getContract('ZERO', signer),
        zeroDistributor: await getContractFactory('ZeroDistributor', signer),
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
    console.log(typeof address, typeof value)
    console.log(ethers.utils.solidityKeccak256(['address', 'uint256'], [address, value]))
    return Buffer.from(
        ethers.utils
            .solidityKeccak256(['address', 'uint256'], [address, value])
            .slice(2),
        'hex'
    )
}

const gasnow = require('ethers-gasnow')

describe('ZERO', () => {
    var prop;

    // const treasury_address = treasury.address
    const config = {
        decimals: 18,
        airdrop: {
            "0xe32d9D1F1484f57F8b5198f90bcdaBC914de0B5A": "100",
            "0x7f78Da15E8298e7afe6404c54D93cb5269D97570": "100",
            "0xdd2fd4581271e230360230f9337d5c0430bf44c0": "100"
        }
    };
    const config_2: {account: string, amount: BigNumber}[] = [
        {account: "0xe32d9D1F1484f57F8b5198f90bcdaBC914de0B5A", amount: ethers.utils.parseUnits("100", config.decimals)},
        {account: "0x7f78Da15E8298e7afe6404c54D93cb5269D97570", amount: ethers.utils.parseUnits("100", config.decimals)},
        {account: "0xdd2fd4581271e230360230f9337d5c0430bf44c0", amount: ethers.utils.parseUnits("100", config.decimals)}
    ]
    
    const merkleTree = new MerkleTree(
        Object.entries(config.airdrop).map(([address, tokens]) =>
            genLeaf(
            ethers.utils.getAddress(address),
            ethers.utils.parseUnits(tokens.toString(), config.decimals)
            )
        )
    )

    before(async () => {
        await deployments.fixture();
        const { treasury, gateway, zeroToken } = await getFixtures()
        const artifact = await deployments.getArtifact('MockGatewayLogicV1');
        // @ts-ignore
        const implementationAddress = await getImplementation(deployParameters[network]['btcGateway']);
        override(implementationAddress, artifact.deployedBytecode);
        await gateway.mint(utils.randomBytes(32), utils.parseUnits('50', 8), utils.randomBytes(32), '0x');
        // console.log(treasury.address)
        await zeroToken.mint(treasury.address, ethers.utils.parseUnits("88000000.00000000", 18))
        const { zeroDistributor } = await getFixtures() 
        let tree = new BalanceTree(config_2)
        let HexRoot = tree.getHexRoot()
        const distributor = await zeroDistributor.deploy(zeroToken.address, treasury.address, HexRoot) //merkleTree.getHexRoot()
    });

    beforeEach(async function () {
        console.log('\n')
        const { zeroDistributor, zeroToken, treasury } = await getFixtures()
        //@ts-ignore
        console.log('='.repeat(32), 'Beginning Test', '='.repeat(32))
        console.log('Test:', this.currentTest.title, '\n');
        console.log("Treasury Balance: ")
        console.log(ethers.utils.formatUnits(await zeroToken.balanceOf(treasury.address) ,8))
        console.log("Account Balances: ")
        console.log("account1:", ethers.utils.formatUnits(await zeroToken.balanceOf("0xe32d9D1F1484f57F8b5198f90bcdaBC914de0B5A") ,8))
        console.log("account2:", ethers.utils.formatUnits(await zeroToken.balanceOf("0x7f78Da15E8298e7afe6404c54D93cb5269D97570") ,8))
        console.log("account3:", ethers.utils.formatUnits(await zeroToken.balanceOf("0xdd2fd4581271e230360230f9337d5c0430bf44c0") ,8))
    })

    it("should check the before each hook", async () => {

    })
    
    it('should confirm the basic config', async () => {
        const [ owner, treasury, address1, address2, address3 ] = await ethers.getSigners()
        const { zeroDistributor, zeroToken } = await getFixtures()
        const distributor = await zeroDistributor.deploy(zeroToken.address, treasury.address, merkleTree.getHexRoot())
        expect(await zeroToken.owner()).to.equal(owner.address)
        expect(Number(ethers.utils.formatUnits(await zeroToken.balanceOf(treasury.address), 8))).to.equal(880000000000000000)
        expect(await distributor.treasury(), "zero treasury is equal to the treasury").is.equal(treasury.address)
    })

    it('should confirm the merkle root', async () => {
        console.log("merkle root", merkleTree.getHexRoot())

        let tree = Object.entries(config.airdrop).map(([address, tokens]) =>
            genLeaf(
            ethers.utils.getAddress(address),
            ethers.utils.parseUnits(tokens.toString(), config.decimals).toString()
            )
        )

        console.log(tree)
        
    })

    it("should let a white listed address claim zero tokens", async() => {
        const [ owner, treasury, address1, address2, address3 ] = await ethers.getSigners()
        const { zeroDistributor } = await getFixtures() 
        const zeroToken = await ethers.getContract('ZERO', treasury)
        let key = Object.keys(config.airdrop)[0]
        let value = Object.values(config.airdrop)[0].toString()
        let tree = new BalanceTree(config_2)
        let HexRoot = tree.getHexRoot()
        
        const distributor = await zeroDistributor.deploy(zeroToken.address, treasury.address, HexRoot) //merkleTree.getHexRoot()
        await ethers.getSigner(treasury.address)
        // await zeroToken.attach(treasury.address)
        await zeroToken.approve(distributor.address, await zeroToken.balanceOf(treasury.address))
        console.log("allowance", ethers.utils.formatUnits(await zeroToken.allowance(treasury.address, distributor.address), 18))
        await zeroToken.approve(key, ethers.constants.MaxUint256)
        
        console.log('key/value', key, value)
        
        console.log("check if claimed", await distributor.isClaimed(0))


        let leaf = genLeaf(await ethers.utils.getAddress(key), ethers.utils.parseUnits(value, config.decimals))
        console.log("leaf", leaf)
        let proof = tree.getProof(0, key, ethers.utils.parseUnits(value, config.decimals))
        console.log("proof", proof)

        await distributor.claim(0, key, ethers.utils.parseUnits(value, config.decimals).toString(), proof, { gasPrice: 197283674})
        console.log(key, value)
    })

    it("should confirm the claim request", async() => {

    })
})