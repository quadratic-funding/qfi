//SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';

import {GrantRound} from './GrantRound.sol';

/**
 * @title Funds Manager
 * @author Q
 * @notice Handles funding sources and donations for Grant rounds
 * @dev Responsible for sending matching funds to the Grant round contract
 */
contract FundsManager is Ownable {
    /**
     * Event issued when a funding source is correctly added to the set.
     * @param _source The address of the funding source.
     */
    event FundingSourceAdded(address _source);

    /**
     * Event issued when a funding source is correctly removed from the set.
     * @param _source The address of the funding source.
     */
    event FundingSourceRemoved(address _source);

    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeERC20 for ERC20;

    EnumerableSet.AddressSet private fundingSources;

    constructor() {}

    /**
     * @dev Add matching funds source.
     * @param _source Address of a funding source.
     */
    function addFundingSource(address _source) external {
        bool result = fundingSources.add(_source);
        require(result, 'Factory: Funding source already added');

        emit FundingSourceAdded(_source);
    }

    /**
     * @dev Remove matching funds source.
     * @param _source Address of the funding source.
     */
    function removeFundingSource(address _source) external {
        bool result = fundingSources.remove(_source);
        require(result, 'Factory: Funding source not found');

        emit FundingSourceRemoved(_source);
    }

    /**
     * @dev Get total amount of matching funds.
     */
    function getMatchingFunds(ERC20 token) external view returns (uint256) {
        uint256 matchingPoolSize = token.balanceOf(address(this));
        for (uint256 index = 0; index < fundingSources.length(); index++) {
            address fundingSource = fundingSources.at(index);
            uint256 allowance = token.allowance(fundingSource, address(this));
            uint256 balance = token.balanceOf(fundingSource);
            uint256 contribution = allowance < balance ? allowance : balance;
            matchingPoolSize += contribution;
        }
        return matchingPoolSize;
    }

    /*
     * @dev Transfer funds from matching pool to current funding round and finalize it.
     * @param _totalSpent Total amount of spent voice credits.
     * @param _totalSpentSalt The salt.
     */
    function transferMatchingFunds(
        // uint256 _totalSpent,
        // uint256 _totalSpentSalt,
        GrantRound currentRound
    ) internal {
        require(
            address(currentRound) != address(0),
            'Factory: Funding round has not been deployed'
        );
        ERC20 roundToken = currentRound.nativeToken();
        // Factory contract is the default funding source
        uint256 matchingPoolSize = roundToken.balanceOf(address(this));
        if (matchingPoolSize > 0) {
            roundToken.safeTransfer(address(currentRound), matchingPoolSize);
        }
        // Pull funds from other funding sources
        for (uint256 index = 0; index < fundingSources.length(); index++) {
            address fundingSource = fundingSources.at(index);
            uint256 allowance = roundToken.allowance(
                fundingSource,
                address(this)
            );
            uint256 balance = roundToken.balanceOf(fundingSource);
            uint256 contribution = allowance < balance ? allowance : balance;
            if (contribution > 0) {
                roundToken.safeTransferFrom(
                    fundingSource,
                    address(currentRound),
                    contribution
                );
            }
        }
    }
}
