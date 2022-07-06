import { EventEmitter } from "events";
const { TransferRequest, BurnRequest } = require("@zerodao/sdk")

export class SDKTransfer extends EventEmitter {

    log: Logger;
    transferRequest: Object
    chainId;
    isFast
    zeroUser
    signer
    token
    constructor( chainId: number, zeroUser, value, token, signer, to, isFast, _data ) {
        super();
        this.chainId = chainId
        this.isFast = isFast
        this.zeroUser = zeroUser
        this.signer = signer
        this.token = token
        const self = this

        this.transferRequest = (async function() {
            const asset = tokenMapping({
                tokenName: self.token
                chainId: self.chainId
            })
        })
    }

    async call(_this, asset = "renBTC") {
        const transferRequest = await this.transferRequest
    }


    

    
}


