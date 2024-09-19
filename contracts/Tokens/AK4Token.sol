// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract AK4Token is ERC20 {

    address public owner;

    constructor() ERC20("AK4Token", "AT") {
        owner = msg.sender;
         _mint(msg.sender, 10000e18);

    }

    function mint(address to, uint256 amount) internal {
        _mint(to, amount);
    }

}