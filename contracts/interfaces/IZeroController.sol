pragma solidity >=0.6.0;

interface IZeroController {
	function lockFor(address underwriter) external view returns (address result);
}
