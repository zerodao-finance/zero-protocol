export const transferRequestToPlain = (transferRequest: any) => {
	const { to, underwriter, contractAddress, nonce, pNonce, data, module, amount, asset, status, signature } =
		transferRequest;
	return {
		to,
		underwriter,
		contractAddress,
		nonce,
		pNonce,
		data,
		module,
		amount,
		status,
		asset,
		signature,
	};
};
