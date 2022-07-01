// SPDX-License-Identifier: MIT

pragma solidity >=0.8.7 <0.9.0;
import { BadgerBridgeZeroController } from "../controllers/BadgerBridgeZeroController.sol";
import "../libraries/SplitSignatureLib.sol";

contract DummyBurnCaller {
  constructor() {}

  function callBurn(
    address controller,
    address from,
    address asset,
    uint256 amount,
    uint256 deadline,
    bytes memory signature,
    bytes memory destination
  ) public {
    (uint8 v, bytes32 r, bytes32 s) = SplitSignatureLib.splitSignature(signature);
    uint256 nonce = IERC2612Permit(asset).nonces(from);
    IERC2612Permit(asset).permit(from, address(this), nonce, deadline, true, v, r, s);
    (bool success, bytes memory data) = controller.call(
      abi.encodeWithSelector(BadgerBridgeZeroController.burnApproved.selector, from, asset, amount, 1, destination)
    );
  }
}
