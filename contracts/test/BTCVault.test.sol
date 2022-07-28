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
      IGatewayRegistry(0xe4b679400F0f267212D5D812B95f58C83243EE71),
      IChainlinkOracle(0xdeb288F737066589598e9214E782fa5A8eD689e8),
      IChainlinkOracle(0x169E633A2D1E6c10dD91238Ba11c4A708dfEF37C),
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
    ConvertWBTC module = new ConvertWBTC(
      0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D
    );
  }
}
