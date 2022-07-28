pragma solidity ^0.8.15;
import "forge-std/Test.sol";
import { IGateway, IGatewayRegistry } from "../interfaces/IGatewayRegistry.sol";
import { IChainlinkOracle } from "../interfaces/IChainlinkOracle.sol";
import { ConvertWBTCMainnet as ConvertWBTC } from "../modules/mainnet/ConvertWBTC.sol";
import "../erc4626/interfaces/IRenBtcEthConverter.sol";
import "../erc4626/vault/ZeroBTC.sol";

contract BTCVaultTest is Test {
  ZeroBTC vault;

  constructor() {
    vault = new ZeroBTC(
      IGatewayRegistry(address(0x0)),
      IChainlinkOracle(address(0x0)),
      IChainlinkOracle(address(0x0)),
      IRenBtcEthConverter(address(0x0)),
      0,
      0,
      0,
      0,
      address(0x0),
      address(0x0),
      address(0x0)
    );
  }

  function test() public {
    ConvertWBTC module = new ConvertWBTC(address(0x0));
  }
}
