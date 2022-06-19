// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import "../storage/ERC20Base.sol";

contract ERC20Metadata is ERC20Base {
  /*//////////////////////////////////////////////////////////////
                            Metadata Constants
    //////////////////////////////////////////////////////////////*/

  bytes32 private immutable compactName;

  bytes32 private immutable compactSymbol;

  uint8 public immutable decimals;

  /*//////////////////////////////////////////////////////////////
                            Constructor
    //////////////////////////////////////////////////////////////*/

  constructor(
    string memory _name,
    string memory _symbol,
    uint8 _decimals
  ) {
    decimals = _decimals;
    if (bytes(_name).length > 31 || bytes(_symbol).length > 31) {
      revert InvalidCompactString();
    }
    bytes32 _compactName;
    bytes32 _compactSymbol;
    assembly {
      _compactName := mload(add(_name, 31))
      _compactSymbol := mload(add(_symbol, 31))
    }
    compactName = _compactName;
    compactSymbol = _compactSymbol;
  }

  /*//////////////////////////////////////////////////////////////
                            Metadata Getters
    //////////////////////////////////////////////////////////////*/

  function name() public view returns (string memory str) {
    bytes32 _compactName = compactName;
    assembly {
      // Get free memory pointer
      let freeMemPtr := mload(0x40)
      // Set pointer to string
      str := freeMemPtr
      // Increase free memory pointer by 64 bytes
      mstore(0x40, add(freeMemPtr, 0x40))
      // Write length and name to string
      mstore(add(freeMemPtr, 0x1f), _compactName)
    }
  }

  function symbol() public view returns (string memory str) {
    bytes32 _compactSymbol = compactSymbol;
    assembly {
      // Get free memory pointer
      let freeMemPtr := mload(0x40)
      // Set pointer to string
      str := freeMemPtr
      // Increase free memory pointer by 64 bytes
      mstore(0x40, add(freeMemPtr, 0x40))
      // Write length and symbol to string
      mstore(add(freeMemPtr, 0x1f), _compactSymbol)
    }
  }
}
