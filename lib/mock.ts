import { TrivialUnderwriterTransferRequest, createZeroKeeper, TransferRequest } from './zero';
import { ZeroUser } from './p2p/core';
import { ethers } from 'ethers';
import { EventEmitter } from 'events';
const keepers = [];

export const TEST_KEEPER_ADDRESS = '0x12fBc372dc2f433392CC6caB29CFBcD5082EF494';

let keeperSigner;

export const createMockKeeper = async (provider) => {
	const keeper = (createZeroKeeper as any)({ on() {} });
	provider = provider || new ethers.providers.JsonRpcProvider('http://localhost:8545');
	keepers.push(keeper);
	if (!keeperSigner) {
		await provider.send('hardhat_impersonateAccount', [TEST_KEEPER_ADDRESS]);
		keeperSigner = provider.getSigner(TEST_KEEPER_ADDRESS);
	}
	keeper.advertiseAsKeeper = async () => {};
	keeper.setTxDispatcher = async (fn) => {
		(keeper as any)._txDispatcher = fn;
	};
	keeper.setTxDispatcher(async (transferRequest) => {
		const trivial = new TrivialUnderwriterTransferRequest(transferRequest);
		try {
			const loan_result = await trivial.dry(keeperSigner, { from: await keeperSigner.getAddress() });
			console.log('Loan Result', loan_result);
		} catch (err) {
			console.log('ERROR', err);
		}
		const mint = await trivial.submitToRenVM(true);

		await new Promise((resolve, reject) =>
			mint.on('deposit', async (deposit) => {
				await resolve(deposit);
				const hash = await deposit.txHash();
				console.log('hash', hash);
				console.log(await deposit);
				let confirmed = await deposit.confirmed();

				confirmed
					.on('target', (target) => {
						console.log(`0/${target} confirmations`);
					})
					.on('deposit', async (confs, target) => {
						console.log(`${confs}/${target} confirmations`);
						if (confs == 6) {
							await new Promise((resolve, reject) => {
								setTimeout(resolve, 3000);
							});
						}
					});
				let status = await deposit.signed();
				status.on('status', (status) => console.log('status', status));
			}),
		);

		trivial.waitForSignature = async () => {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return {
				amount: ethers.BigNumber.from(trivial.amount).sub(ethers.utils.parseUnits('0.0015', 8)).toString(),
				nHash: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
				signature: ethers.utils.hexlify(ethers.utils.randomBytes(65)),
			};
		};
	});
};

export const enableGlobalMockRuntime = () => {
	ZeroUser.prototype.subscribeKeepers = async function () {
		const me = this
		if (!this.keepers.includes(TEST_KEEPER_ADDRESS)) {
			setTimeout(function () {
				me.keepers.push(TEST_KEEPER_ADDRESS);
				me.emit('keeper', TEST_KEEPER_ADDRESS);
			}, 500);
		}
	};
	TransferRequest.prototype.submitToRenVM = async function (flag) {
		const confirmed = new EventEmitter();
		const gatewayAddress = '39WeCoGbNNk5gVNPx9j4mSrw3tvf1WfRz7';
		let _signed;
		confirmed.on('deposit', (count) => {
			if (count === target) _signed = true;
		});
		const target = 6;
		const timeout = (n) => new Promise((resolve) => setTimeout(resolve, n));
		setTimeout(async () => {
			confirmed.emit('target', target);
			confirmed.emit('confirmation', 0);
			for (let i = 1; i <= 6; i++) {
				await timeout(2000);
				confirmed.emit('deposit', i, target);
			}
		}, 100);
		const txHash = (ethers.utils.randomBytes(32).toString as any)('base64');
		const mint = new EventEmitter();
		const deposit = {
			async txHash() {
				return txHash;
			},
			async confirmed() {
				return confirmed;
			},
			async signed() {
				const ee = new EventEmitter();
				setTimeout(async () => {
					const result = await new Promise((resolve) => {
						if (_signed) return resolve('signed');
						confirmed.on('deposit', (count) => {
							if (count === target) resolve('signed');
						});
					});
					ee.emit('status', result);
				}, 100);
				return ee;
			},
		};
		setTimeout(() => {
			mint.emit('deposit', deposit);
		}, 50);
		(mint as any).gatewayAddress = gatewayAddress;
		return mint;
	};
	ZeroUser.prototype.publishTransferRequest = async function (transferRequest) {
		setTimeout(() => {
			(async () => {
				try {
					Promise.all(keepers.map(async (v) => v._txDispatcher && v._txDispatcher(transferRequest))).catch(
						console.error,
					);
				} catch (e) {
					console.error(e);
				}
			})();
		}, 3000);
	};
};
