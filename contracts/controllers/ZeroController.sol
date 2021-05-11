pragma solidity >=0.5.0;

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { ZeroUnderwriterLock } from "./ZeroUnderwriterLock.sol";
import { ZeroLib } from "../libraries/ZeroLib.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { ControllerUpgradeable } from "./ControllerUpgradeable.sol";

/**
@title upgradeable contract which determines the authority of a given address to sign off on loans
@author raymondpulver
*/
contract ZeroController is ControllerUpgradeable, OwnableUpgradeable, ERC721Upgradeable {
   string internal constant UNDERWRITER_LOCK_IMPLEMENTATION_ID = "zero.underwriter.lock-implementation";
   address internal underwriterLockImpl;
   mapping (address => uint256) public loaned;
   mapping (address => uint256) public repaid;
   mapping (address => bool) public moduleApproved;
   function initialize(address _rewards) public {
     __Ownable_init_unchained();
     __Controller_init_unchained(_rewards);
     __ERC721_init_unchained("ZeroController", "ZWRITE");
     underwriterLockImpl = ZeroFactoryLib.deployImplementation(type(ZeroUnderwriterLock).creationCode, "zero.underwriter.lock-implementation");
   }
   function lockFor(address underwriter) public view returns (ZeroUnderwriterLock result) {
     result = ZeroLib.lockFor(address(this), underwriter);
   }
   function mint(address underwriter, yVault vault) public {
     address lock = ZeroFactoryLib.deploy(underwriterLockImpl, keccak256(abi.encodePacked(underwriter)));
     ZeroUnderwriterLock(lock).initialize(vault);
     _mint(msg.sender, uint256(uint160(lock)));
   }
}
