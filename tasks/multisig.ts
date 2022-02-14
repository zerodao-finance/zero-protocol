// @ts-ignore
import { task } from 'hardhat/config'
import Safe from '@gnosis.pm/safe-core-sdk'
import SafeServiceClient from '@gnosis.pm/safe-service-client'
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'

const getSigner = async (ethers) => {
    const [signer] = await ethers.getSigners.call(ethers);
    return new ethers.Wallet(
        process.env.WALLET,
        process.env.FORKING === 'true'
            ? signer.provider
            : new ethers.providers.JsonRpcProvider(
                'https://arbitrum-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2',
            ),
    );
};

const getContract = async (to, ethers) => {
    return await (await ethers.getContract(to).then(d => d.address).catch((e) => ethers.utils.getAddress(to)))
}

//@ts-ignore
task("multisig", "sends out a multisig proposal")
    .addOptionalParam("data", "encoded data")
    .addOptionalParam("to", "to contract")
    .addParam("safe", "safe address")
    .addOptionalParam("execute", "execute transaction")
    //@ts-ignore
    .setAction(async ({ to, data, safe, execute }, { ethers, network }) => {
       const serviceUrl = (() => {
           const networkName = (() => {switch(network.name) {
                case 'matic':
                    return
                case 'arbitrum':
           }})()
           return `https://safe-transaction.${networkName}.gnosis.io`
        })()
        const safeService = new SafeServiceClient(serviceUrl)
        const contract = await getContract(to, ethers)
        const signer = await getSigner(ethers)
        const owner = new EthersAdapter({
            ethers,
            signer
        })
        const safeSdk = await Safe.create({ safeAddress: safe, ethAdapter: owner })
        const safeTx = await safeSdk.createTransaction({ data, to: contract, value: "0" })
        const hash = await safeSdk.getTransactionHash(safeTx)
        await safeSdk.signTransaction(safeTx)
        await safeService.proposeTransaction({
            safeAddress: safe,
            safeTransaction: safeTx,
            safeTxHash: hash,
            senderAddress: await signer.getAddress()
        }).catch(async e => {
            await safeService.confirmTransaction(hash, safeTx.signatures.get(await signer.getAddress())?.data)
        })
        // const tx = await safeSdk.approveTransactionHash(hash)

        if (execute) {
            const safeContract = new ethers.Contract(safe, ["getTransactionHash(address,uint256,bytes,uint256,uint256,uint256,uint256,address,address,uint256) returns (bytes32)"])
            const signedSafeTx = await safeService.getTransaction(hash)
            console.log(signedSafeTx)
          // TODO: this
        }

    })
