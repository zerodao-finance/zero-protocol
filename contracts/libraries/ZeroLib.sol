// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import { FactoryLib } from "./factory/FactoryLib.sol";
import { ZeroUnderwriterLock } from "../underwriter/ZeroUnderwriterLock.sol";

/**
@title helper functions for the Zero contract suite
@author raymondpulver
*/
library ZeroLib {
   struct BalanceSheet {
     uint128 loaned;
     uint128 required;
     uint256 repaid;
   }
   function lockFor(address nft, address underwriter) internal view returns (ZeroUnderwriterLock result) {
     result = ZeroUnderwriterLock(FactoryLib.computeAddress(nft, underwriterLockImpl, bytes32(bytes20(underwriter))));
   }
}
