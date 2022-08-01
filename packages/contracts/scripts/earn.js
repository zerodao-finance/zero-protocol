const hre = require('hardhat');
const { ethers } = hre;


const main = async () => {
  const [ signer ] = await ethers.getSigners();
  const btcVault = new ethers.Contract('0x55C7A6b140A31271ACFC8f715e08B497a774784E', [ 'function earn()'], signer);
  await btcVault.callStatic.earn();
};

main().then(() => { process.exit(0); }).catch((err) => { console.error(err); process.exit(1); });
