// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AdvancedTokenSwap is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Deposit {
        address depositor;
        address tokenDeposited;
        uint256 amountDeposited;
        address[] allowedPurchaseTokens;
    }

    mapping(uint256 => Deposit) public deposits;
    uint256 public depositCount;

    event TokenDeposited(uint256 depositId, address indexed depositor, address tokenDeposited, uint256 amountDeposited);
    event TokenPurchased(uint256 depositId, address indexed purchaser, address tokenUsedToPurchase, uint256 amountPurchased, uint256 amountReceived);
    event DepositWithdrawn(uint256 depositId, address indexed depositor, uint256 amountWithdrawn);

    error CantPurchaseWithThisToken();
    error InvalidPurchaseAmount();
    error InvalidReceiveAmount();
    error InsufficientDepositedTokens();

    function depositToken(
        address _tokenToDeposit,
        uint256 _amountToDeposit,
        address[] memory _allowedPurchaseTokens
    ) external nonReentrant returns (uint256) {
        require(_allowedPurchaseTokens.length > 0, "No purchase tokens allowed");
        require(_tokenToDeposit != address(0), "Invalid token address");
        require(_amountToDeposit > 0, "Invalid deposit amount");

        IERC20(_tokenToDeposit).safeTransferFrom(msg.sender, address(this), _amountToDeposit);

        depositCount++;
        Deposit storage newDeposit = deposits[depositCount];
        newDeposit.depositor = msg.sender;
        newDeposit.tokenDeposited = _tokenToDeposit;
        newDeposit.amountDeposited = _amountToDeposit;

        for (uint256 i = 0; i < _allowedPurchaseTokens.length; i++) {
            address __purchaseToken = _allowedPurchaseTokens[i];
            require(__purchaseToken != address(0), "Invalid purchase token address");
            require(__purchaseToken != _tokenToDeposit, "Purchase token cannot be the same as deposit token");
            newDeposit.allowedPurchaseTokens.push(__purchaseToken);
        }

        emit TokenDeposited(depositCount, msg.sender, _tokenToDeposit, _amountToDeposit);
        return depositCount;
    }

    function purchaseToken(uint256 _depositId, address _tokenToPurchaseWith, uint256 _amountToPurchase, uint256 _amountToReceive) external nonReentrant {
        Deposit storage deposit = deposits[_depositId];

        if (deposit.depositor == address(0)) revert("Deposit does not exist");
        if (_amountToPurchase == 0) revert InvalidPurchaseAmount();
        if (_amountToReceive == 0) revert InvalidReceiveAmount();
        if (_amountToReceive > deposit.amountDeposited) revert InsufficientDepositedTokens();
        if (_amountToPurchase < _amountToReceive) revert("Can't receive more than given");

        bool isAllowed = false;
        for (uint256 i = 0; i < deposit.allowedPurchaseTokens.length; i++) {
            if (deposit.allowedPurchaseTokens[i] == _tokenToPurchaseWith) {
                isAllowed = true;
                break;
            }
        }
        if (!isAllowed) revert CantPurchaseWithThisToken();

        deposit.amountDeposited -= _amountToReceive;

        IERC20(_tokenToPurchaseWith).safeTransferFrom(msg.sender, deposit.depositor, _amountToPurchase);
        IERC20(deposit.tokenDeposited).safeTransfer(msg.sender, _amountToReceive);

        emit TokenPurchased(_depositId, msg.sender, _tokenToPurchaseWith, _amountToPurchase, _amountToReceive);
    }

    function withdrawDeposit(uint256 _depositId) external nonReentrant {
        Deposit storage deposit = deposits[_depositId];
        require(deposit.depositor == msg.sender, "Not the depositor");
        require(deposit.amountDeposited > 0, "No tokens to withdraw");

        uint256 amountToWithdraw = deposit.amountDeposited;
        deposit.amountDeposited = 0;

        IERC20(deposit.tokenDeposited).safeTransfer(msg.sender, amountToWithdraw);

        emit DepositWithdrawn(_depositId, msg.sender, amountToWithdraw);
    }

    function getDepositDetails(uint256 _depositId) external view returns (
        address depositor,
        address tokenDeposited,
        uint256 amountDeposited,
        address[] memory allowedPurchaseTokens
    ) {
        Deposit storage deposit = deposits[_depositId];
        return (
            deposit.depositor,
            deposit.tokenDeposited,
            deposit.amountDeposited,
            deposit.allowedPurchaseTokens
        );
    }
}