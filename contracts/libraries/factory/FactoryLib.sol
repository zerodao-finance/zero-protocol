// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import { Implementation } from "./Implementation.sol";

/**
@title clone factory library
@notice deploys implementation or clones
*/
library FactoryLib {
  function assembleCreationCode(address implementation) internal pure returns (bytes memory result) {
    result = new bytes(0x37);
    bytes20 targetBytes = bytes20(implementation);
    assembly {
      let clone := add(result, 0x20)
      mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
      mstore(add(clone, 0x14), targetBytes)
      mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
    }
  }
  function computeAddress(address creator, address implementation, bytes32 salt) internal pure returns (address result) {
    result = Create2.computeAddress(creator, salt, assembleCreationCode(implementation));
  }
  /// @notice Deploys a given master Contract as a clone.
  /// Any ETH transferred with this call is forwarded to the new clone.
  /// Emits `LogDeploy`.
  /// @param masterContract The address of the contract to clone.
  /// @param data Additional abi encoded calldata that is passed to the new clone via `IMasterContract.init`.
  /// @param useCreate2 Creates the clone by using the CREATE2 opcode, in this case `data` will be used as salt.
  /// @return cloneAddress Address of the created clone contract.
  function deploy(
    address implementation,
    bytes32 salt
  ) public payable returns (address cloneAddress) {
    bytes memory creationCode = assembleCreationCode(implementation);
    assembly {
      cloneAddress := create2(0, add(0x20, creationCode), 0x37, salt)
    }
  }
  function deployImplementation(bytes memory creationCode, string memory id) internal returns (address implementation) {
    bytes32 salt = keccak256(id);
    assembly {
      implementation := create2(0, add(0x20, creationCode), mload(creationCode), salt)
    }
    Implementation(implementation).lock();
  }
}
