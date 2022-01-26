const hre = require('hardhat');
const { ethers, deployments, upgrades } = hre;




module.exports = async() => {
      const deployFixedAddress = async (...args) => {
          console.log('Deploying ' + args[0]);
          args[1].waitConfirmations = 1;
          const [signer] = await ethers.getSigners();
        //  hijackSigner(signer);
          const result = await deployments.deploy(...args);
        //  restoreSigner(signer);
          console.log('Deployed to ' + result.address);
          return result;
        };

      ethers.providers.BaseProvider.prototype.getGasPrice = require('ethers-polygongastracker').createGetGasPrice('rapid')
      const controller = await ethers.getContract('ZeroController');
      const module = await deployFixedAddress('PolygonConvert', { args: ["0x3f3cFa3ac58e12c15E2fF8Ae05C8563437108F51"], contractName: 'PolygonConvert', from: "0x132d8d7f0a6b7e8ba72fe388dfc56d9c643e7ddf427579ebbac2c23e3f0f19aa" });
      await controller.approveModule(module.address, true);

  }