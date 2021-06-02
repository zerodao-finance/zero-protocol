// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import {Initializable} from "@openzeppelin/contracts/proxy/Initializable.sol";

/**
@title must be inherited by a contract that will be deployed with ZeroFactoryLib
@author raymondpulver
*/
abstract contract Implementation is Initializable {
    /**
  @title ensure the contract cannot be initialized twice
  */
    function lock() public virtual initializer {
        // no other logic
    }
}
