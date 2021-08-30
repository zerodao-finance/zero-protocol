import { ethers } from 'ethers';
import { signTypedDataUtils } from '@0x/utils';
import { EIP712_TYPES } from './config/constants';
import RenVM from './util/renvm';
import { computeP } from './util/helpers';
import { createNode, ZeroKeeper, ZeroUser } from './p2p';
export default class TransferRequest {
    constructor(module, to, underwriter, asset, amount, data, nonce, pNonce) {
        this.module = module;
        this.to = to;
        this.underwriter = underwriter;
        this.asset = asset;
        this.amount = amount.toString();
        this.data = data;
        this.nonce = nonce
            ? ethers.utils.formatBytes32String(nonce.toString())
            : ethers.utils.hexlify(ethers.utils.randomBytes(32));
        this.pNonce = pNonce
            ? ethers.utils.formatBytes32String(pNonce.toString())
            : ethers.utils.hexlify(ethers.utils.randomBytes(32));
    }
    setUnderwriter(underwriter) {
        if (!ethers.utils.isAddress(underwriter))
            return false;
        this.underwriter = ethers.utils.getAddress(underwriter);
        return true;
    }
    toEIP712Digest(contractAddress, chainId = 1) {
        return signTypedDataUtils.generateTypedDataHash(this.toEIP712(contractAddress, chainId));
    }
    toEIP712(contractAddress, chainId = 1) {
        return {
            types: EIP712_TYPES,
            domain: {
                name: 'ZeroController',
                version: '1',
                chainId: chainId.toString() || '1',
                verifyingContract: contractAddress || ethers.constants.AddressZero,
            },
            message: {
                module: this.module,
                asset: this.asset,
                amount: this.amount.toString(),
                data: this.data,
                underwriter: this.underwriter,
                nonce: this.pNonce.toString(),
            },
            primaryType: 'TransferRequest',
        };
    }
    toGatewayAddress(input) {
        const renvm = new RenVM(null, {});
        return renvm.computeGatewayAddress({
            mpkh: input.mpkh,
            isTestnet: input.isTest,
            g: {
                p: computeP(this.pNonce, this.module, this.data),
                nonce: this.nonce,
                tokenAddress: this.asset,
                to: input.destination,
            },
        });
    }
    async sign(signer, contractAddress) {
        const provider = signer.provider;
        const { chainId } = await signer.provider.getNetwork();
        try {
            return await provider.send('eth_signTypedData_v4', [
                await signer.getAddress(),
                this.toEIP712(contractAddress, chainId),
            ]);
        }
        catch (e) {
            console.error(e);
            // in case this is not available in the signer
            return await signer.signMessage(ethers.utils.hexlify(this.toEIP712Digest(contractAddress, chainId)));
        }
    }
}
export async function createZeroConnection(address) {
    const connOptions = {
        multiaddr: address,
    };
    return await createNode(connOptions);
}
export function createZeroUser(connection, persistence) {
    return new ZeroUser(connection, persistence);
}
export function createZeroKeeper(connection) {
    return new ZeroKeeper(connection);
}
//# sourceMappingURL=zero.js.map