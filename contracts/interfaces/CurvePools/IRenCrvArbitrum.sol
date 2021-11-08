interface IRenCrvArbitrum {
  function exchange(uint128 i, uint128 j, uint256 dx, uint256 min_dy, address recipient) external returns (uint256);
}
