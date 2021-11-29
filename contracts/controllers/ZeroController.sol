// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;

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
import {LockForImplLib} from '../libraries/LockForImplLib.sol';
import '../interfaces/IConverter.sol';
import '@openzeppelin/contracts/math/Math.sol';

/**
@title upgradeable contract which determines the authority of a given address to sign off on loans
@author raymondpulver
*/
contract ZeroController is ControllerUpgradeable, OwnableUpgradeable, EIP712Upgradeable {
	using SafeMath for uint256;
	using SafeERC20 for *;

	uint256 internal maxGasPrice = 100e9;
	uint256 internal maxGasRepay = 250000;
	uint256 internal maxGasLoan = 500000;
	string internal constant UNDERWRITER_LOCK_IMPLEMENTATION_ID = 'zero.underwriter.lock-implementation';
	address internal underwriterLockImpl;
	mapping(bytes32 => ZeroLib.LoanStatus) public loanStatus;
	bytes32 internal constant ZERO_DOMAIN_SALT = 0xb225c57bf2111d6955b97ef0f55525b5a400dc909a5506e34b102e193dd53406;
	bytes32 internal constant ZERO_DOMAIN_NAME_HASH = keccak256('ZeroController.RenVMBorrowMessage');
	bytes32 internal constant ZERO_DOMAIN_VERSION_HASH = keccak256('v2');
	bytes32 internal constant ZERO_RENVM_BORROW_MESSAGE_TYPE_HASH =
		keccak256('RenVMBorrowMessage(address module,uint256 amount,address underwriter,uint256 pNonce,bytes pData)');
	bytes32 internal constant TYPE_HASH = keccak256('TransferRequest(address asset,uint256 amount)');
	bytes32 internal ZERO_DOMAIN_SEPARATOR;
  mapping (uint256 => address) public ownerOf;

  uint256 public fee;
  address public gatewayRegistry;
  mapping (address => uint256) public baseFeeByAsset;
  mapping (address => bool) public approvedModules;
	function getChainId() internal view returns (uint8 response) {
		assembly {
			response := chainid()
		}
	}

  function setFee(uint256 _fee) public {
    require(msg.sender == governance, "!governance");
    fee = _fee;
  }
  function approveModule(address module, bool isApproved) public {
    require(msg.sender == governance, "!governance");
    approvedModules[module] = isApproved;
  }
  function setBaseFeeByAsset(address _asset, uint256 _fee) public {
    require(msg.sender == governance, "!governance");
    baseFeeByAsset[_asset] = _fee;
  }
  function deductFee(uint256 _amount, address _asset) internal view returns (uint256 result) {
    result = _amount.mul(uint256(1 ether).sub(fee)).div(uint256(1 ether)).sub(baseFeeByAsset[_asset]);
  }

	function initialize(address _rewards, address _gatewayRegistry) public {
		__Ownable_init_unchained();
		__Controller_init_unchained(_rewards);
		__EIP712_init_unchained('ZeroController', '1');
		gatewayRegistry = _gatewayRegistry;
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
			ownerOf[uint256(uint160(address(lockFor(msg.sender))))] != address(0x0),
			'must be called by underwriter'
		);
		_;
	}

	function balanceOf(address _owner)
		public
		view
		override
		returns (uint256 result)
	{
		result = _balanceOf(_owner);
	}

	function lockFor(address underwriter) public view returns (ZeroUnderwriterLock result) {
		result = LockForImplLib.lockFor(address(this), underwriterLockImpl, underwriter);
	}

	function mint(address underwriter, address vault) public {
		address lock = FactoryLib.deploy(underwriterLockImpl, bytes32(uint256(uint160(underwriter))));
		ZeroUnderwriterLock(lock).initialize(vault);
		ownerOf[uint256(uint160(lock))] = msg.sender;
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
			keccak256(abi.encode(params.to, params.nonce, params.module, params.data)),
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
		uint256 _mintAmount = IGateway(IGatewayRegistry(gatewayRegistry).getGatewayByToken(asset)).mint(
			keccak256(abi.encode(params.to, params.nonce, params.module, params.data)),

			actualAmount,
			nHash,
			signature
		);
		IZeroModule(module).repayLoan(params.to, asset, _mintAmount, nonce, data);
		depositAll(asset);
		uint256 _gasRefund = Math.min(_gasBefore.sub(gasleft()), maxGasLoan).mul(Math.min(tx.gasprice, maxGasPrice));
		IStrategy(strategies[params.asset]).permissionedEther(tx.origin, _gasRefund);
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
    require(approvedModules[module], "!approved");
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
		uint256 _txGas = maxGasPrice.mul(maxGasRepay.add(maxGasLoan));
		address converter = converters[IStrategy(strategies[params.asset]).nativeWrapper()][
			IStrategy(strategies[params.asset]).vaultWant()
		];
		_txGas = IConverter(converter).estimate(_txGas); //convert txGas from ETH to wBTC
		_txGas = IConverter(converters[IStrategy(strategies[params.asset]).vaultWant()][params.asset]).estimate(_txGas);
		// ^convert txGas from wBTC to renBTC
		uint256 _amountSent = IStrategy(strategies[params.asset]).permissionedSend(module, deductFee(params.amount, params.asset).sub(_txGas));
		IZeroModule(module).receiveLoan(params.to, params.asset, _amountSent, params.nonce, params.data);
		uint256 _gasRefund = Math.min(_gasBefore.sub(gasleft()), maxGasLoan).mul(Math.min(tx.gasprice, maxGasPrice));
		IStrategy(strategies[params.asset]).permissionedEther(tx.origin, _gasRefund);
	}
}
