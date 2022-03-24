const hre = require('hardhat');
const { ethers } = hre;

const { deployFixedAddress } = require('./common');

module.exports = async () => {
	if (process.env.CHAIN === 'ARBITRUM' && process.env.DEPLOYARBITRUMQUICKCONVERT) {
		const zeroControllerAddress = "0x53f38bEA30fE6919e0475Fe57C2629f3D3754d1E";

		await deployFixedAddress('ArbitrumConvertQuick', {
			args: [zeroControllerAddress, ethers.utils.parseUnits('15', 8), '100000'],
			contractName: 'ArbitrumConvertQuick',
			libraries: {},
			from: process.env.WALLET,
		});
	}
};
