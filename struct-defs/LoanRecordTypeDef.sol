struct LoanRecord {
  // Amount of shares locked for the loan
  uint48 sharesLocked {}

  // Amount of underlying assets transferred out of the vault
  uint48 actualBorrowAmount {}

  // Amount of underlying assets the lender is responsible for
  // repaying, equal to borrow amount plus gas and zero fees
  uint48 lenderDebt {}

  // Amount of 
  uint48 vaultExpenseWithoutRepayFee {}

  // Time at which the loan expires
  uint32 expiry {}
}
