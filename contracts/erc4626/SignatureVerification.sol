// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./EIP712/AbstractEIP712.sol";
import "./utils/MemoryRestoration.sol";
import { ECDSA } from "oz460/utils/cryptography/ECDSA.sol";

// With underwriter
// bytes32 constant _TRANSFER_REQUEST_TYPE_HASH = 0xdb76b3b6f252d5a7418b86aea25c87126f450d18491ccb7b8427fe0e9697a31c;
// bytes32 constant _META_REQUEST_TYPE_HASH = 0xacca73c15b476818f48739adc92f84de507f609afc17aeef89e2bebadd929d18;
// bytes constant TransferRequestTypeString = "TransferRequest(address asset,uint256 amount,address underwriter,address module,uint256 nonce,bytes data)";
// bytes constant MetaRequestTypeString = "MetaRequest(address asset,address underwriter,address module,uint256 nonce,bytes data)";

uint256 constant TransferRequest_typeHash_ptr = 0x0;
uint256 constant TransferRequest_asset_ptr = 0x20;
uint256 constant TransferRequest_amount_ptr = 0x40;
// uint256 constant TransferRequest_underwriter_ptr = 0;
uint256 constant TransferRequest_module_ptr = 0x60;
uint256 constant TransferRequest_nonce_ptr = 0x80;
uint256 constant TransferRequest_data_offset = 0x80;

// Without Underwriter
bytes32 constant _TRANSFER_REQUEST_TYPE_HASH = 0x9bb77eff76a7692d1cd3e09b42675d0ef4c6d1fc6437ed88c47852ef44f69558;
bytes32 constant _META_REQUEST_TYPE_HASH = 0xf35bb2892bbe9a67a97503bb135e39d415a9f8dacc33c3d5dd39dd5c52ebc29b;
bytes32 constant _PERMIT_TYPE_HASH = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;
bytes constant TransferRequestTypeString = "TransferRequest(address asset,uint256 amount,address module,uint256 nonce,bytes data)";
bytes constant MetaRequestTypeString = "MetaRequest(address asset,uint256 amount,address module,uint256 nonce,bytes data)";
bytes constant PermitTypeString = "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)";

abstract contract SignatureVerification is AbstractEIP712, MemoryRestoration {
  error InvalidSigner();

  constructor() {
    if (
      _TRANSFER_REQUEST_TYPE_HASH != keccak256(TransferRequestTypeString) ||
      _META_REQUEST_TYPE_HASH != keccak256(MetaRequestTypeString) ||
      _PERMIT_TYPE_HASH != keccak256(PermitTypeString)
    ) {
      revert InvalidTypeHash();
    }
  }

  function digestPermit(
    uint256 nonce,
    uint256 deadline // private because memory repairs happen in verifyPermitSignature
  ) private view returns (bytes32 digest) {
    bytes32 domainSeparator = getDomainSeparator();
    assembly {
      mstore(0, _PERMIT_TYPE_HASH)
      calldatacopy(0x20, 4, 0x60)
      mstore(0x80, nonce)
      mstore(0xa0, deadline)
      let permitHash := keccak256(0, 0xc0)
      mstore(0, EIP712SignaturePrefix)
      mstore(2, domainSeparator)
      mstore(0x22, permitHash)
      digest := keccak256(0, 0x42)
    }
  }

  function verifyPermitSignature(
    address owner,
    uint256 nonce,
    uint256 deadline
  ) internal view RestoreTwoWords(0x80, 0xa0) RestoreFreeMemoryPointer RestoreZeroSlot {
    bytes32 digest = digestPermit(nonce, deadline);
    bool validSignature;
    assembly {
      mstore(0, digest)
      calldatacopy(0x20, 0x84, 0x60)
      let success := staticcall(
        gas(),
        0x1, // ecrecover precompile
        0x0,
        0x80,
        0x0,
        0x20
      )
      validSignature := and(
        success, // call succeeded
        and(
          gt(owner, 0), // owner != 0
          eq(owner, mload(0)) // owner == recoveredAddress
        )
      )
    }
    if (!validSignature) {
      revert InvalidSigner();
    }
  }

  function digestTransferRequest(
    address asset,
    uint256 amount,
    address module,
    uint256 nonce,
    bytes memory data
  ) internal view RestoreFreeMemoryPointer RestoreZeroSlot RestoreTwoWords(0x80, 0xa0) returns (bytes32 digest) {
    bytes32 domainSeparator = getDomainSeparator();
    assembly {
      mstore(0x0, _TRANSFER_REQUEST_TYPE_HASH)
      mstore(0x20, asset)
      mstore(0x40, amount)
      mstore(0x60, module)
      mstore(0x80, nonce)
      mstore(0xa0, keccak256(add(data, 0x20), mload(data)))
      let transferRequestHash := keccak256(0, 0xc0)
      mstore(0, EIP712SignaturePrefix)
      mstore(2, domainSeparator)
      mstore(0x22, transferRequestHash)
      digest := keccak256(0, 0x42)
    }
  }

  function verifyTransferRequestSignature(
    address signer,
    address asset,
    uint256 amount,
    address module,
    uint256 nonce,
    bytes memory data,
    bytes memory signature
  ) internal view returns (bytes32 digest) {
    digest = digestTransferRequest(asset, amount, module, nonce, data);
    verifySignature(signer, digest, signature);
  }

  function verifySignature(
    address signer,
    bytes32 digest,
    bytes memory signature
  ) internal pure {
    address recoveredAddress = ECDSA.recover(digest, signature);
    if (recoveredAddress == address(0) || recoveredAddress != signer) {
      revert InvalidSigner();
    }
  }
}
