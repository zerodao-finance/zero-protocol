var ethers = require('ethers');
var f = function (sig) {
  const c = new ethers.Contract(ethers.constants.AddressZero, [ sig ], new ethers.providers.InfuraProvider('mainnet'));
  const key = Object.keys(c.interface.functions);
  return c.interface.getSighash(c.interface.functions[key]);
};
