import { FixedPointMathLib } from "@rari-capital/solmate/src/utils/FixedPointMathLib.sol";

/**
 * @notice Base contract that must be inherited by all modules.
 */
abstract contract BaseModule {
  using FixedPointMathLib for uint256;

  /// @notice Base asset of the vault which is calling the module.
  /// This value is private because it is read only to the module.
  address public immutable asset;

  /// @notice Isolated storage pointer for any data that the module must write
  /// Use like so:
  /// function getModuleStorage() internal returns (ModuleData storage moduleData) {
  ///   bytes32 moduleSlot = _moduleSlot;
  ///   assembly { moduleData := moduleSlot }
  /// }
  uint256 internal immutable _moduleSlot;

  constructor(address _asset) {
    asset = _asset;
    _moduleSlot = uint256(keccak256(abi.encode(address(this)))) - 1;
  }

  /// @notice Returns the maximum amount of gas that will be used by
  /// a burn call. This should simply be a constant set in the
  /// inheriting contract.
  function maxBurnGas() external virtual returns (uint256);

  /// @notice Returns the maximum amount of gas that will be used by
  /// a burn call. This should simply be a constant set in the
  /// inheriting contract.
  function maxLoanGas() external virtual returns (uint256);

  /// @notice Returns the maximum amount of gas that will be used by
  /// a burn call. This should simply be a constant set in the
  /// inheriting contract.
  function maxRepayGas() external virtual returns (uint256);

  /**
   * @notice Repays a loan.
   *
   * This is always called in a delegatecall.
   *
   * `collateralToUnlock` should be equal to `repaidAmount` unless the vault
   * has less than 100% collateralization or the loan is underpaid.
   *
   * @param borrower Recipient of the loan
   * @param repaidAmount Amount of `asset` being repaid.
   * @param loanId Unique (per vault) identifier for a loan.
   * @param data Any additional data provided to the module.
   * @return collateralToUnlock Amount of collateral to unlock for the lender.
   * @return gasCostEther Max gas value expected to be used by module.
   */
  function repayLoan(
    address borrower,
    uint256 repaidAmount,
    uint256 loanId,
    bytes calldata data
  ) external virtual returns (uint256 collateralToUnlock, uint256 gasCostEther) {
    // Get gas price in ETH
    gasCostEther = this.maxRepayGas() * getGasPrice();
    // Handle loan using module's logic, reducing borrow amount by the value of gas used
    collateralToUnlock = _repayLoan(borrower, repaidAmount, loanId, data);
  }

  /**
   * @notice Take out a loan.
   *
   * This is always called in a delegatecall.
   *
   * `collateralToLock` should be equal to `borrowAmount` unless the vault
   * has less than 100% collateralization.
   *
   * @param borrower Recipient of the loan
   * @param borrowAmount Amount of `asset` being borrowed.
   * @param loanId Unique (per vault) identifier for a loan.
   * @param data Any additional data provided to the module.
   * @return collateralToLock Amount of collateral to lock for the lender.
   * @return gasCostEther Max gas value expected to be used by module.
   */
  function receiveLoan(
    address borrower,
    uint256 borrowAmount,
    uint256 loanId,
    bytes calldata data
  ) external virtual returns (uint256 collateralToLock, uint256 gasCostEther) {
    // Get gas price in ETH
    gasCostEther = this.maxLoanGas() * getGasPrice();
    // Get gas price in `asset`
    uint256 gasCostAsset = gasCostEther.mulDivUp(getEthPrice(), 1e18);
    // Handle loan using module's logic, reducing borrow amount by the value of gas used
    collateralToLock = _receiveLoan(borrower, borrowAmount - gasCostAsset, loanId, data);
  }

  /* ---- Override These In Child ---- */

  function _receiveLoan(
    address borrower,
    uint256 borrowAmount,
    uint256 loanId,
    bytes calldata data
  ) internal virtual returns (uint256 collateralToLock);

  function _repayLoan(
    address borrower,
    uint256 repaidAmount,
    uint256 loanId,
    bytes calldata data
  ) internal virtual returns (uint256 collateralToUnlock);

  function swap(bytes32) internal virtual returns (uint256 amountOut);

  function swapBack(bytes32) internal virtual returns (uint256 amountOut);

  function transfer(address to, uint256 amount) internal virtual;

  /* ---- Leave Empty For Now ---- */

  /// @notice Return recent average gas price in wei per unit of gas
  function getGasPrice() internal view virtual returns (uint256) {
    return 1;
  }

  /// @notice Get current price of ETH in terms of `asset`
  function getEthPrice() internal view virtual returns (uint256) {
    return 1;
  }
}
