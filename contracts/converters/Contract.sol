pragma solidity ^0.6.0;

interface ICurvePool {
  function exchange_underlying(
    uint128 i,
    int128 j,
    uint256 dx,
    uint256 min_dy
  ) external view returns (uint256);
}

contract Contract {
  constructor() public {
    (bool success, bytes memory result) = address(0xC2d95EEF97Ec6C17551d45e77B590dc1F9117C67).call(
      abi.encodeWithSelector(
        ICurvePool.exchange_underlying.selector,
        int128(0),
        int128(1),
        uint256(0),
        uint256(int256(-1))
      )
    );
    bytes memory response = abi.encode(success, result);
    assembly {
      return(add(response, 0x20), mload(response))
    }
  }
}
