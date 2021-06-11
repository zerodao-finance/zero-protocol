pragma solidity >=0.6.0;

import { IERC20 } from "oz410/token/ERC20/IERC20.sol";

abstract contract IyVault is IERC20 {
  function getPricePerFullShare() external virtual view returns (uint256);
}
