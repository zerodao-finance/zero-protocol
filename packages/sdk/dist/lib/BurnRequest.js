"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnRequest = void 0;
const bytes_1 = require("@ethersproject/bytes");
const random_1 = require("@ethersproject/random");
const buffer_1 = require("buffer");
const ethers_1 = require("ethers");
const utils_1 = require("@0x/utils");
const chains_1 = require("@renproject/chains");
const ren_1 = __importDefault(require("@renproject/ren"));
const common_1 = require("@zerodao/common");
const common_2 = __importDefault(require("@zerodao/common"));
// @ts-ignore
const BTCHandler_1 = require("send-crypto/build/main/handlers/BTC/BTCHandler");
const common_3 = require("@zerodao/common");
/**
 * Supposed to provide a way to execute other functions while using renBTC to pay for the gas fees
 * what a flow to test would look like:
 * -> underwriter sends request to perform some operation on some contract somewhere
 * -> check if renBTC amount is debited correctly
 */
class BurnRequest {
    constructor(params) {
        this.requestType = 'burn';
        this.destination = params.destination;
        this._destination = params.destination;
        this.owner = params.owner;
        this.underwriter = params.underwriter;
        this.asset = params.asset;
        this.data = params.data || '0x';
        console.log('params.nonce', params.nonce);
        this.nonce = params.nonce ? (0, bytes_1.hexlify)(params.nonce) : (0, bytes_1.hexlify)((0, random_1.randomBytes)(32));
        this.pNonce = params.pNonce ? (0, bytes_1.hexlify)(params.pNonce) : (0, bytes_1.hexlify)((0, random_1.randomBytes)(32));
        this.chainId = params.chainId;
        this.amount = params.amount;
        this.deadline = params.deadline;
        this.contractAddress = params.contractAddress;
        this.signature = params.signature;
        //this._config =
        //
        this.gatewayIface = new ethers_1.ethers.utils.Interface([
            'event LogBurn(bytes _to, uint256 _amount, uint256 indexed _n, bytes indexed _indexedTo)',
        ]);
        this._ren = new ren_1.default('mainnet', { loadCompletedDeposits: true });
        this._contractFn = 'burn';
        //TODO: figure out exactly what values go in here
        this._contractParams = [
            {
                name: '_to',
                type: 'bytes',
                value: this.destination,
            },
            {
                name: 'amount',
                type: 'uint256',
                value: this.amount,
            },
        ];
    }
    setProvider(provider) {
        this.provider = provider;
        return this;
    }
    async submitToRenVM(isTest) {
        console.log('submitToRenVM');
        console.log(this);
        if (this._burn)
            return this._burn;
        const result = (this._burn = await this._ren.burnAndRelease({
            asset: 'BTC',
            to: (0, chains_1.Bitcoin)().Address(this.destination),
            from: (0, common_1.getProvider)(this).Contract((btcAddress) => ({
                sendTo: this.contractAddress,
                contractFn: this._contractFn,
                contractParams: this._contractParams,
            })),
        }));
        //    result.params.nonce = this.nonce;
        return result;
    }
    async waitForTxNonce(burn) {
        if (this._queryTxResult)
            return this._queryTxResult;
        const burnt = await new Promise((resolve, reject) => {
            burn.on('transactionHash', resolve);
            burn.on('error', reject);
        });
        const tx = await this.provider.waitForTransaction(burnt);
        const parsed = tx.logs.reduce((v, d) => {
            if (v)
                return v;
            try {
                return this.gatewayIface.parseLog(d);
            }
            catch (e) { }
        }, null);
        this.nonce = parsed._n;
        this._queryTxResult = parsed;
        return parsed;
    }
    setUnderwriter(underwriter) {
        if (!ethers_1.ethers.utils.isAddress(underwriter))
            return false;
        this.underwriter = ethers_1.ethers.utils.getAddress(underwriter);
        return true;
    }
    toEIP712Digest(contractAddress, chainId) {
        return utils_1.signTypedDataUtils.generateTypedDataHash(this.toEIP712(contractAddress || this.contractAddress, Number(chainId || this.chainId)));
    }
    getExpiry(nonce) {
        nonce = nonce || this.tokenNonce;
        console.log([this.asset, this.amount, this.deadline, nonce, this.data, this.destination]);
        return ethers_1.ethers.utils.solidityKeccak256(['address', 'uint256', 'uint256', 'uint256', 'bytes', 'bytes'], [this.asset, this.amount, this.deadline, nonce, this.data, this.destination]);
    }
    toEIP712(contractAddress, chainId) {
        this.contractAddress = contractAddress || this.contractAddress;
        this.chainId = chainId || this.chainId;
        return {
            types: {
                EIP712Domain: common_3.EIP712_TYPES.EIP712Domain,
                Permit: [
                    {
                        name: 'holder',
                        type: 'address',
                    },
                    {
                        name: 'spender',
                        type: 'address',
                    },
                    {
                        name: 'nonce',
                        type: 'uint256',
                    },
                    {
                        name: 'expiry',
                        type: 'uint256',
                    },
                    {
                        name: 'allowed',
                        type: 'bool',
                    },
                ],
            },
            primaryType: 'Permit',
            domain: {
                name: this.assetName,
                version: '1',
                chainId: String(this.chainId) || '1',
                verifyingContract: this.asset || ethers_1.ethers.constants.AddressZero,
            },
            message: {
                holder: this.owner,
                spender: contractAddress,
                nonce: this.tokenNonce,
                expiry: this.getExpiry(),
                allowed: 'true',
            },
        };
    }
    async toGatewayAddress(input) {
        const burn = await this.submitToRenVM(false);
        return burn.gatewayAddress;
    }
    async sign(signer, contractAddress) {
        const provider = signer.provider;
        const { chainId } = await signer.provider.getNetwork();
        const token = new ethers_1.ethers.Contract(this.asset, [
            'function DOMAIN_SEPARATOR() view returns (bytes32)',
            'function name() view returns (string)',
            'function nonces(address) view returns (uint256)',
        ], signer.provider);
        this.assetName = await token.name();
        this.tokenNonce = (await token.nonces(await signer.getAddress())).toString();
        console.log(this.assetName, this.tokenNonce);
        try {
            const payload = this.toEIP712(contractAddress, chainId);
            console.log(payload);
            delete payload.types.EIP712Domain;
            const sig = await signer._signTypedData(payload.domain, payload.types, payload.message);
            return (this.signature = ethers_1.ethers.utils.joinSignature(ethers_1.ethers.utils.splitSignature(sig)));
        }
        catch (e) {
            console.error(e);
            return (this.signature = await provider.send('eth_signTypedData_v4', [
                await signer.getAddress(),
                this.toEIP712(this.contractAddress || contractAddress, chainId),
            ]));
        }
    }
    async waitForHostTransaction() {
        const network = ((v) => v === 'ethereum' ? 'mainnet' : v)(common_1.CONTROLLER_DEPLOYMENTS[ethers_1.ethers.utils.getAddress(this.contractAddress)].toLowerCase());
        const provider = (0, common_1.getVanillaProvider)(this);
        const renbtc = new ethers_1.ethers.Contract(common_2.default[((v) => v === 'mainnet' ? 'ethereum' : v)(network).toUpperCase()].renBTC, ['event Transfer(address indexed from, address indexed to, uint256 amount)'], provider);
        return await new Promise((resolve, reject) => {
            const filter = renbtc.filters.Transfer(this.contractAddress, ethers_1.ethers.constants.AddressZero);
            const done = (rcpt) => {
                renbtc.off(filter, listener);
                resolve(rcpt);
            };
            const listener = (from, to, amount, evt) => {
                (async () => {
                    console.log('evt', evt);
                    if (this.asset == ethers_1.ethers.constants.AddressZero) {
                        const tx = await evt.getTransaction();
                        if (tx.from === this.owner && ethers_1.ethers.utils.hexlify(tx.value) === ethers_1.ethers.utils.hexlify(this.amount))
                            return done(await evt.getTransactionReceipt());
                    }
                    else {
                        const receipt = await evt.getTransactionReceipt();
                        console.log('receipt', receipt);
                        const { logs } = await evt.getTransactionReceipt();
                        const decoded = logs.map((v) => { try {
                            return renbtc.interface.parseLog(v);
                        }
                        catch (e) {
                            console.error(e);
                        } }).filter(Boolean);
                        const events = logs.map((v, i) => ({ log: v, event: decoded[i] }));
                        console.log('events', events);
                        if (events.find((v) => v.event.args.from.toLowerCase() === this.owner.toLowerCase() && ethers_1.ethers.utils.hexlify(this.amount) === ethers_1.ethers.utils.hexlify(v.event.args && v.event.args.amount || 0)))
                            return done(receipt);
                    }
                })().catch((err) => console.error(err));
            };
            renbtc.on(filter, listener);
        });
    }
    async waitForRemoteTransaction() {
        let address;
        const arrayed = Array.from(ethers_1.ethers.utils.arrayify(this.destination));
        if (arrayed.length > 40)
            address = buffer_1.Buffer.from(arrayed).toString('utf8');
        else
            address = ethers_1.ethers.utils.base58.encode(this.destination);
        const { length } = await BTCHandler_1.BTCHandler.getUTXOs(false, {
            address,
            confirmations: 0
        });
        while (true) {
            try {
                const utxos = await BTCHandler_1.BTCHandler.getUTXOs(false, {
                    address,
                    confirmations: 0
                });
                if (utxos.length > length)
                    return utxos[utxos.length - 1];
            }
            catch (e) {
                console.error(e);
            }
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }
}
exports.BurnRequest = BurnRequest;
//# sourceMappingURL=BurnRequest.js.map