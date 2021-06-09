// SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
@title contract that is the simplest underwriter, just a proxy with an owner tag
@author raymondpulver
*/
contract TrivialUnderwriter is Ownable
  address payable public immutable controller;
  constructor(address _controller) Ownable() {}
  function bubble(bool success, bytes memory response) internal {
    assembly {
      if iszero(success) {
        revert(add(0x20, response), mload(response))
      }
      return(add(0x20, response), mload(response))
    }
  }
  /**
  @notice proxy a regular call to an arbitrary contract
  @param target the to address of the transaction
  @param data the calldata for the transaction
  */
  function proxy(address payable target, bytes memory data) public payable onlyOwner {
    (bool success, bytes memory response) = target.call{ value: msg.value }(data);
    bubble(success, response);
  }
  /**
  @notice handles any other call and forwards to the controller
  */
  fallback() external payable {
    require(msg.sender == owner(), "must be called by owner");
    (bool success, bytes memory response) = controller.call{ value: msg.value }(msg.data);
    bubble(success, data);
  }
}
