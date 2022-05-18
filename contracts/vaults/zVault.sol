// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20Upgradeable as IERC20} from "oz460u/token/ERC20/IERC20Upgradeable.sol";
import "oz460u/utils/AddressUpgradeable.sol";
import {SafeERC20Upgradeable as SafeERC20} from "oz460u/token/ERC20/utils/SafeERC20Upgradeable.sol";
import {zVaultLib} from "../libraries/zVaultLib.sol";
import "oz460u/token/ERC20/ERC20Upgradeable.sol";
import "oz460u/utils/math/SafeMathUpgradeable.sol";
import {ERC20} from "@openzeppelin/contracts-new/token/ERC20/ERC20.sol";

import "../interfaces/IControllerV2.sol";

contract zVault is ERC20Upgradeable {
  using SafeERC20 for IERC20;
  using AddressUpgradeable for address;
  using SafeMathUpgradeable for uint256;

  IERC20 public token;

  uint256 public min = 25;
  uint256 public constant max = 30;
  uint256 constant ISOLATE =
    uint256(keccak256(abi.encodePacked("isolate-slot")));

  modifier isWhitelisted() {
    zVaultLib.Isolate storage isolate = zVaultLib.toIsolate(ISOLATE);
    require(isolate.whitelist[msg.sender], "!whitelist");
    _;
  }

  modifier onlyGovernance() {
    zVaultLib.Isolate storage isolate = zVaultLib.toIsolate(ISOLATE);
    require(msg.sender == isolate.governance, "!governance");
    _;
  }

  modifier onlyController() {
    zVaultLib.Isolate storage isolate = zVaultLib.toIsolate(ISOLATE);
    require(msg.sender == isolate.controller, "!controller");
    _;
  }

  function addToWhitelist(address[] calldata entries) external onlyGovernance {
    zVaultLib.Isolate storage isolate = zVaultLib.toIsolate(ISOLATE);
    for (uint256 i = 0; i < entries.length; i++) {
      address entry = entries[i];
      require(entry != address(0));

      isolate.whitelist[entry] = true;
    }
  }

  function removeFromWhitelist(address[] calldata entries)
    external
    onlyGovernance
  {
    zVaultLib.Isolate storage isolate = zVaultLib.toIsolate(ISOLATE);
    for (uint256 i = 0; i < entries.length; i++) {
      address entry = entries[i];
      isolate.whitelist[entry] = false;
    }
  }

  function __yVault_init_unchained(
    address _token,
    address _controller,
    string memory _name,
    string memory _symbol
  ) public initializer {
    __ERC20_init_unchained(_name, _symbol);
    token = IERC20(_token);
    zVaultLib.Isolate storage isolate = zVaultLib.toIsolate(ISOLATE);
    isolate.governance = msg.sender;
    isolate.controller = _controller;
  }

  function decimals() public view override returns (uint8) {
    return ERC20(address(token)).decimals();
  }

  function balance() public view returns (uint256) {
    zVaultLib.Isolate storage isolate = zVaultLib.toIsolate(ISOLATE);
    return
      token.balanceOf(address(this)).add(
        IController(isolate.controller).balanceOf(address(token))
      );
  }

  function setMin(uint256 _min) external onlyGovernance {
    min = _min;
  }

  function setGovernance(address _governance) public onlyGovernance {
    zVaultLib.Isolate storage isolate = zVaultLib.toIsolate(ISOLATE);
    isolate.governance = _governance;
  }

  function setController(address _controller) public onlyGovernance {
    zVaultLib.Isolate storage isolate = zVaultLib.toIsolate(ISOLATE);
    isolate.controller = _controller;
  }

  // Custom logic in here for how much the vault allows to be borrowed
  // Sets minimum required on-hand to keep small withdrawals cheap
  function available() public view returns (uint256) {
    return token.balanceOf(address(this)).mul(min).div(max);
  }

  function earn() public onlyGovernance {
    zVaultLib.Isolate storage isolate = zVaultLib.toIsolate(ISOLATE);
    uint256 _bal = available();
    token.safeTransfer(isolate.controller, _bal);
    IController(isolate.controller).earn(address(token), _bal);
  }

  function depositAll() external {
    deposit(token.balanceOf(msg.sender));
  }

  function deposit(uint256 _amount) public {
    uint256 _pool = balance();
    uint256 _before = token.balanceOf(address(this));
    token.safeTransferFrom(msg.sender, address(this), _amount);
    uint256 _after = token.balanceOf(address(this));
    _amount = _after.sub(_before); // Additional check for deflationary tokens
    uint256 shares = 0;
    if (totalSupply() == 0) {
      shares = _amount;
    } else {
      shares = (_amount.mul(totalSupply())).div(_pool);
    }
    _mint(msg.sender, shares);
  }

  function withdrawAll() external {
    withdraw(balanceOf(msg.sender));
  }

  // Used to swap any borrowed reserve over the debt limit to liquidate to 'token'
  function harvest(address reserve, uint256 amount) external onlyController {
    zVaultLib.Isolate storage isolate = zVaultLib.toIsolate(ISOLATE);
    require(reserve != address(token), "token");
    IERC20(reserve).safeTransfer(isolate.controller, amount);
  }

  // No rebalance implementation for lower fees and faster swaps
  function withdraw(uint256 _shares) public {
    zVaultLib.Isolate storage isolate = zVaultLib.toIsolate(ISOLATE);
    uint256 r = (balance().mul(_shares)).div(totalSupply());
    _burn(msg.sender, _shares);

    // Check balance
    uint256 b = token.balanceOf(address(this));
    if (b < r) {
      uint256 _withdraw = r.sub(b);
      IController(isolate.controller).withdraw(address(token), _withdraw);
      uint256 _after = token.balanceOf(address(this));
      uint256 _diff = _after.sub(b);
      if (_diff < _withdraw) {
        r = b.add(_diff);
      }
    }

    token.safeTransfer(msg.sender, r);
  }

  function getPricePerFullShare() public view returns (uint256) {
    return balance().mul(1e18).div(totalSupply());
  }
}
