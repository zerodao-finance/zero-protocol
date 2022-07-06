import "../erc4626/loans/LendableSharesVault.sol";
import { EIP712 } from "../erc4626/EIP712/EIP712.sol";

contract TestLendableSharesVault is LendableSharesVault, EIP712 {
  using SafeTransferLib for address;

  string public constant version = "v1";

  constructor(address underlying)
    ERC4626(underlying)
    ERC20Metadata("TestVault", "TestVault", 18)
    ReentrancyGuard()
    EIP712("TestVault", version)
  {}

  function borrowFrom(
    uint256 loanId,
    address lender,
    address borrower,
    uint256 borrowAmount
  ) external {
    _borrowFrom(loanId, lender, borrower, borrowAmount);
    asset.safeTransfer(borrower, borrowAmount);
  }

  function repayTo(
    address lender,
    uint256 loanId,
    uint256 assetsRepaid
  ) external {
    asset.safeTransferFrom(lender, address(this), assetsRepaid);
    _repayTo(lender, loanId, assetsRepaid);
  }

  function freeMint(address to, uint256 amount) external {
    _mint(to, amount);
  }
}
