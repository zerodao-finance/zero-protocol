const {tokenMapping, reverseTokenMapping, selectFixture} = require("@zerodao/common");
const { AddressZero } = require("@ethersproject/constants")
const _ = require("lodash");

test("test fn(selectFixture)<chainId>", () => {
    let fixture = {}
    fixture = selectFixture("42161")
    expect(_.isEmpty(fixture)).toBe(false)
})

test("test fn(tokenMapping)<tokenName, chainId>", () => {
    let token = tokenMapping({ tokenName: "ETH", chainId: "42161" })
    expect(token).toBe(AddressZero)
})

test("test fn(reverseTokenMapping)<tokenAddress, chainId>", () => {
    var tokenName = reverseTokenMapping({tokenAddress: AddressZero, chainId: "137"})
    var tokenName2 = reverseTokenMapping({ tokenAddress: "0xdbf31df14b66535af65aac99c32e9ea844e14501", chainId: "42161"})
    expect(tokenName).toBe("ETH")
    expect(tokenName2).toBe("renBTC")
})