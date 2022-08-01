'use strict';

const fixtures = require('../lib/fixtures');
const hre = require('hardhat');

const testMint = async (signer, amount) => {
  const contract = new ethers.Contract(
    fixtures.ARBITRUM.btcGateway,
    [
      "function mint(bytes32, uint256, bytes32, bytes) returns (uint256)",
      "function mintFee() view returns (uint256)",
    ],
    signer
  );
  return await contract.mint(
    ethers.utils.hexlify(ethers.utils.randomBytes(32)),
    ethers.utils.parseUnits(amount, 8),
    ethers.utils.hexlify(ethers.utils.randomBytes(32)),
    "0x"
  );
};

(async () => {
  const [ signer ] = await hre.ethers.getSigners();
  await testMint(signer, '0.5');
})().catch(console.error);
