# Contract Layout

The vault smart contracts use an upgradeable proxy pattern that minimizes gas costs at runtime.

Each asset's implementation contract should have a separate deployment, with all values specific to that asset set as immutables.

**Rules**

Constructors **must** only initialize immutable values or validate constants -- they **must not** write to storage.

EIP712 type hashes **must** be declared as constants, with their values validated in the constructor.

Every contract with storage variables, events or errors **must** inherit a `<Contract>Base` contract which declares them, stored at `/storage/<Contract>Base.sol`. If the contract inherits other contracts with storage, the base contract **must** inherit each immediate parent's base contract in the order in which the parent contracts will be inherited. Example:

```
contract AStorage {
  uint256 a;
}

contract A is Astorage {
  function setA(uint256 newA) public {
    a = newA;
  }
}

contract BStorage is AStorage {
  uint256 b;
}

contract B is BStorage, A {
  function setB() public {
    b = a + b;
  }
}
```

## Add module

Verify module.asset() == asset.
Write

## Loan

Loan triggers `module` to do some conversion of the base asset that results in the borrower receiving the desired asset.

Any information about what the module should do, such as the output token address, is encoded in `data`.

Module calculates max gas cost of tx in eth and in `asset`. Subtracts the asset price from the amount received by the caller and returns the eth price to the vault.

Vault transfers eth value of gas to `tx.origin`.

Module also returns amount of collateral to lock for the lender, which for `ImmediateRelease` should always be equal to the borrowed amount (original, not amount received after gas).

## Repay

Repay triggers `module` to do any action necessary to release a loan or convert assets not repaid in full.

Any information about what the module should do, such as the output token address, is encoded in `data`.

Module calculates max gas cost of tx in eth and returns to the vault. Vault transfers that amount of eth to tx.origin.

Module returns amount of collateral to unlock for the lender. This could be different from `repaidAmount`, e.g. if the loan did not do an immediate release, the module would be able to recoup some of its losses and collateral unlocked could be greater.

Any collateral unlocked in excess of the original loan amount will simply accrue to the vault itself and not the lender.

## Repay

On repay, do not call module. Simply close out the loan and unlock the caller's shares.

**ModuleType.DelayedRelease**
Trigger the module in order to determine amount of shares to lock for the lender and handle any other logic the module does to handle loaned assets.

CR <= 100%

On repay, call the module to determine the amount of shares to unlock for the caller.

# Loan

```

```

```

```
