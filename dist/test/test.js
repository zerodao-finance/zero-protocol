"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = __importDefault(require("hardhat"));
const zero_1 = require("../lib/zero");
const chai_1 = require("chai");
const inject_mock_1 = require("../lib/test/inject-mock");
const GatewayLogicV1_json_1 = __importDefault(require("../artifacts/contracts/test/GatewayLogicV1.sol/GatewayLogicV1.json"));
const ethers_1 = require("ethers");
// @ts-expect-error
const { ethers, deployments } = hardhat_1.default;
const gasnow = require('ethers-gasnow');
const deployParameters = require('../lib/fixtures');
const network = process.env.CHAIN || 'MATIC';
ethers.providers.BaseProvider.prototype.getGasPrice = gasnow.createGetGasPrice('rapid');
const USDC_MAINNET_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const toAddress = (contractOrAddress) => contractOrAddress.address || contractOrAddress;
const mintRenBTC = (amount, signer) => __awaiter(void 0, void 0, void 0, function* () {
    const abi = [
        'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
        'function mintFee() view returns (uint256)',
    ];
    if (!signer)
        signer = (yield ethers.getSigners())[0];
    //@ts-ignore
    const btcGateway = new ethers.Contract(deployParameters[network]["btcGateway"], abi, signer);
    yield btcGateway.mint(ethers.utils.hexlify(ethers.utils.randomBytes(32)), amount, ethers.utils.hexlify(ethers.utils.randomBytes(32)), '0x');
});
const getContract = (...args) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return (yield ethers.getContract(...args)).attach(require('../deployments/arbitrum/' + args[0]).address);
    }
    catch (e) {
        return new ethers.Contract(ethers.constants.AddressZero, [], (yield ethers.getSigners())[0]);
    }
});
const getContractFactory = (...args) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield ethers.getContractFactory(...args);
    }
    catch (e) {
        return new ethers.ContractFactory('0x', [], (yield ethers.getSigners())[0]);
    }
});
const convert = (controller, tokenIn, tokenOut, amount, signer) => __awaiter(void 0, void 0, void 0, function* () {
    const [tokenInAddress, tokenOutAddress] = [tokenIn, tokenOut].map((v) => toAddress(v));
    const swapAddress = yield controller.converters(tokenInAddress, tokenOutAddress);
    const converterContract = new ethers.Contract(swapAddress, ['function convert(address) returns (uint256)'], signer || controller.signer || controller.provider);
    if (tokenIn === ethers.constants.AddressZero) {
        yield controller.signer.sendTransaction({ value: amount, to: swapAddress });
        const tx = yield converterContract.convert(ethers.constants.AddressZero);
        return tx;
    }
    else {
        const tokenInContract = new ethers.Contract(tokenInAddress, ['function transfer(address, uint256) returns (bool)'], signer || controller.signer || controller.provider);
        yield tokenInContract.transfer(swapAddress, amount);
        const tx = yield converterContract.convert(ethers.constants.AddressZero);
        return tx;
    }
});
const getImplementation = (proxyAddress) => __awaiter(void 0, void 0, void 0, function* () {
    const [{ provider }] = yield ethers.getSigners();
    return ethers_1.utils.getAddress((yield provider.getStorageAt(proxyAddress, '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc')).substr((yield provider.getNetwork()).chainId === 1337 ? 0 : 26));
});
var underwriterAddress = '0x0';
const deployUnderwriter = () => __awaiter(void 0, void 0, void 0, function* () {
    const { signer, controller, renBTC, btcVault } = yield getFixtures();
    const underwriterFactory = yield getContractFactory('TrivialUnderwriter', signer);
    underwriterAddress = (yield underwriterFactory.deploy(controller.address)).address;
    yield renBTC.approve(btcVault.address, ethers.constants.MaxUint256); //let btcVault spend renBTC on behalf of signer
    yield btcVault.approve(controller.address, ethers.constants.MaxUint256); //let controller spend btcVault tokens
    yield mintUnderwriterNFTIfNotMinted();
});
const mintUnderwriterNFTIfNotMinted = () => __awaiter(void 0, void 0, void 0, function* () {
    const { signer, controller, renBTC, btcVault } = yield getFixtures();
    const lock = yield controller.provider.getCode(yield controller.lockFor(underwriterAddress));
    if (lock === '0x')
        yield controller.mint(underwriterAddress, btcVault.address);
});
const underwriterDeposit = (amountOfRenBTC) => __awaiter(void 0, void 0, void 0, function* () {
    const { btcVault, controller } = yield getFixtures();
    yield btcVault.deposit(amountOfRenBTC); //deposit renBTC into btcVault from signer
    console.log('Underwriter address is', underwriterAddress);
    yield mintUnderwriterNFTIfNotMinted();
});
const getFixtures = () => __awaiter(void 0, void 0, void 0, function* () {
    const [signer] = yield ethers.getSigners();
    const controller = yield getContract('ZeroController', signer);
    const { abi: erc20abi } = yield deployments.getArtifact('BTCVault');
    const { chainId } = yield controller.provider.getNetwork();
    return {
        signer: signer,
        signerAddress: yield signer.getAddress(),
        controller: controller,
        strategy: yield getContract('StrategyRenVM', signer),
        btcVault: yield getContract('BTCVault', signer),
        swapModule: yield getContract('Swap', signer),
        convertModule: yield getContract('ArbitrumConvert', signer),
        uniswapFactory: yield getContract('ZeroUniswapFactory', signer),
        curveFactory: yield getContract('ZeroCurveFactory', signer),
        wrapper: yield getContract('WrapNative', signer),
        unwrapper: yield getContract('UnwrapNative', signer),
        //@ts-ignore
        gateway: new ethers_1.Contract(deployParameters[network]["btcGateway"], GatewayLogicV1_json_1.default.abi, signer),
        //@ts-ignore
        renBTC: new ethers_1.Contract(deployParameters[network]["renBTC"], erc20abi, signer),
        //@ts-ignore
        wETH: new ethers_1.Contract(deployParameters[network]["wNative"], erc20abi, signer),
        //@ts-ignore
        usdc: new ethers_1.Contract(deployParameters[network]["USDC"], erc20abi, signer),
        //@ts-ignore
        wBTC: new ethers_1.Contract(deployParameters[network]["wBTC"], erc20abi, signer),
        yvWBTC: yield getContract('DummyVault', signer),
    };
});
const getBalances = () => __awaiter(void 0, void 0, void 0, function* () {
    const { swapModule, strategy, controller, btcVault, signerAddress, renBTC, wETH, usdc, wBTC, yvWBTC } = yield getFixtures();
    const wallets = {
        Wallet: signerAddress,
        BTCVault: btcVault.address,
        Controller: controller.address,
        Strategy: strategy.address,
        yvWBTC: yvWBTC.address,
        'Swap Module': swapModule.address,
    };
    const tokens = {
        renBTC,
        wETH,
        ETH: 0,
        usdc,
        wBTC,
        yvWBTC,
        zBTC: btcVault,
    };
    const getBalance = (wallet, token) => __awaiter(void 0, void 0, void 0, function* () {
        let decimals, balance;
        try {
            decimals = yield token.decimals();
        }
        catch (e) {
            console.log('failed to get decimals ' + token.address);
        }
        balance = yield token.balanceOf(wallet);
        return String((balance / Math.pow(10, decimals)).toFixed(2));
    });
    console.table(Object.fromEntries(yield Promise.all(Object.keys(wallets).map((name) => __awaiter(void 0, void 0, void 0, function* () {
        const wallet = wallets[name];
        return [
            name,
            Object.fromEntries(yield Promise.all(Object.keys(tokens).map((token) => __awaiter(void 0, void 0, void 0, function* () {
                if (token === 'ETH') {
                    const balance = yield wETH.provider.getBalance(wallet);
                    return [token, String(Number(ethers_1.utils.formatEther(balance)).toFixed(2))];
                }
                else {
                    const tokenContract = tokens[token];
                    return [token, yield getBalance(wallet, tokenContract)];
                }
            })))),
        ];
    })))));
});
const generateTransferRequest = (amount) => __awaiter(void 0, void 0, void 0, function* () {
    const { convertModule, swapModule, signerAddress } = yield getFixtures();
    const { underwriter } = yield getUnderwriter();
    return new zero_1.TransferRequest({
        module: process.env.CHAIN === 'ARBITRUM' ? convertModule.address : swapModule.address,
        to: signerAddress,
        underwriter: underwriter.address,
        //@ts-ignore
        asset: deployParameters[network]['renBTC'],
        amount: String(amount),
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [ethers.utils.parseEther('0.01')]),
    });
});
const getUnderwriter = () => __awaiter(void 0, void 0, void 0, function* () {
    const { signer, controller } = yield getFixtures();
    const underwriterFactory = yield getContractFactory('TrivialUnderwriter', signer);
    return {
        underwriterFactory,
        underwriterAddress,
        underwriter: new ethers_1.Contract(underwriterAddress, underwriterFactory.interface, signer),
        underwriterImpl: new ethers_1.Contract(underwriterAddress, controller.interface, signer),
        lock: yield controller.lockFor(underwriterAddress),
    };
});
const getWrapperContract = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const { signer } = yield getFixtures();
    const wrapperAbi = (yield deployments.getArtifact('ZeroUniswapWrapper')).abi;
    return new ethers_1.Contract(address, wrapperAbi, signer);
});
describe('Zero', () => {
    var prop;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        yield deployments.fixture();
        yield deployUnderwriter();
        const artifact = yield deployments.getArtifact('MockGatewayLogicV1');
        //@ts-ignore
        const implementationAddress = yield getImplementation(deployParameters[network]["btcGateway"]);
        (0, inject_mock_1.override)(implementationAddress, artifact.deployedBytecode);
        const { gateway } = yield getFixtures();
        yield gateway.mint(ethers_1.utils.randomBytes(32), ethers_1.utils.parseUnits('50', 8), ethers_1.utils.randomBytes(32), '0x'); //mint renBTC to signer
    }));
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('\n');
            //@ts-ignore
            console.log('='.repeat(32), 'Beginning Test', '='.repeat(32));
            console.log('Test:', this.currentTest.title, '\n');
            console.log('Initial Balances:');
            yield getBalances();
        });
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Final Balances:');
        yield getBalances();
    }));
    it('mock gateway should work', () => __awaiter(void 0, void 0, void 0, function* () {
        const abi = [
            'function mint(bytes32, uint256, bytes32, bytes) returns (uint256)',
            'function mintFee() view returns (uint256)',
        ];
        const { abi: erc20Abi } = yield deployments.getArtifact('BTCVault');
        const [signer] = yield ethers.getSigners();
        const signerAddress = yield signer.getAddress();
        //@ts-ignore
        const btcGateway = new ethers.Contract(deployParameters[network]["btcGateway"], abi, signer);
        //@ts-ignore
        const renbtc = new ethers.Contract(deployParameters[network]['renBTC'], erc20Abi, signer);
        yield btcGateway.mint(ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.defaultAbiCoder.encode(['uint256', 'bytes'], [0, '0x'])]), ethers.utils.parseUnits('50', 8), ethers.utils.solidityKeccak256(['string'], ['random ninputs']), '0x');
        (0, chai_1.expect)(Number(ethers.utils.formatUnits(yield renbtc.balanceOf(signerAddress), 8))).to.be.gt(0);
    }));
    it('Swap ETH -> wETH -> ETH', () => __awaiter(void 0, void 0, void 0, function* () {
        const { wETH, controller, signer } = yield getFixtures();
        const amount = ethers.utils.parseUnits('1', '18');
        const signerAddress = yield signer.getAddress();
        const originalBalance = yield signer.provider.getBalance(signerAddress);
        yield convert(controller, ethers.constants.AddressZero, wETH, amount);
        console.log('Swapped ETH to wETH');
        yield getBalances();
        yield convert(controller, wETH, ethers.constants.AddressZero, amount);
        console.log('Swapped wETH to ETH');
        (0, chai_1.expect)(originalBalance === (yield signer.provider.getBalance(signerAddress)), 'balance before not same as balance after');
    }));
    it('Swap renBTC -> wBTC -> renBTC', () => __awaiter(void 0, void 0, void 0, function* () {
        const { renBTC, wBTC, controller, signer } = yield getFixtures();
        const amount = ethers.utils.parseUnits('5', '8');
        yield convert(controller, renBTC, wBTC, amount);
        console.log('Converted renBTC to wBTC');
        yield getBalances();
        const newAmount = Number(yield wBTC.balanceOf(yield signer.getAddress()));
        yield convert(controller, wBTC, renBTC, newAmount);
        console.log('Converted wBTC to renBTC');
        (0, chai_1.expect)(Number(yield renBTC.balanceOf(yield signer.getAddress())) > 0, 'The swap amounts dont add up');
    }));
    it('should return the number of decimals in the yearn vault', () => __awaiter(void 0, void 0, void 0, function* () {
        const { yvWBTC } = yield getFixtures();
        const decimals = yield yvWBTC.decimals();
    }));
    it('should deposit funds then withdraw funds back from vault', () => __awaiter(void 0, void 0, void 0, function* () {
        const { renBTC, btcVault } = yield getFixtures();
        const beforeBalance = (yield renBTC.balanceOf(btcVault.address)).toNumber() / (yield renBTC.decimals());
        const addedAmount = '5000000000';
        yield underwriterDeposit(addedAmount);
        const afterBalance = (yield renBTC.balanceOf(btcVault.address)).toNumber() / (yield renBTC.decimals());
        console.log('Deposited funds into vault');
        yield getBalances();
        yield btcVault.withdrawAll();
        console.log('Withdrew funds from vault');
        (0, chai_1.expect)(beforeBalance + Number(addedAmount) == afterBalance, 'Balances not adding up');
    }));
    it('should transfer overflow funds to strategy vault', () => __awaiter(void 0, void 0, void 0, function* () {
        const { btcVault, renBTC } = yield getFixtures();
        yield underwriterDeposit('5000000000');
        console.log('deposited all renBTC into vault');
        yield getBalances();
        yield btcVault.earn();
        console.log('Called earn on vault');
    }));
    it('should take out, make a swap with, then repay a small loan', () => __awaiter(void 0, void 0, void 0, function* () {
        const { signer, controller, btcVault } = yield getFixtures();
        const { underwriter, underwriterImpl } = yield getUnderwriter();
        const renbtc = new ethers.Contract(yield btcVault.token(), btcVault.interface, signer);
        yield renbtc.approve(btcVault.address, ethers.constants.MaxUint256);
        yield btcVault.deposit('1500000000');
        yield btcVault.earn();
        console.log('Deposited 15renBTC and called earn');
        yield getBalances();
        //@ts-ignore
        const transferRequest = yield generateTransferRequest(100000000);
        transferRequest.setUnderwriter(underwriter.address);
        const signature = yield transferRequest.sign(signer, controller.address);
        console.log('\nWriting a small loan');
        yield underwriter.loan(transferRequest.to, transferRequest.asset, transferRequest.amount, transferRequest.pNonce, transferRequest.module, transferRequest.data, signature);
        yield getBalances();
        console.log('\nRepaying loan...');
        const nHash = ethers_1.utils.hexlify(ethers_1.utils.randomBytes(32));
        const actualAmount = String(Number(transferRequest.amount) - 1000);
        const renVMSignature = '0x';
        yield underwriter.proxy(controller.address, controller.interface.encodeFunctionData('repay', [
            underwriter.address,
            transferRequest.to,
            transferRequest.asset,
            transferRequest.amount,
            actualAmount,
            transferRequest.pNonce,
            transferRequest.module,
            nHash,
            transferRequest.data,
            renVMSignature, //signature
        ]));
        yield getBalances();
    }));
    it('should take out, make a swap with, then repay a large loan', () => __awaiter(void 0, void 0, void 0, function* () {
        const { signer, controller, btcVault } = yield getFixtures();
        const { underwriter, underwriterImpl } = yield getUnderwriter();
        const renbtc = new ethers.Contract(yield btcVault.token(), btcVault.interface, signer);
        yield renbtc.approve(btcVault.address, ethers.constants.MaxUint256);
        yield btcVault.deposit('2500000000');
        yield btcVault.earn();
        console.log('Deposited 15renBTC and called earn');
        yield getBalances();
        //@ts-ignore
        const transferRequest = yield generateTransferRequest(1500000000);
        console.log('\nInitial balances');
        yield getBalances();
        transferRequest.setUnderwriter(underwriter.address);
        const signature = yield transferRequest.sign(signer, controller.address);
        console.log('\nWriting a large loan');
        yield underwriterImpl.loan(transferRequest.to, transferRequest.asset, transferRequest.amount, transferRequest.pNonce, transferRequest.module, transferRequest.data, signature);
        yield getBalances();
        console.log('\nRepaying loan...');
        yield underwriterImpl.repay(underwriter.address, //underwriter
        transferRequest.to, //to
        transferRequest.asset, //asset
        transferRequest.amount, //amount
        String(Number(transferRequest.amount) - 1000), //actualAmount
        transferRequest.pNonce, //nonce
        transferRequest.module, //module
        ethers_1.utils.hexlify(ethers_1.utils.randomBytes(32)), //nHash
        transferRequest.data, signature);
        yield getBalances();
    }));
    it('should handle a default', () => __awaiter(void 0, void 0, void 0, function* () {
        const { signer, controller, btcVault } = yield getFixtures();
        const { underwriter, underwriterImpl } = yield getUnderwriter();
        const renbtc = new ethers.Contract(yield btcVault.token(), btcVault.interface, signer);
        yield renbtc.approve(btcVault.address, ethers.constants.MaxUint256);
        yield btcVault.deposit('2500000000');
        yield btcVault.earn();
        console.log('Deposited 15renBTC and called earn');
        yield getBalances();
        //@ts-ignore
        const transferRequest = yield generateTransferRequest(1500000000);
        console.log('\nInitial balances');
        yield getBalances();
        transferRequest.setUnderwriter(underwriter.address);
        const signature = yield transferRequest.sign(signer, controller.address);
        console.log('\nWriting a large loan');
        yield underwriterImpl.loan(transferRequest.to, transferRequest.asset, transferRequest.amount, transferRequest.pNonce, transferRequest.module, transferRequest.data, signature);
        yield getBalances();
        console.log('\nRepaying loan...');
        yield underwriterImpl.repay(underwriter.address, //underwriter
        transferRequest.to, //to
        transferRequest.asset, //asset
        transferRequest.amount, //amount
        String(Number(transferRequest.amount) - 1000), //actualAmount
        transferRequest.pNonce, //nonce
        transferRequest.module, //module
        ethers_1.utils.hexlify(ethers_1.utils.randomBytes(32)), //nHash
        transferRequest.data, signature);
        yield getBalances();
    }));
    it('should call fallback mint and return funds', () => __awaiter(void 0, void 0, void 0, function* () {
        const { signer, controller } = yield getFixtures();
        const { underwriter, underwriterImpl } = yield getUnderwriter();
        //@ts-ignore
        const transferRequest = yield generateTransferRequest(100000000);
        console.log('\nInitial balances');
        yield getBalances();
        transferRequest.setUnderwriter(underwriter.address);
        const signature = yield transferRequest.sign(signer, controller.address);
        console.log('Calling fallbackMint...');
        yield controller.fallbackMint(underwriter.address, //underwriter,
        transferRequest.to, //to
        transferRequest.asset, //asset
        transferRequest.amount, //amount
        String(Number(transferRequest.amount) - 1000), //actualAmount
        transferRequest.pNonce, //nonce
        transferRequest.module, //module
        ethers_1.utils.hexlify(ethers_1.utils.randomBytes(32)), //nHash
        transferRequest.data, //data
        signature);
        yield getBalances();
    }));
});
