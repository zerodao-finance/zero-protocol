const hre = require('hardhat');

(async () => {
//  const releaser = await hre.ethers.getContractFactory('ControllerReleaserV2');
  const [ signer ] = await hre.ethers.getSigners();
	/*
  const r = await releaser.deploy();
  console.log('deployed ' + r.address);
  const btcVault = new hre.ethers.Contract('0xf0660fbf42e5906fd7a0458645a4bf6ccfb7766d', [ 'function max() view returns (uint256)', 'function setMin(uint256)', 'function setController(address)' ], signer);
  console.log(await (await btcVault.setMin(await btcVault.max())).wait());
  console.log('min set');
  const tx = await btcVault.setController(r.address);
  console.log('waiting');
  await tx.wait();
  console.log('controller set');
	*/
  const controller = new hre.ethers.Contract('0x8E7027ABDE0682F48e6174Cce3D1D8Da721E41ab', [ 'function go() returns (uint256)' ], signer);
  console.log(await (await controller.go()).wait());
})().catch(console.error);
