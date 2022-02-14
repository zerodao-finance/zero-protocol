export const getSigner = async (ethers) => {
	const [signer] = await ethers.getSigners.call(ethers);
	return process.env.WALLET ? new ethers.Wallet(process.env.WALLET, signer.provider) : signer;
};
export const getContract = async (to, ethers) => {
	return await await ethers
		.getContract(to)
		.then((d) => d.address)
		.catch((e) => ethers.utils.getAddress(to));
};
