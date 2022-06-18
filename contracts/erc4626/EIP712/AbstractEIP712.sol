// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

uint256 constant EIP712SignaturePrefix = 0x1901000000000000000000000000000000000000000000000000000000000000;
bytes32 constant _DOMAIN_TYPE_HASH = 0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f;

abstract contract AbstractEIP712 {
  uint256 private immutable _CHAIN_ID;
  bytes32 private immutable _DOMAIN_SEPARATOR;
  bytes32 private immutable _NAME_HASH;
  bytes32 private immutable _VERSION_HASH;

  error InvalidTypeHash();

  constructor(string memory _name, string memory _version) {
    _CHAIN_ID = block.chainid;
    _NAME_HASH = keccak256(bytes(_name));
    _VERSION_HASH = keccak256(bytes(_version));
    _DOMAIN_SEPARATOR = computeDomainSeparator();
    if (
      _DOMAIN_TYPE_HASH !=
      keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")
    ) {
      revert InvalidTypeHash();
    }
  }

  function computeDomainSeparator() internal view returns (bytes32) {
    return keccak256(abi.encode(_DOMAIN_TYPE_HASH, _NAME_HASH, _VERSION_HASH, block.chainid, verifyingContract()));
  }

  function getDomainSeparator() public view virtual returns (bytes32) {
    return block.chainid == _CHAIN_ID ? _DOMAIN_SEPARATOR : computeDomainSeparator();
  }

  function verifyingContract() internal view virtual returns (address);
}
