const { deployments } = require('hardhat');
const { deployProxyFixedAddress } = require('./common');


module.exports = async ({ getChainId, getUnnamedAccounts, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();


    const BTCVaultFactory = await hre.ethers.getContractFactory('yVaultUpgradeable');
    const btcVaultArtifact = await hre.artifacts.readArtifact('yVaultUpgradeable');
    const btcVault = await deployProxyFixedAddress(BTCVaultFactory, [
        '0xdbf31df14b66535af65aac99c32e9ea844e14501', //renBTC on Arbitrum
        '0x53f38bEA30fE6919e0475Fe57C2629f3D3754d1E', //zeroController on Arbitrum
        'zeroBTC',
        'zBTC'
    ]
    );

    await deployments.save('BTCVault', {
        contractName: 'BTCVault',
        address: btcVault.address,
        bytecode: btcVaultArtifact.bytecode,
        abi: btcVaultArtifact.abi,
    });

}