const { createZeroConnection, ZeroP2P, ZeroUser } = require("@zerodao/p2p");
const { Wallet } = require("@ethersproject/wallet");
jest.setTimeout(30000)


const node = createZeroConnection(Wallet.createRandom(), "mainnet");
test("it should a zero-connection node", async () => {
    expect(await node).toBeInstanceOf(ZeroP2P)    
})

test("it should create a zero-user from a node", async () => {
    const user = new ZeroUser({conn: await node})
    expect(user).toBeInstanceOf(ZeroUser)
})

test("it should connect to a keeper", async () => {
    const user = new ZeroUser({conn: await node})
    await user.subscribeKeepers()
    let keepers = new Promise((resolve, reject) => {
        user.on("keeper", (from) => {
            resolve(from);
        })
    })

    expect(keepers).resolves.toBeInstanceOf(Object)
})