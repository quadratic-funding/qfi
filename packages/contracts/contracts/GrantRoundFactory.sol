//SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.8.1;

import {PollFactory, Poll, MessageAqFactory, PollDeploymentParams} from "qaci-contracts/contracts/Poll.sol";
import {VkRegistry} from "qaci-contracts/contracts/VkRegistry.sol";
import {Params} from "qaci-contracts/contracts/Params.sol";
import {Hasher, PoseidonT3, PoseidonT4, PoseidonT5, PoseidonT6} from "qaci-contracts/contracts/crypto/Hasher.sol";
import {IMACI} from "qaci-contracts/contracts/IMACI.sol";
import {AccQueue} from "qaci-contracts/contracts/trees/AccQueue.sol";
import {DomainObjs, IPubKey, IMessage} from "qaci-contracts/contracts/DomainObjs.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {GrantRound} from "./GrantRound.sol";
import {IRecipientRegistry} from "./recipientRegistry/IRecipientRegistry.sol";

/**
 * @title Quadratic Funding Round Factory Contracts
 * @author Q
 * @notice Deploys new Quadratic Funding Round Contracts
 * @dev Factory Contract to deploy a special type of Poll called GrantRound.
 */
contract GrantRoundFactory is
    Params,
    IPubKey,
    IMessage,
    Ownable,
    Hasher,
    PollDeploymentParams
{
    /**
     * Event issued when the owner sets/changes the address of the MessageAqFactory smart contract.
     * @param _messageAqFactory The Ethereum address of the new MessageAqFactory smart contract.
     */
    event MessageAqFactoryChanged(address _messageAqFactory);

    /**
     * Event issued when the owner sets/changes the address of the RecipientRegistry smart contract.
     * @param _recipientRegistry The Ethereum address of the new RecipientRegistry smart contract.
     */
    event RecipientRegistryChanged(address _recipientRegistry);

    using SafeERC20 for ERC20;

    MessageAqFactory public messageAqFactory;
    IRecipientRegistry public recipientRegistry;

    constructor() {}

    /**
     * @notice Sets the MessageAqFactory to use for the grant rounds
     * @dev public function, _messageAqFactory should deploy new AccQueueQuinaryMaci AccQueue(s), need to set before calling deployGrantRound
     * @param _messageAqFactory MessageAqFactory stored in memory
     */
    function setMessageAqFactory(MessageAqFactory _messageAqFactory)
        public
        onlyOwner
    {
        messageAqFactory = _messageAqFactory;

        emit MessageAqFactoryChanged(address(_messageAqFactory));
    }

    /**
     * @notice Sets the recipientRegistry to use for the grant rounds
     * @dev public function,
     * @param _recipientRegistry IRecipientRegistry stored in memory
     */
    function setRecipientRegistry(IRecipientRegistry _recipientRegistry)
        public
        onlyOwner
    {
        recipientRegistry = _recipientRegistry;

        emit RecipientRegistryChanged(address(_recipientRegistry));
    }

    /**
     * @notice Deploys a new GrantRound Contract
     * @dev public function
     * @param _voiceCreditFactor uint256 The factor by which the voiceCredit is multiplied to determine the amount of voice credits that are distributed to the contributor.
     * @param _coordinator The address of the coordinator of the GrantRound.
     * @param _nativeToken The address of the ERC20 token used for the GrantRound.
     * @param _duration uint256  stored in memory, the duration of the GrantRound
     * @param _maxValues MaxValues stored in memory, the maxMessages and maxVoteOptions of the GrantRound as uint256 values
     * @param _treeDepths TreeDepths stored in memory, intStateTreeDepth, messageTreeSubDepth, messageTreeDepth, and voteOptionTreeDepth as uint8 values
     * @param _batchSizes BatchSizes stored in memory, messageBatchSize and tallyBatchSize as uint8 values
     * @param _coordinatorPubKey PubKey stored in memory, MACI pubkey of the coordinator of the GrantRound
     * @param _maci VkRegistry
     * @param _grantRoundOwner address stored in memory
     */
    /*
     * Deploy a new Poll contract and AccQueue contract for messages.
     */
    function deployGrantRound(
        uint256 _voiceCreditFactor,
        address _coordinator,
        ERC20 _nativeToken,
        uint256 _duration,
        MaxValues memory _maxValues,
        TreeDepths memory _treeDepths,
        BatchSizes memory _batchSizes,
        PubKey memory _coordinatorPubKey,
        VkRegistry _vkRegistry,
        IMACI _maci,
        address _grantRoundOwner
    ) public onlyOwner returns (GrantRound) {
        uint256 treeArity = 5;

        // Validate _maxValues
        // NOTE: these checks may not be necessary. Removing them will save
        // 0.28 Kb of bytecode.

        // maxVoteOptions must be less than 2 ** 50 due to circuit limitations;
        // it will be packed as a 50-bit value along with other values as one
        // of the inputs (aka packedVal)

        require(
            _maxValues.maxMessages <=
                treeArity**uint256(_treeDepths.messageTreeDepth) &&
                _maxValues.maxMessages >= _batchSizes.messageBatchSize &&
                _maxValues.maxMessages % _batchSizes.messageBatchSize == 0 &&
                _maxValues.maxVoteOptions <=
                treeArity**uint256(_treeDepths.voteOptionTreeDepth) &&
                _maxValues.maxVoteOptions < (2**50),
            "PollFactory: invalid _maxValues"
        );

        AccQueue messageAq = messageAqFactory.deploy(
            _treeDepths.messageTreeSubDepth
        );

        ExtContracts memory extContracts;

        // TODO: remove _vkRegistry; only PollProcessorAndTallyer needs it
        extContracts.vkRegistry = _vkRegistry;
        extContracts.maci = _maci;
        extContracts.messageAq = messageAq;

        GrantRound grantRound = new GrantRound(
            _voiceCreditFactor,
            _coordinator,
            _nativeToken,
            _duration,
            _maxValues,
            _treeDepths,
            _batchSizes,
            _coordinatorPubKey,
            extContracts,
            recipientRegistry
        );

        // Make the Poll contract own the messageAq contract, so only it can
        // run enqueue/merge
        messageAq.transferOwnership(address(grantRound));

        // TODO: should this be _maci.owner() instead?
        grantRound.transferOwnership(_grantRoundOwner);

        return grantRound;
    }
}
