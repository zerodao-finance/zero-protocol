// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import {Initializable} from "oz410/proxy/utils/Initializable.sol";

/**
@title must be inherited by a contract that will be deployed with ZeroFactoryLib
@author raymondpulver
*/
abstract contract Implementation is Initializable {
    /**
  @notice ensure the contract cannot be initialized twice
  */
    function lock() public virtual {
        // no other logic
    }
}
