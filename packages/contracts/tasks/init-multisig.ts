// @ts-ignore
import { task } from "hardhat/config";
import Safe, { SafeFactory, SafeAccountConfig } from "@gnosis.pm/safe-core-sdk";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import { getSigner, getNetworkId } from "./util";
import * as fixtures from "@zerodao/protocol/lib/fixtures";

//@ts-ignore
task("init-multisig", "initializes a multisig gnosis safe")
  .addParam("owners", "owner addresses, comma separated with no spaces")
  .addParam("threshold", "threshold for confirmation")
  //@ts-ignore
  .setAction(async ({ owners: ownersJoined, threshold }, { ethers }) => {
    const signer = await getSigner(ethers);
    // parsing addresses
    const owners = ownersJoined
      .split(",")
      .map((d) => ethers.utils.getAddress(d));
    const owner = new EthersAdapter({
      ethers,
      signer,
    });
    Object.assign(owner, "getChainId", getNetworkId);
    const contractNetworks = {
      [`${await owner.getChainId()}`]: {
        multiSendAddress: fixtures[process.env.CHAIN].multiSend,
        safeProxyFactoryAddress: fixtures[process.env.CHAIN].safeProxyFactory,
        safeMasterCopyAddress: fixtures[process.env.CHAIN].safeMasterCopy,
      },
    };
    const safeFactory = await SafeFactory.create({
      ethAdapter: owner,
      contractNetworks,
    });
    const safeAccountConfig: SafeAccountConfig = { owners, threshold };
    //making safe
    const safeSdk: Safe = await safeFactory.deploySafe({ safeAccountConfig });
    console.log("deployed safe at: ", safeSdk.getAddress());
  });
