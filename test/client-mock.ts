import { createMockKeeper, enableGlobalMockRuntime } from '../lib/mock'
import { UnderwriterTransferRequest } from '../lib/zero'
import { ethers } from 'ethers'

var contracts
const createTransferRequest = (amount, asset, to, data) => {
    return new UnderwriterTransferRequest({
        amount: amount,
        asset: asset,
        to: to,
        data: data,
        pNonce: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
        nonce: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
        underwriter: contracts.DelegateUnderwriter.address,
        module: contracts.Convert.address,
        contractAddress: contracts.ZeroController.address
    });
}



describe('Client Mock Interaction Tests', () => {

    beforeEach(() => {
        var tfRequest = createTransferRequest("", "", "", "")
    })

    it("Should Build a Transfer Request")

    it("Should Run Dry on a Transfer Request")

    it("Should Submit a Transfer Request to the server")


    it("Should recieve result of a transfer Request")
})