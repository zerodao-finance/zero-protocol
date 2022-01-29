# SwapV2 Specification

## What the contract should accept 

### Data parameter (ABI encoded)

* `address[] memory path`
* `uint256 amountIn` 
* `address recipient` 
* `bytes memory callData` 

## Collaterization requirement

* 100%

## Logic

* 0.1% of received renBTC should be a supplementary fee
* Deposit the supplementary fee into the BTCVault
* Deposit the resulting zeroBTC to the ZeroUnderwriterLock contract w/ the underwriter 
  * This should be retrieved from `IZeroController(msg.sender).lockFor(underwriter)`

## What receiveLoan needs to do

* Execute the trade 
* Charge the extra fee
* Release the funds immediately 
* **Guard against reentrancy**

### Condition 

* If callData is not 0x 
    * Then approve the `recipient` to `transferFrom` the output token for the value of the output 
    * Then send a transaction with `callData` passed as input to the target contract with `200000` gas
* If callData is 0x
    * Simply transfer funds to the recipient and exit 

## repayLoan

* Should be a no-op
* Just execute the trade eagerly
