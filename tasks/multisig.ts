// @ts-ignore
import { task } from 'hardhat/config'
import Safe from '@gnosis.pm/safe-core-sdk'
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
    return await (await ethers.getContract(to).then(d => d.address).catch((e) => to))
}

//@ts-ignore
task("multisig", "sends out a multisig proposal")
    .addOptionalParam("data", "encoded data")
    .addOptionalParam("to", "to contract")
    .addParam("safe", "safe address")
    .addOptionalParam("execute", "execute transaction")
    //@ts-ignore
    .setAction(async ({ to, data, safe, execute }, { ethers }) => {
        const contract = await getContract(to, ethers)
        const signer = await getSigner(ethers)
        const owner = new EthersAdapter({
            ethers,
            signer
        })
        const safeSdk = await Safe.create({ safeAddress: safe, ethAdapter: owner })
        const safeTx = await safeSdk.createTransaction({ data, to: contract, value: "0" })
        const hash = await safeSdk.getTransactionHash(safeTx)
        const tx = await safeSdk.approveTransactionHash(hash)

        console.log("Approving Tx: ", hash)
        console.log(tx)
        if (execute) {
            await safeSdk.executeTransaction(safeTx)
        }

    })
