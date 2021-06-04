pragma solidity >=0.5.0;

import {IZeroModule} from "../interfaces/IZeroModule.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/Initializable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {ZeroController} from "../controllers/ZeroController.sol";
import {yVault} from "../vendor/yearn/vaults/yVault.sol";
import {ZeroLib} from "../libraries/ZeroLib.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

/**
@title contract to hold locked underwriter funds while the underwriter is active
@author raymondpulver
*/
contract ZeroUnderwriterLock is Ownable, Initializable {
    using SafeMath for *;
    using SafeERC20 for *;
    ZeroController public controller;
    yVault public vault;
    ZeroLib.BalanceSheet internal _balanceSheet;

    function balanceSheet()
        public
        view
        returns (
            uint256 loaned,
            uint256 required,
            uint256 repaid
        )
    {
        (loaned, required, repaid) = (
            uint256(_balanceSheet.loaned),
            uint256(_balanceSheet.required),
            _balanceSheet.repaid
        );
    }

    function owed() public view returns (uint256 result) {
        result = _balanceSheet.repaid.sub(uint256(_balanceSheet.loaned));
    }

    function reserve() public view returns (uint256 result) {
        result = vault
            .balanceOf(address(this))
            .mul(vault.getPricePerFullShare())
            .div(uint256(1 ether));
    }

    function owner() public view override returns (address result) {
        result = IERC721(address(controller)).ownerOf(uint256(uint160(address(this))));
    }

    /**
  @notice sets the owner to the ZeroUnderwriterNFT
  @param _vault the address of the LP token which will be either burned or redeemed when the NFT is destroyed
  */
    function initialize(yVault _vault) public initializer {
        controller = ZeroController(msg.sender);
        vault = _vault;
    }

    /**
  @notice send back non vault tokens if they are stuck
  @param _token the token to send the entire balance of to the sender
  */
    function skim(address _token) public {
        require(address(vault) != _token, "cannot skim vault token");
        IERC20(_token).safeTransfer(
            msg.sender,
            IERC20(_token).balanceOf(address(this))
        );
    }

    /**
  @notice destroy this contract and send all vault tokens to NFT contract
  */
    function burn(address receiver) public onlyOwner {
        require(
            vault.transfer(receiver, vault.balanceOf(address(this))),
            "failed to transfer vault token to receiver"
        );
        selfdestruct(msg.sender);
    }

    function trackOut(address module, uint256 amount) public {
        require(msg.sender == address(controller), "!controller");
        uint256 loanedAfter = uint256(_balanceSheet.loaned).add(amount);
        uint256 _owed = owed();
        (_balanceSheet.loaned, _balanceSheet.required) = (
            uint128(loanedAfter),
            uint128(
                uint256(_balanceSheet.required)
                    .mul(_owed)
                    .div(uint256(1 ether))
                    .add(
                    IZeroModule(module)
                        .computeReserveRequirement(amount)
                        .mul(uint256(1 ether))
                        .div(_owed.add(amount))
                )
            )
        );
    }

    function trackIn(uint256 amount) public {
        require(msg.sender == address(controller), "!controller");
        uint256 _owed = owed();
        _balanceSheet.required = uint128(
            uint256(_balanceSheet.required)
                .mul(_owed)
                .div(uint256(1 ether))
                .sub(amount)
                .mul(uint256(1 ether))
                .div(_owed.sub(amount))
        );
        _balanceSheet.repaid = _balanceSheet.repaid.add(amount);
    }
}
