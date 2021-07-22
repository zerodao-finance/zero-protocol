// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;

import {ERC721Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import {EIP712Upgradeable} from '@openzeppelin/contracts-upgradeable/drafts/EIP712Upgradeable.sol';
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

import 'hardhat/console.sol';

/**
@title upgradeable contract which determines the authority of a given address to sign off on loans
@author raymondpulver
*/
contract ZeroController is ControllerUpgradeable, OwnableUpgradeable, ERC721Upgradeable, EIP712Upgradeable {
	using SafeMath for uint256;

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
	}

	modifier onlyUnderwriter {
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

	function repay(
		address underwriter,
		address to,
		address asset,
		uint256 amount,
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
		require(loanStatus[digest].status == ZeroLib.LoanStatusCode.UNPAID, 'loan is not in the UNPAID state');
		uint256 actualAmount = IGateway(IGatewayRegistry(gatewayRegistry).getGatewayByToken(asset)).mint(
			keccak256(abi.encode(nonce, data)),
			amount,
			nHash,
			signature
		);
		ZeroUnderwriterLock(lockFor(msg.sender)).trackIn(actualAmount);
		IZeroModule(module).repayLoan(params.to, asset, actualAmount, nonce, data);
		//uint256 amount =

		depositAll(asset);
	}

	function depositAll(address _asset) internal {
		// deposit all of the asset in the vault
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
		uint256 actual = params.amount.sub(params.amount.mul(uint256(25e15).div(1e18)));

		ZeroUnderwriterLock(lockFor(msg.sender)).trackOut(params.module, actual);

		uint256 _amountSent = IStrategy(strategies[params.asset]).permissionedSend(module, params.amount);
		console.log('Amount sent is', _amountSent);

		IZeroModule(module).receiveLoan(params.to, params.asset, _amountSent, params.nonce, params.data);

		console.log('Received Loan');
	}
}
