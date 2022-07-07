const { CONTROLLER_DEPLOYMENTS, getVanillaProvider, getRenVMChain } =  require("@zerodao/common");
const { getAddress } = require("@ethersproject/address");
const { JsonRpcProvider } = require("@ethersproject/providers")
const { EthereumBaseChain } = require("@renproject/chains")

test("test controller deployments should have all controller deployments", () => {
    expect(Object.values(CONTROLLER_DEPLOYMENTS)).toContain("Arbitrum")
})

test("test fn(getVanillaProvider)<request> to return JsonRpcProvider", () => {
    let [address] = Object.keys(CONTROLLER_DEPLOYMENTS)
    let provider = getVanillaProvider({contractAddress: address})
    expect(provider).toBeInstanceOf(JsonRpcProvider)
})

test("test fn(getProvider)<transferRequest> to return renvm chain provider", () => {
    let [address] = Object.keys(CONTROLLER_DEPLOYMENTS)
    let provider = getRenVMChain({contractAddress: address})
    // console.log(provider)
    expect(provider).toBeInstanceOf(EthereumBaseChain)
})