'use strict';
var __awaiter =
	(this && this.__awaiter) ||
	function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function (resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function (resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
Object.defineProperty(exports, '__esModule', { value: true });
exports.enableGlobalMockRuntime = exports.createMockKeeper = exports.TEST_KEEPER_ADDRESS = void 0;
const zero_1 = require('./zero');
const core_1 = require('./p2p/core');
const ethers_1 = require('ethers');
const events_1 = require('events');
const keepers = [];
exports.TEST_KEEPER_ADDRESS = '0x12fBc372dc2f433392CC6caB29CFBcD5082EF494';
let keeperSigner;
const createMockKeeper = (provider) =>
	__awaiter(void 0, void 0, void 0, function* () {
		const keeper = zero_1.createZeroKeeper({ on() {} });
		provider = provider || new ethers_1.ethers.providers.JsonRpcProvider('http://localhost:8545');
		keepers.push(keeper);
		if (!keeperSigner) {
			yield provider.send('hardhat_impersonateAccount', [exports.TEST_KEEPER_ADDRESS]);
			keeperSigner = provider.getSigner(exports.TEST_KEEPER_ADDRESS);
		}
		keeper.advertiseAsKeeper = () => __awaiter(void 0, void 0, void 0, function* () {});
		keeper.setTxDispatcher = (fn) =>
			__awaiter(void 0, void 0, void 0, function* () {
				keeper._txDispatcher = fn;
			});
		keeper.setTxDispatcher((transferRequest) =>
			__awaiter(void 0, void 0, void 0, function* () {
				const trivial = new zero_1.TrivialUnderwriterTransferRequest(transferRequest);
				try {
					const loan_result = yield trivial.dry(keeperSigner, { from: yield keeperSigner.getAddress() });
					console.log('Loan Result', loan_result);
				} catch (err) {
					console.log('ERROR', err);
				}
				const mint = yield trivial.submitToRenVM(true);
				yield new Promise((resolve, reject) =>
					mint.on('deposit', (deposit) =>
						__awaiter(void 0, void 0, void 0, function* () {
							yield resolve(deposit);
							const hash = yield deposit.txHash();
							console.log('hash', hash);
							console.log(yield deposit);
							let confirmed = yield deposit.confirmed();
							confirmed
								.on('target', (target) => {
									console.log(`0/${target} confirmations`);
								})
								.on('deposit', (confs, target) =>
									__awaiter(void 0, void 0, void 0, function* () {
										console.log(`${confs}/${target} confirmations`);
										if (confs == 6) {
											yield new Promise((resolve, reject) => {
												setTimeout(resolve, 3000);
											});
										}
									}),
								);
							let status = yield deposit.signed();
							status.on('status', (status) => console.log('status', status));
						}),
					),
				);
				trivial.waitForSignature = () =>
					__awaiter(void 0, void 0, void 0, function* () {
						yield new Promise((resolve) => setTimeout(resolve, 1000));
						return {
							amount: ethers_1.ethers.BigNumber.from(trivial.amount)
								.sub(ethers_1.ethers.utils.parseUnits('0.0015', 8))
								.toString(),
							nHash: ethers_1.ethers.utils.hexlify(ethers_1.ethers.utils.randomBytes(32)),
							signature: ethers_1.ethers.utils.hexlify(ethers_1.ethers.utils.randomBytes(65)),
						};
					});
			}),
		);
	});
exports.createMockKeeper = createMockKeeper;
const enableGlobalMockRuntime = () => {
	core_1.ZeroUser.prototype.subscribeKeepers = function () {
		const me = this;
		return __awaiter(this, void 0, void 0, function* () {
			if (!me.keepers.includes(exports.TEST_KEEPER_ADDRESS)) {
				setTimeout(function () {
					me.keepers.push(exports.TEST_KEEPER_ADDRESS);
					me.emit('keeper', exports.TEST_KEEPER_ADDRESS);
				}, 500);
			}
		});
	};
	zero_1.TransferRequest.prototype.submitToRenVM = function (flag) {
		return __awaiter(this, void 0, void 0, function* () {
			const confirmed = new events_1.EventEmitter();
			const gatewayAddress = '39WeCoGbNNk5gVNPx9j4mSrw3tvf1WfRz7';
			let _signed;
			confirmed.on('deposit', (count) => {
				if (count === target) _signed = true;
			});
			const target = 6;
			const timeout = (n) => new Promise((resolve) => setTimeout(resolve, n));
			setTimeout(
				() =>
					__awaiter(this, void 0, void 0, function* () {
						confirmed.emit('target', target);
						confirmed.emit('deposit', 0);
						for (let i = 1; i <= 6; i++) {
							yield timeout(2000);
							confirmed.emit('deposit', i, target);
						}
					}),
				100,
			);
			const txHash = ethers_1.ethers.utils.randomBytes(32).toString('base64');
			const mint = new events_1.EventEmitter();
			const deposit = {
				txHash() {
					return __awaiter(this, void 0, void 0, function* () {
						return txHash;
					});
				},
				confirmed() {
					return __awaiter(this, void 0, void 0, function* () {
						return confirmed;
					});
				},
				signed() {
					return __awaiter(this, void 0, void 0, function* () {
						const ee = new events_1.EventEmitter();
						setTimeout(
							() =>
								__awaiter(this, void 0, void 0, function* () {
									const result = yield new Promise((resolve) => {
										if (_signed) return resolve('signed');
										confirmed.on('deposit', (count) => {
											if (count === target) resolve('signed');
										});
									});
									ee.emit('status', result);
								}),
							100,
						);
						return ee;
					});
				},
			};
			setTimeout(() => {
				mint.emit('deposit', deposit);
			}, 50);
			mint.gatewayAddress = gatewayAddress;
			return mint;
		});
	};
	core_1.ZeroUser.prototype.publishTransferRequest = function (transferRequest) {
		return __awaiter(this, void 0, void 0, function* () {
			setTimeout(() => {
				(() =>
					__awaiter(this, void 0, void 0, function* () {
						try {
							Promise.all(
								keepers.map((v) =>
									__awaiter(this, void 0, void 0, function* () {
										return v._txDispatcher && v._txDispatcher(transferRequest);
									}),
								),
							).catch(console.error);
						} catch (e) {
							console.error(e);
						}
					}))();
			}, 3000);
		});
	};
};
exports.enableGlobalMockRuntime = enableGlobalMockRuntime;
