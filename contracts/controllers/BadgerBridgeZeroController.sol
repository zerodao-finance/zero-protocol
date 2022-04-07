// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import {UniswapV2Library} from "../libraries/UniswapV2Library.sol";
import {ZeroLib} from '../libraries/ZeroLib.sol';
import {IERC2612Permit} from '../interfaces/IERC2612Permit.sol';
import {ZeroControllerTemplate} from './ZeroControllerTemplate.sol';
import {IRenCrv} from '../interfaces/CurvePools/IRenCrv.sol';
import {SplitSignatureLib } from "../libraries/SplitSignatureLib.sol";
import {IBadgerSettPeak } from "../interfaces/IBadgerSettPeak.sol";
import { ICurveFi } from "../interfaces/ICurveFi.sol";
import {IGateway} from '../interfaces/IGateway.sol';
import {ICurveETHUInt256} from '../interfaces/CurvePools/ICurveETHUInt256.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { IyVault } from "../interfaces/IyVault.sol";
import { ISett } from "../interfaces/ISett.sol";
import {Math} from '@openzeppelin/contracts/math/Math.sol';
import {SafeMath} from '@openzeppelin/contracts/math/SafeMath.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import {ECDSA} from '@openzeppelin/contracts/cryptography/ECDSA.sol';

