// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;

import {ERC721Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import {EIP712Upgradeable} from '@openzeppelin/contracts-upgradeable/drafts/EIP712Upgradeable.sol';
import {IERC20} from 'oz410/token/ERC20/ERC20.sol';
import {SafeERC20} from 'oz410/token/ERC20/SafeERC20.sol';
import {IZeroModule} from '../interfaces/IZeroModule.sol';
import {ZeroUnderwriterLock} from '../underwriter/ZeroUnderwriterLock.sol';
import {ZeroLib} from '../libraries/ZeroLib.sol';
import {OwnableUpgradeable} from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import {ControllerUpgradeable} from './ControllerUpgradeable.sol';
import {EIP712} from 'oz410/drafts/EIP712.sol';
import {ECDSA} from 'oz410/cryptography/ECDSA.sol';
import {FactoryLib} from '../libraries/factory/FactoryLib.sol';
import {ZeroUnderwriterLockBytecodeLib} from '../libraries/bytecode/ZeroUnderwriterLockBytecodeLib.sol';
import {IGateway} from '../interfaces/IGateway.sol';
import {IGatewayRegistry} from '../interfaces/IGatewayRegistry.sol';
import {IStrategy} from '../interfaces/IStrategy.sol';
import {SafeMath} from 'oz410/math/SafeMath.sol';
import '../interfaces/IConverter.sol';
import '@openzeppelin/contracts/math/Math.sol';

import 'hardhat/console.sol';

/**
@title upgradeable contract which determines the authority of a given address to sign off on loans
@author raymondpulver
*/
contract ZeroController is ControllerUpgradeable, OwnableUpgradeable, ERC721Upgradeable, EIP712Upgradeable {
	using SafeMath for uint256;
	using SafeERC20 for *;

	uint256 public maxGasPrice = 100e9;
	uint256 public maxGasRepay = 250000;
	uint256 public maxGasLoan = 500000;
	string internal constant UNDERWRITER_LOCK_IMPLEMENTATION_ID = 'zero.underwriter.lock-implementation';
	address internal underwriterLockImpl;
	mapping(address => uint256) public loaned;
	mapping(address => uint256) public repaid;
	mapping(address => bool) public moduleApproved;
	mapping(bytes32 => ZeroLib.LoanStatus) public loanStatus;
	bytes32 private constant ZERO_DOMAIN_SALT = 0xb225c57bf2111d6955b97ef0f55525b5a400dc909a5506e34b102e193dd53406;
	bytes32 private constant ZERO_DOMAIN_NAME_HASH = keccak256('ZeroController.RenVMBorrowMessage');
	bytes32 private constant ZERO_DOMAIN_VERSION_HASH = keccak256('v2');
	bytes32 private constant ZERO_RENVM_BORROW_MESSAGE_TYPE_HASH =
		keccak256('RenVMBorrowMessage(address module,uint256 amount,address underwriter,uint256 pNonce,bytes pData)');
	bytes32 private constant TYPE_HASH = keccak256('TransferRequest(address asset,uint256 amount)');
	bytes32 private ZERO_DOMAIN_SEPARATOR;

	function getChainId() internal view returns (uint8 response) {
		assembly {
			response := chainid()
		}
	}

	address public constant gatewayRegistry = 0xe80d347DF1209a76DD9d2319d62912ba98C54DDD;

	function initialize(address _rewards) public {
		__Ownable_init_unchained();
		__Controller_init_unchained(_rewards);
		__ERC721_init_unchained('ZeroController', 'ZWRITE');
		__EIP712_init_unchained('ZeroController', '1');
		underwriterLockImpl = FactoryLib.deployImplementation(
			ZeroUnderwriterLockBytecodeLib.get(),
			'zero.underwriter.lock-implementation'
		);

		maxGasPrice = 100e9;
		maxGasRepay = 250000;
		maxGasLoan = 500000;
	}

	modifier onlyUnderwriter() {
		require(
			ownerOf(uint256(uint160(address(lockFor(msg.sender))))) != address(0x0),
			'must be called by underwriter'
		);
		_;
	}

	function balanceOf(address _owner)
		public
		view
		override(ControllerUpgradeable, ERC721Upgradeable)
		returns (uint256 result)
	{
		result = _balanceOf(_owner);
	}

	function lockFor(address underwriter) public view returns (ZeroUnderwriterLock result) {
		result = ZeroLib.lockFor(address(this), underwriterLockImpl, underwriter);
	}

	function mint(address underwriter, address vault) public {
		address lock = FactoryLib.deploy(underwriterLockImpl, bytes32(uint256(uint160(underwriter))));
		ZeroUnderwriterLock(lock).initialize(vault);
		_mint(msg.sender, uint256(uint160(lock)));
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
		require(loanStatus[digest].status == ZeroLib.LoanStatusCode.UNINITIALIZED, 'loan already exists');
		uint256 _actualAmount = IGateway(IGatewayRegistry(gatewayRegistry).getGatewayByToken(asset)).mint(
			keccak256(abi.encode(nonce, data)),
			actualAmount,
			nHash,
			signature
		);
		delete (loanStatus[digest]);
		IERC20(asset).safeTransfer(to, _actualAmount);
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
		require(loanStatus[digest].status == ZeroLib.LoanStatusCode.UNPAID, 'loan is not in the UNPAID state');

		ZeroUnderwriterLock lock = ZeroUnderwriterLock(lockFor(msg.sender));
		lock.trackIn(actualAmount);
		IZeroModule(module).repayLoan(params.to, asset, actualAmount, nonce, data);
		IGateway(IGatewayRegistry(gatewayRegistry).getGatewayByToken(asset)).mint(
			keccak256(abi.encode(nonce, data)),
			actualAmount,
			nHash,
			signature
		);
		depositAll(asset);
		//uint256 _gasRefund = Math.min(gasleft().sub(_gasBefore), maxGasRepay).mul(Math.min(tx.gasprice, maxGasPrice));
		//IStrategy(strategies[params.asset]).permissionedEther(params.to, _gasRefund);
	}

	function depositAll(address _asset) internal {
		// deposit all of the asset in the vault
		uint256 _balance = IERC20(_asset).balanceOf(address(this));
		IERC20(_asset).safeTransfer(strategies[_asset], _balance);
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

	function loan(
		address to,
		address asset,
		uint256 amount,
		uint256 nonce,
		address module,
		bytes memory data,
		bytes memory userSignature
	) public onlyUnderwriter {
		console.log('loan func');
		uint256 _gasBefore = gasleft();
		ZeroLib.LoanParams memory params = ZeroLib.LoanParams({
			to: to,
			asset: asset,
			amount: amount,
			nonce: nonce,
			module: module,
			data: data
		});
		bytes32 digest = toTypedDataHash(params, msg.sender);
		require(ECDSA.recover(digest, userSignature) == params.to, 'invalid signature');
		require(loanStatus[digest].status == ZeroLib.LoanStatusCode.UNINITIALIZED, 'already spent this loan');
		loanStatus[digest] = ZeroLib.LoanStatus({underwriter: msg.sender, status: ZeroLib.LoanStatusCode.UNPAID});
		uint256 actual = params.amount.sub(params.amount.mul(uint256(25e15)).div(1e18));

		ZeroUnderwriterLock(lockFor(msg.sender)).trackOut(params.module, actual);
		console.log('underwriter lock');
		uint256 _txGas = maxGasPrice.mul(maxGasRepay.add(maxGasLoan));
		address strategy = strategies[params.asset];
		// convert _txGas from wETH to params.asset
		_txGas = IConverter(converters[IStrategy(strategy).nativeWrapper()][params.asset]).estimate(1).mul(_txGas);
		console.log('txGas in renBTC is', _txGas);
		console.log('Doing permissioned send');
		uint256 _amountSent = IStrategy(strategy).permissionedSend(module, params.amount.sub(_txGas));
		console.log('receive loan');
		IZeroModule(module).receiveLoan(params.to, params.asset, _amountSent, params.nonce, params.data);
		//uint256 _gasRefund = Math.min(gasleft().sub(_gasBefore), maxGasLoan).mul(Math.min(tx.gasprice, maxGasPrice));
		//IStrategy(strategies[params.asset]).permissionedEther(tx.origin, _gasRefund);
	}
}
