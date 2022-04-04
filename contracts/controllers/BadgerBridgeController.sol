// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import { ZeroLib } from "../libraries/ZeroLib.sol";
import { ZeroControllerTemplate } from "./ZeroControllerTemplate.sol";
import { IRenCrv } from "../interfaces/CurvePools/IRenCrv.sol";
import { IGateway } from "../interfaces/IGateway.sol";
import {ICurveETHUInt256} from '../interfaces/CurvePools/ICurveETHUInt256.sol';
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Math } from "@openzeppelin/contracts/utils/
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract BadgerBridgeZeroController is ZeroControllerTemplate {
        address public strategist;
        address constant btcGateway = 0xe4b679400F0f267212D5D812B95f58C83243EE71;
        address constant wbtc = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;
        address constant renbtc = 0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D;
	address constant renCrv = 0x93054188d876f558f4a66B2EF1d97d16eDf0895B;
	address constant tricrypto = 0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5;
        uint256 public constant fee = uint256(3e15);
        uint256 public constant governanceFee = uint256(5e17);
        uint256 public constant GAS_COST = uint256(5e5);
        uint256 public constant ETH_RESERVE = uint256(5 ether);
        uint256 public gasCostInWBTC;
        function initialize(address _governance, address _strategist) public initializer {
          governance = _governance;
          strategist = _strategist;
	  IERC20(renbtc).safeApprove(renCrv, ~uint256(0) >> 2);
	  IERC20(wbtc).safeApprove(tricrypto, ~uint256(0) >> 2);
        }
        function applyRatio(uint256 v, uint256 n) internal pure returns (uint256 result) {
          result = v.mul(n).div(uint256(1 ether));
        }
        function toWBTC() internal returns (uint256 amountOut) {
          uint256 amountStart = IERC20(wbtc).balanceOf(address(this));
          (bool success,) = renCrv.call(abi.encodeWithSelector(IRenCrv.exchange.selector, 0, 1, IERC20(renbtc).balanceOf(address(this))));
          amountOut = IERC20(wbtc).balanceOf(address(this)).sub(amountStart);
        }
        function toETH() internal returns (uint256 amountOut) {
          uint256 wbtcStart = IERC20(wbtc).balanceOf(address(this));
          uint256 amountStart = address(this).balance;
          (bool success,) = tricrypto.call(abi.encodeWithSelector(ICurveETHUInt256.exchange.selector, 1, 2, wbtcStart, 0, true));
          amountOut = address(this).balance.sub(amountStart);
          gasCostInWBTC = GAS_COST.mul(wbtcStart.mul(uint256(1 ether))).div(amountOut);
        }
        function earn() public {
          toETH();
          uint256 balance = address(this).balance;
          if (balance > ETH_RESERVE) {
            uint256 output = balance - ETH_RESERVE;
            uint256 toGovernance = applyRatio(output, governanceFee);
            governance.send(toGovernance);
            strategist.send(output.sub(toGovernance));
          }
        }
        function deductFee(uint256 amountIn) internal pure returns (uint256 amount) {
          amount = amountIn.sub(gasCostInWBTC.mul(tx.gasprice).div(uint256(1 ether)).add(applyRatio(amountIn, fee)));
        }
	function toTypedDataHash(ZeroLib.LoanParams memory params, address underwriter)
		internal
		view
		returns (bytes32 result)
	{
		bytes32 digest = _hashTypedDataV4(
			keccak256(
				abi.encode(
					keccak256(
						'TransferRequest(address asset,uint256 amount,address underwriter,address module,uint256 nonce,bytes data)'
					),
					params.asset,
					params.amount,
					underwriter,
					params.module,
					params.nonce,
					keccak256(params.data)
				)
			)
		);
		return digest;
	}
	function repay(
		address underwriter,
		address to,
		address asset,
		uint256 amount,
		uint256 actualAmount,
		uint256 nonce,
		address module,
		bytes32 nHash,
		bytes memory data,
		bytes memory signature
	) public {
		uint256 _gasBefore = gasleft();
		ZeroLib.LoanParams memory params = ZeroLib.LoanParams({
			to: to,
			asset: asset,
			amount: amount,
			nonce: nonce,
			module: module,
			data: data
		});
		bytes32 digest = toTypedDataHash(params, underwriter);

		uint256 _mintAmount = IGateway(btcGateway).mint(
			keccak256(abi.encode(params.to, params.nonce, params.module, params.data)),
			actualAmount,
			nHash,
			signature
		);
                uint256 amountPaid = deductFee(toWBTC());
		tx.origin.transfer(Math.min(_gasBefore.sub(gasleft()).add(10e3).mul(tx.gasprice), address(this).balance));
	}
	function fallbackMint(
		address underwriter,
		address to,
		address asset,
		uint256 amount,
		uint256 actualAmount,
		uint256 nonce,
		address module,
		bytes32 nHash,
		bytes memory data,
		bytes memory signature
	) public {
		ZeroLib.LoanParams memory params = ZeroLib.LoanParams({
			to: to,
			asset: asset,
			amount: amount,
			nonce: nonce,
			module: module,
			data: data
		});
		bytes32 digest = toTypedDataHash(params, underwriter);
		uint256 _actualAmount = IGateway(btcGateway).mint(
			keccak256(abi.encode(params.to, params.nonce, params.module, params.data)),
			actualAmount,
			nHash,
			signature
		);
		IERC20(asset).safeTransfer(to, _actualAmount);
	}
}