contract BadgerBridgeZeroController is ZeroControllerTemplate {
	using SafeERC20 for IERC20;
	using SafeMath for *;
	address constant btcGateway = 0xe4b679400F0f267212D5D812B95f58C83243EE71;
	address constant router = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
	address constant factory = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
        address constant usdc = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
        address constant weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
	address constant wbtc = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;
	address constant renbtc = 0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D;
	address constant renCrv = 0x93054188d876f558f4a66B2EF1d97d16eDf0895B;
	address constant tricrypto = 0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5;
        address constant renCrvLp = 0x49849C98ae39Fff122806C06791Fa73784FB3675;
        address constant bCrvRen = 0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545;
        address constant settPeak = 0x41671BA1abcbA387b9b2B752c205e22e916BE6e3;
        address constant ibbtc = 0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F;
	uint256 public governanceFee;
	uint256 constant GAS_COST = uint256(3e5);
        uint256 constant IBBTC_GAS_COST = uint256(7e5);
	uint256 constant ETH_RESERVE = uint256(5 ether);
	uint256 internal renbtcForOneETHPrice;
        uint256 internal burnFee;
	mapping(address => uint256) public nonces;
	bytes32 internal PERMIT_DOMAIN_SEPARATOR_WBTC;
	bytes32 internal PERMIT_DOMAIN_SEPARATOR_IBBTC;

	function getChainId() internal pure returns (uint256 result) {
		assembly {
			result := chainid()
		}
	}
        function setParameters(uint256 _governanceFee, uint256 _fee, uint256 _burnFee) public {
          require(governance == msg.sender, "!governance");
          governanceFee = _governanceFee;
          fee = _fee;
          burnFee = _burnFee;
        }
	function initialize(address _governance, address _strategist) public initializer {
	        fee = uint256(25e14);
                burnFee = uint256(4e15);
		governanceFee = uint256(5e17);
		governance = _governance;
		strategist = _strategist;
		IERC20(renbtc).safeApprove(btcGateway, ~uint256(0) >> 2);
		IERC20(renbtc).safeApprove(renCrv, ~uint256(0) >> 2);
		IERC20(wbtc).safeApprove(renCrv, ~uint256(0) >> 2);
		IERC20(wbtc).safeApprove(tricrypto, ~uint256(0) >> 2);
		IERC20(renCrvLp).safeApprove(bCrvRen, ~uint256(0) >> 2);
		IERC20(bCrvRen).safeApprove(settPeak, ~uint256(0) >> 2);
		IERC20(renbtc).safeApprove(router, ~uint256(0) >> 2);
		IERC20(usdc).safeApprove(router, ~uint256(0) >> 2);
		PERMIT_DOMAIN_SEPARATOR_WBTC = keccak256(
			abi.encode(
				keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
				keccak256('WBTC'),
				keccak256('1'),
				getChainId(),
				wbtc
			)
		);
		PERMIT_DOMAIN_SEPARATOR_IBBTC = keccak256(
			abi.encode(
				keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
				keccak256('ibBTC'),
				keccak256('1'),
				getChainId(),
				ibbtc
			)
		);
	}

	function applyRatio(uint256 v, uint256 n) internal pure returns (uint256 result) {
		result = v.mul(n).div(uint256(1 ether));
	}

	function toWBTC(uint256 amount) internal returns (uint256 amountOut) {
		uint256 amountStart = IERC20(wbtc).balanceOf(address(this));
		(bool success, ) = renCrv.call(
			abi.encodeWithSelector(IRenCrv.exchange.selector, 0, 1, amount)
		);
		amountOut = IERC20(wbtc).balanceOf(address(this)).sub(amountStart);
	}
        function toIBBTC(uint256 amountIn) internal returns (uint256 amountOut) {
            uint[2] memory amounts;
            amounts[0] = amountIn;
            (bool success,) = renCrv.call(abi.encodeWithSelector(ICurveFi.add_liquidity.selector, amounts, 0));
            require(success, "!curve");
            ISett(bCrvRen).deposit(IERC20(renCrvLp).balanceOf(address(this)));
            amountOut = IBadgerSettPeak(settPeak).mint(0, IERC20(bCrvRen).balanceOf(address(this)), new bytes32[](0));
        }
        function toUSDC(uint256 amountIn, address out) internal returns (uint256 amountOut) {
          address[] memory path = new address[](3);
          path[0] = renbtc;
	  path[1] = weth;
          path[2] = usdc;
          uint256[] memory amountsOut = IUniswapV2Router02(router).swapExactTokensForTokens(amountIn, 1, path, out, block.timestamp + 1);
          amountOut = amountsOut[2];
        }
        function quote() internal {
          (uint256 amountWeth, uint256 amountRenBTC) = UniswapV2Library.getReserves(factory, weth, renbtc);
          renbtcForOneETHPrice = UniswapV2Library.quote(uint256(1 ether), amountWeth, amountRenBTC);
        }
        function renBTCtoETH(uint256 amountIn, address out) internal returns (uint256 amountOut) {
          address[] memory path = new address[](2);
          path[0] = renbtc;
          path[1] = weth;
          uint256[] memory amountsOut = IUniswapV2Router02(router).swapExactTokensForETH(amountIn, 1, path, out, block.timestamp + 1);
          amountOut = amountsOut[1];
        }
        function fromIBBTC(uint256 amountIn) internal returns (uint256 amountOut) {
          uint256 amountStart = IERC20(renbtc).balanceOf(address(this));
          IBadgerSettPeak(settPeak).redeem(0, amountIn);
          ISett(bCrvRen).withdraw(IERC20(bCrvRen).balanceOf(address(this)));
          (bool success,) = renCrv.call(abi.encodeWithSelector(ICurveFi.remove_liquidity_one_coin.selector, IERC20(renCrvLp).balanceOf(address(this)), 0, 0));
          require(success, "!curve");
          amountOut = IERC20(renbtc).balanceOf(address(this)).sub(amountStart);
        }
        function fromUSDC(uint256 amountIn) internal returns (uint256 amountOut) {
          address[] memory path = new address[](2);
          path[0] = usdc;
          path[1] = renbtc;
          uint256[] memory amountsOut = IUniswapV2Router02(router).swapExactTokensForTokens(amountIn, 1, path, address(this), block.timestamp + 1);
          amountOut = amountsOut[1];
        }
	function toRenBTC(uint256 amountIn) internal returns (uint256 amountOut) {
		uint256 balanceStart = IERC20(renbtc).balanceOf(address(this));
		(bool success, ) = renCrv.call(abi.encodeWithSelector(IRenCrv.exchange.selector, 1, 0, amountIn));
		amountOut = IERC20(renbtc).balanceOf(address(this)).sub(balanceStart);
	}

	function toETH() internal returns (uint256 amountOut) {
		uint256 wbtcStart = IERC20(wbtc).balanceOf(address(this));
		uint256 amountStart = address(this).balance;
		(bool success, ) = tricrypto.call(
			abi.encodeWithSelector(ICurveETHUInt256.exchange.selector, 1, 2, wbtcStart, 0, true)
		);
		amountOut = address(this).balance.sub(amountStart);
	}

	receive() payable external { 
		// no-op 
	}
	function earn() public {
                quote();
                toWBTC(IERC20(renbtc).balanceOf(address(this)));
		toETH();
		uint256 balance = address(this).balance;
		if (balance > ETH_RESERVE) {
			uint256 output = balance - ETH_RESERVE;
			uint256 toGovernance = applyRatio(output, governanceFee);
                        address payable governancePayable = address(uint160(governance));
			governancePayable.transfer(toGovernance);
                        address payable strategistPayable = address(uint160(strategist));
			strategistPayable.transfer(output.sub(toGovernance));
		}
	}

	function computeRenBTCGasFee(uint256 gasCost, uint256 gasPrice) internal view returns (uint256 result) {
          result = gasCost.mul(tx.gasprice).mul(renbtcForOneETHPrice).div(uint256(1 ether));
        }
	function deductMintFee(uint256 amountIn, uint256 multiplier) internal view returns (uint256 amount) {
		amount = amountIn.sub(applyFee(amountIn, fee, multiplier));
	}
	function deductBurnFee(uint256 amountIn, uint256 multiplier) internal view returns (uint256 amount) {
		amount = amountIn.sub(applyFee(amountIn, burnFee, multiplier));
	}
	function applyFee(uint256 amountIn, uint256 _fee, uint256 multiplier) internal view returns (uint256 amount) {
		amount = computeRenBTCGasFee(GAS_COST, tx.gasprice).add(applyRatio(amountIn, _fee));
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
	) public returns (uint256 amountOut) {
                require(module == wbtc || module == usdc || module == ibbtc || module == renbtc || module == address(0x0), "!approved-module");
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
                
                amountOut = module == wbtc ? toWBTC(deductMintFee(_mintAmount, 1)) : module == address(0x0) ? renBTCtoETH(deductMintFee(_mintAmount, 1), to) : module == usdc ? toUSDC(deductMintFee(_mintAmount, 1), to) : module == ibbtc ? toIBBTC(deductMintFee(_mintAmount, 3)) : deductMintFee(_mintAmount, 1);
		tx.origin.transfer(Math.min(_gasBefore.sub(gasleft()).add(10e3).mul(tx.gasprice), address(this).balance));
		if (module != usdc && module != address(0x0)) IERC20(module).safeTransfer(to, amountOut);
	}

	function computeBurnNonce(
		address asset,
		uint256 amount,
		uint256 deadline,
		uint256 nonce,
		bytes memory destination
	) internal view returns (uint256 result) {
		result = uint256(keccak256(abi.encodePacked(asset, amount, deadline, nonce, destination)));
/*
		while (result < block.timestamp) {
			// negligible probability of this
			result = uint256(keccak256(abi.encodePacked(result)));
		}
*/
	}

	function computeERC20PermitDigest(
                bytes32 domainSeparator,
		address holder,
		address spender,
		uint256 nonce,
		uint256 expiry,
		bool allowed
	) internal view returns (bytes32 result) {
		result = keccak256(
			abi.encodePacked(
				'\x19\x01',
				domainSeparator,
				keccak256(abi.encode(PERMIT_TYPEHASH, holder, spender, nonce, expiry, allowed))
			)
		);
	}

	function burn(
		address to,
		address asset,
		uint256 amount,
		uint256 deadline,
		bytes memory destination,
		bytes memory signature
	) public returns (uint256 amountToBurn) {
		require(block.timestamp < deadline, '!deadline');
		if (asset == wbtc) {
			uint256 nonce = nonces[to];
			nonces[to]++;
			require(
				to ==
					ECDSA.recover(
						computeERC20PermitDigest(
							PERMIT_DOMAIN_SEPARATOR_WBTC,
							to,
							address(this),
							nonce,
							computeBurnNonce(asset, amount, deadline, nonce, destination),
							true
						),
						signature
					),
				'!signature'
			); //  wbtc does not implement ERC20Permit
			{
				IERC20(asset).transferFrom(to, address(this), amount);
	                        amountToBurn = toRenBTC(deductBurnFee(amount, 1));
			}
		} else if (asset == ibbtc) {
			uint256 nonce = nonces[to];
			nonces[to]++;
			require(
				to ==
					ECDSA.recover(
						computeERC20PermitDigest(
							PERMIT_DOMAIN_SEPARATOR_IBBTC,
							to,
							address(this),
							nonce,
							computeBurnNonce(asset, amount, deadline, nonce, destination),
							true
						),
						signature
					),
				'!signature'
			); //  wbtc ibbtc do not implement ERC20Permit
			{
				IERC20(asset).transferFrom(to, address(this), amount);
				amountToBurn = deductBurnFee(fromIBBTC(amount), 3);
			}
		} else if (asset == renbtc) {
			uint256 nonce;
			uint256 burnNonce;
			{
				nonce = IERC2612Permit(asset).nonces(to);
				burnNonce = computeBurnNonce(asset, amount, deadline, nonce, destination);
			}
			{
                        	(uint8 v, bytes32 r, bytes32 s) = SplitSignatureLib.splitSignature(signature);
	 			IERC2612Permit(asset).permit(to, address(this), nonce, burnNonce, true, v, r, s);
			}
			{
				IERC20(asset).transferFrom(to, address(this), amount);
			}
			amountToBurn = deductBurnFee(amount, 1);
		} else if (asset == usdc) {
			uint256 nonce;
			uint256 burnNonce;
			{
				nonce = IERC2612Permit(asset).nonces(to);
				burnNonce = computeBurnNonce(asset, amount, deadline, nonce, destination);
			}
			{
                        	(uint8 v, bytes32 r, bytes32 s) = SplitSignatureLib.splitSignature(signature);
	 			IERC2612Permit(asset).permit(to, address(this), amount, burnNonce, v, r, s);
			}
			{
				IERC20(asset).transferFrom(to, address(this), amount);
			}
			amountToBurn = deductBurnFee(fromUSDC(amount), 1);
		} else revert("!supported-asset");
	        IGateway(btcGateway).burn(destination, amountToBurn);
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
