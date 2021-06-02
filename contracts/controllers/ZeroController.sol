// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;

import {
    ERC721Upgradeable
} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ZeroUnderwriterLock} from "../underwriter/ZeroUnderwriterLock.sol";
import {ZeroLib} from "../libraries/ZeroLib.sol";
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ControllerUpgradeable} from "./ControllerUpgradeable.sol";
import {EIP712} from "@openzeppelin/contracts/drafts/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/cryptography/ECDSA.sol";

/**
@title upgradeable contract which determines the authority of a given address to sign off on loans
@author raymondpulver
*/
contract ZeroController is
    ControllerUpgradeable,
    OwnableUpgradeable,
    ERC721Upgradeable
{
    string internal constant UNDERWRITER_LOCK_IMPLEMENTATION_ID =
        "zero.underwriter.lock-implementation";
    address internal underwriterLockImpl;
    mapping(address => uint256) public loaned;
    mapping(address => uint256) public repaid;
    mapping(address => bool) public moduleApproved;
    bytes32 private constant ZERO_DOMAIN_SALT =
        0xb225c57bf2111d6955b97ef0f55525b5a400dc909a5506e34b102e193dd53406;
    bytes32 private constant ZERO_DOMAIN_NAME_HASH =
        keccak256("ZeroController.RenVMBorrowMessage");
    bytes32 private constant ZERO_DOMAIN_VERSION_HASH = keccak256("v2");
    bytes32 private constant ZERO_RENVM_BORROW_MESSAGE_TYPE_HASH =
        keccak256(
            "RenVMBorrowMessage(address module,uint256 amount,address underwriter,uint256 pNonce,bytes pData)"
        );
    bytes32 private ZERO_DOMAIN_SEPARATOR;

    function getChainId() internal view returns (uint8 response) {
        assembly {
            response := chainId()
        }
    }

    function initialize(address _rewards) public {
        __Ownable_init_unchained();
        __Controller_init_unchained(_rewards);
        __ERC721_init_unchained("ZeroController", "ZWRITE");
        underwriterLockImpl = ZeroFactoryLib.deployImplementation(
            type(ZeroUnderwriterLock).creationCode,
            "zero.underwriter.lock-implementation"
        );
        ZERO_DOMAIN_SEPARATOR = EIP712.buildDomainSeparator(
            ZERO_DOMAIN_NAME_HASH,
            ZERO_DOMAIN_VERSION_HASH,
            getChainId(),
            address(this),
            ZERO_DOMAIN_SALT
        );
    }

    modifier onlyUnderwriter {
        require(
            ownerOf(lockFor(msg.sender)) != address(0x0),
            "must be called by underwriter"
        );
        _;
    }

    function lockFor(address underwriter)
        public
        view
        returns (ZeroUnderwriterLock result)
    {
        result = ZeroLib.lockFor(address(this), underwriter);
    }

    function mint(address underwriter, yVault vault) public {
        address lock =
            ZeroFactoryLib.deploy(
                underwriterLockImpl,
                keccak256(abi.encodePacked(underwriter))
            );
        ZeroUnderwriterLock(lock).initialize(vault);
        _mint(msg.sender, uint256(uint160(lock)));
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
        ZeroLib.LoanParams memory params =
            ZeroLib.LoanParams({
                to: to,
                asset: asset,
                amount: amount,
                nonce: nonce,
                module: module,
                data: data
            });
        bytes32 digest = toTypedDataHash(params, underwriter);
        require(
            loanStatus[digest].status == ZeroLib.LoanStatusCode.UNPAID,
            "loan is not in the UNPAID state"
        );
        IZeroUnderwriterLock(ZeroLib.lockFor(msg.sender)).trackIn(actualAmount);
        IModule(module).repay(params.to, asset, actualAmount, nonce, data);
        //uint256 amount =
        IGateway(getGateway(asset)).mint(
            keccak256(abi.encode(nonce, data)),
            actualAmount,
            nHash,
            signature
        );
        depositAll(asset);
    }

    function toTypedDataHash(LoanParams memory params, address underwriter)
        internal
        pure
        returns (bytes32 result)
    {
        result = ECDSA.toTypedDataHash(
            ZERO_DOMAIN_SEPARATOR,
            keccak256(
                abi.encode(
                    ZERO_RENVM_BORROW_MESSAGE_TYPE_HASH,
                    params.asset,
                    params.amount,
                    underwtiter,
                    params.nonce,
                    params.module,
                    params.data
                )
            )
        );
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
        ZeroLib.LoanParams memory params =
            ZeroLib.LoanParams({
                to: to,
                asset: asset,
                amount: amount,
                nonce: nonce,
                module: module,
                data: data
            });
        require(
            ECDSA.recover(toTypedDataHash(params, msg.sender), userSignature) ==
                params.to,
            "invalid signature"
        );
        bytes32 digest = keccak256(abi.encodePacked(params.to, params.nonce));
        require(
            loanStatus[digest].status == ZeroLib.LoanStatusCode.UNINITIALIZED,
            "already spent this loan"
        );
        loanStatus[digest] = ZeroLib.LoanStatus({
            underwriter: msg.sender,
            status: ZeroLib.LoanStatusCode.UNPAID
        });
        uint256 actual = 0; // TODO: implement best way to get vault underlying asset out and in the module, subtract all fees, remainder is in actual

        IZeroUnderwriterLock(ZeroLib.lockFor(msg.sender)).trackOut(
            params.module,
            actual
        );

        IStrategy(strategies[params.asset]).permissionedSend(module, actual);

        IModule(module).receiveLoan(
            params.to,
            params.asset,
            actual,
            params.nonce,
            params.data
        );
    }
}
