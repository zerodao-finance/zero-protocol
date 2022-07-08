// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.13;

import "./EIP712/AbstractEIP712.sol";
import "./storage/EIP2612Base.sol";
import "./SignatureVerification.sol";

abstract contract EIP2612 is EIP2612Base, SignatureVerification {
  /*//////////////////////////////////////////////////////////////
                             EIP-2612 LOGIC
    //////////////////////////////////////////////////////////////*/

  function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8,
    bytes32,
    bytes32
  ) public virtual {
    if (deadline < block.timestamp) {
      revert PermitDeadlineExpired(deadline, block.timestamp);
    }
    verifyPermitSignature(owner, nonces[owner]++, deadline);

    // Unchecked because the only math done is incrementing
    // the owner's nonce which cannot realistically overflow.
    unchecked {
      allowance[owner][spender] = value;
    }

    emit Approval(owner, spender, value);
  }
}
