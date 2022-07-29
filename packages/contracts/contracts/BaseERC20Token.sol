// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.1;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract BaseERC20Token is ERC20 {
  constructor(uint256 initialSupply)
    ERC20('Barcelona Pool Token', 'BRC')
  {
    _mint(msg.sender, initialSupply);
  }
}
