// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

import "./storage/ModuleRegistryBase.sol";
import "./Governable.sol";

abstract contract ModuleRegistry is ModuleRegistryBase, Governable {
  function asset() public view virtual returns (address);

  function addModule(address module) external onlyGovernance {
    approvedModules[module] = true;
    emit ModuleStatusUpdated(module, true);
  }

  function removeModule(address module) external onlyGovernance {
    approvedModules[module] = false;
    emit ModuleStatusUpdated(module, false);
  }
}
