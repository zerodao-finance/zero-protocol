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
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const btc_1 = require("../btc");
const fetch_mock_1 = __importDefault(require("fetch-mock"));
const chai_1 = require("chai");
require("mocha");
describe('fetchAverageBitcoinConfirmationTime', () => {
    const mockData = {
        timestamp: 1.623085464e12,
        market_price_usd: 35978.63,
        hash_rate: 1.3915635212582895e11,
        total_fees_btc: 2748364385,
        n_btc_mined: 83125000000,
        n_tx: 211657,
        n_blocks_mined: 133,
        minutes_between_blocks: 10.1742,
        totalbc: 1872923750000000,
        n_blocks_total: 686678,
        estimated_transaction_volume_usd: 2.7521970719770913e9,
        blocks_size: 156042958,
        miners_revenue_usd: 3.0896060040630914e7,
        nextretarget: 687455,
        difficulty: 21047730572451,
        estimated_btc_sent: 7649532714217,
        miners_revenue_btc: 858,
        total_btc_sent: 196109258826342,
        trade_volume_btc: 8263.36,
        trade_volume_usd: 2.973043719968e8,
    };
    beforeEach(() => {
        fetch_mock_1.default.mock('https://blockchain.info/stats?format=json&cors=true', mockData);
    });
    afterEach(() => {
        fetch_mock_1.default.restore();
    });
    it('Returns Correct BTC Confirmation Time', () => __awaiter(void 0, void 0, void 0, function* () {
        const confTime = yield (0, btc_1.fetchAverageBitcoinConfirmationTime)();
        const expected = (10.1742 * 6).toFixed(1);
        (0, chai_1.expect)(confTime).to.be.equal(expected);
    }));
});
describe('fetchBtcPriceHistory', () => {
    const mockData = {
        prices: [
            [1623077389037, 35979.59666307398],
            [1623077675479, 36039.11623162373],
            [1623077973474, 36130.579400189694],
            [1623078268508, 36113.09984278064],
            [1623078607803, 36026.53520044935],
            [1623078888029, 36050.710794481085],
            [1623079224367, 36190.29553295392],
            [1623079498507, 36129.27435338305],
            [1623079796705, 36128.77776723356],
            [1623080108062, 36142.96823320477],
            [1623080393677, 36171.26559296686],
            [1623080718124, 36168.63541846135],
            [1623080984465, 36091.394496973946],
            [1623081287060, 36129.1710205234],
            [1623081558819, 36064.75952119722],
            [1623081891862, 36080.401811888485],
            [1623082221723, 36000.13440906134],
            [1623082483099, 36035.03706979065],
            [1623082749214, 36014.03011021135],
            [1623083056982, 36014.006450597],
            [1623083361038, 35871.1258285014],
            [1623083616113, 35831.779099888714],
            [1623084028483, 35835.18626787593],
            [1623084295683, 35829.04894220284],
            [1623084613190, 35779.55542938116],
            [1623084893985, 35798.77730030044],
            [1623085198602, 35775.86534140443],
            [1623085513583, 35759.790897315135],
            [1623085822345, 35618.019318723855],
            [1623085942000, 35636.87160933142],
        ],
        market_caps: [
            [1623077389037, 673867478719.792],
            [1623077675479, 673867478719.792],
            [1623077973474, 676696161221.0242],
            [1623078268508, 676696161221.0242],
            [1623078607803, 676696161221.0242],
            [1623078888029, 676696161221.0242],
            [1623079224367, 677886510988.0056],
            [1623079498507, 677886510988.0056],
            [1623079796705, 676662851656.6265],
            [1623080108062, 676662851656.6265],
            [1623080393677, 677459084571.3884],
            [1623080718124, 677459084571.3884],
            [1623080984465, 675963378909.4585],
            [1623081287060, 675963378909.4585],
            [1623081558819, 675464526801.5212],
            [1623081891862, 675464526801.5212],
            [1623082221723, 675358659166.282],
            [1623082483099, 675358659166.282],
            [1623082749214, 674514620992.7124],
            [1623083056982, 674514620992.7124],
            [1623083361038, 671838135547.4333],
            [1623083616113, 671838135547.4333],
            [1623084028483, 671162181088.4305],
            [1623084295683, 671162181088.4305],
            [1623084613190, 669938954230.3942],
            [1623084893985, 669938954230.3942],
            [1623085198602, 670054231548.8654],
            [1623085513583, 670054231548.8654],
            [1623085822345, 667079268690.9332],
            [1623085942000, 667079268690.9332],
        ],
        total_volumes: [
            [1623077389037, 29868445280.10911],
            [1623077675479, 29926084751.488377],
            [1623077973474, 29990985758.990837],
            [1623078268508, 29929306847.231327],
            [1623078607803, 29775860007.587257],
            [1623078888029, 29762024133.10909],
            [1623079224367, 29841537304.261375],
            [1623079498507, 29774956309.55548],
            [1623079796705, 29751003837.99908],
            [1623080108062, 29756357000.71931],
            [1623080393677, 29796134528.38013],
            [1623080718124, 29785667604.927464],
            [1623080984465, 29704847984.339687],
            [1623081287060, 29746420299.984676],
            [1623081558819, 29717372071.055622],
            [1623081891862, 29431468741.459244],
            [1623082221723, 28990744035.66501],
            [1623082483099, 29454791091.355595],
            [1623082749214, 29426376549.50166],
            [1623083056982, 29457951798.907726],
            [1623083361038, 29390991609.673946],
            [1623083616113, 29447749212.260155],
            [1623084028483, 29077531823.318897],
            [1623084295683, 29361744391.437794],
            [1623084613190, 29546983113.970367],
            [1623084893985, 29451857594.281555],
            [1623085198602, 29197937339.296837],
            [1623085513583, 29586812861.315],
            [1623085822345, 29521595235.673485],
            [1623085942000, 29531140458.574306],
        ],
    };
    beforeEach(() => {
        fetch_mock_1.default.mock('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=.1&interval=minute', mockData);
    });
    afterEach(() => {
        fetch_mock_1.default.restore();
    });
    const data = [
        {
            confTime: '60',
            expected: { oldPrice: new bignumber_js_1.default(36035.03706979065), currentPrice: new bignumber_js_1.default(35636.87160933142) },
        },
    ];
    data.forEach((testData) => {
        it('Returns correct price history', () => __awaiter(void 0, void 0, void 0, function* () {
            const confTime = testData.confTime;
            const prices = yield (0, btc_1.fetchBitcoinPriceHistory)(confTime);
            console.log('prices:', prices);
            console.log(testData.expected);
            (0, chai_1.expect)(prices).to.deep.equal(testData.expected);
        }));
    });
});
describe('BitcoinClient', () => {
    it('Creates valid Bitcoin Client', () => {
        const client = (0, btc_1.getDefaultBitcoinClient)();
        (0, chai_1.expect)(client).to.be.instanceOf(btc_1.BitcoinClient);
    });
});
