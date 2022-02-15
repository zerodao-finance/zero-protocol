// @ts-ignore
import { task } from 'hardhat/config';
import Safe from '@gnosis.pm/safe-core-sdk';
import SafeServiceClient from '@gnosis.pm/safe-service-client';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import { getSigner, getContract } from './util';

const { types } = require("hardhat/config")

//@ts-ignore
task('multisig', 'sends out a multisig proposal')
	.addOptionalParam('data', 'encoded data')
	.addOptionalParam('value', 'encoded data', 0, types.int)
	.addOptionalParam('to', 'to contract')
	.addParam('safe', 'safe address')
	.addOptionalParam('execute', 'execute transaction')
	//@ts-ignore
	.setAction(async ({ to, data, value, safe, execute }, { ethers, network }) => {
		//get api url for gnosis safe service and make client
		const serviceUrl = (() => {
			const networkName = (() => {
				switch (network.name) {
					case 'matic':
						return 'polygon';
					case 'arbitrum':
					case 'mainnet':
					case 'rinkeby':
						return network.name;
					default:
						throw new Error('Network not yet supported on safes');
				}
			})();
			return `https://safe-transaction.${networkName}.gnosis.io`;
		})();
		const safeService = new SafeServiceClient(serviceUrl);
		// fetch contract address
		const contract = await getContract(to, ethers);
		const signer = await getSigner(ethers);
		// init gnosis safe sdk
		const owner = new EthersAdapter({
			ethers,
			signer,
		});
		const safeSdk = await Safe.create({ safeAddress: safe, ethAdapter: owner });
		const safeTx = await safeSdk.createTransaction({ data, to: contract, value });
		const hash = await safeSdk.getTransactionHash(safeTx);
		// sign the transaction and push it to the safe service
		await safeSdk.signTransaction(safeTx);
		await safeService
			.proposeTransaction({
				safeAddress: safe,
				safeTransaction: safeTx,
				safeTxHash: hash,
				senderAddress: await signer.getAddress(),
			})
			.catch(async (e) => {
				// assuming it errors out because of the tx already in the pipeline
				await safeService.confirmTransaction(hash, safeTx.signatures.get(await signer.getAddress())?.data);
			});
		// const tx = await safeSdk.approveTransactionHash(hash)

		if (execute) {
			//making safe contract instance: abi copied from here https://github.com/gnosis/safe-contracts/blob/main/contracts/GnosisSafe.sol
			const safeContract = new ethers.Contract(safe, [
				'getTransactionHash(address,uint256,bytes,uint256,uint256,uint256,uint256,address,address,uint256) returns (bytes32)',
				'execTransaction(address,uint256,bytes,uint256,uint256,uint256,uint256,address,address,bytes) payable returns (bool)',
			]);
			//getting tx stored on their api
			const signedSafeTx = await safeService.getTransaction(hash);

			console.log('safe txhash:', signedSafeTx.transactionHash);
			// TODO: this
			const tx = await safeContract.execTransaction(
				signedSafeTx.to,
				signedSafeTx.value,
				signedSafeTx.data,
				signedSafeTx.operation,
				signedSafeTx.safeTxGas,
				signedSafeTx.baseGas,
				signedSafeTx.gasPrice,
				signedSafeTx.gasToken,
				signedSafeTx.refundReceiver,
				signedSafeTx.signatures,
			);
			const receipt = await tx.wait();
			// print hash
			console.log(receipt.hash);
		}
	});
