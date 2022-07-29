//SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.8.1;

import {PollFactory, Poll, PollProcessorAndTallyer} from "qaci-contracts/contracts/Poll.sol";
import {VkRegistry} from "qaci-contracts/contracts/VkRegistry.sol";
import {Params} from "qaci-contracts/contracts/Params.sol";
import {IMACI} from "qaci-contracts/contracts/IMACI.sol";
import {AccQueue} from "qaci-contracts/contracts/trees/AccQueue.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IRecipientRegistry} from "./recipientRegistry/IRecipientRegistry.sol";

/**
 * @title Quadratic Funding Round Contract
 * @author Q
 * @notice This contract manages contributions, withdrawals, Voting and the distribution of funds for a particular grant round.
 * @dev Inherits from Poll Contract and uses the Poll Contract interface to manage the voting.
 */
contract GrantRound is Poll {
    /**
     * Event issued when a registered user posts a (batch of) message(s) to vote.
     * @param _voter The address of the person who published a (batch of) message(s).
     */
    event Voted(address indexed _voter);

    /**
     * Event issued when the coordinator publishes the IPFS hash for the vote tally.
     * @param _tallyHash The IPFS hash of the vote tally.
     */
    event TallyPublished(string _tallyHash);

    /**
     * Event issued when the owner (deployer) cancel the Grant Round.
     * @param _isFinalized True when the Grant Round is finalized, otherwise false.
     * @param _isCancelled True when the Grant Round is cancelled, otherwise false.
     */
    event GrantRoundCancelled(bool _isFinalized, bool _isCancelled);

    /**
     * Event issued when the beneficiary (recipient) claims the corresponding Grant Round funds.
     * @param _recipient The address of the recipient.
     * @param _voteOptionIndex The index of the voting option associated with the recipient.
     * @param _allocatedAmount The amount to be claimed.
     */
    event FundsClaimed(
        address _recipient,
        uint256 _voteOptionIndex,
        uint256 _allocatedAmount
    );

    using SafeERC20 for ERC20;

    uint256 public voiceCreditFactor;
    uint256 public alpha;
    address public coordinator;
    ERC20 public nativeToken;
    IRecipientRegistry public recipientRegistry;
    mapping(uint256 => bool) private recipients;

    bool public isCancelled;
    bool public isFinalized;
    string public tallyHash;
    uint256 public totalSpent;
    uint256 public totalVotes;
    uint256 public matchingPoolSize;

    /**
     * @notice Constructor for the GrantRound, special type of poll that implements Quadratic Funding.
     * @dev Binds the contracts that will be used to tally the Poll and sets duration ans coordinator.
     * @param _voiceCreditFactor uint256 The factor by which the voiceCredit is multiplied to determine the amount of voice credits that are distributed to the contributor.
     * @param _coordinator The address of the coordinator of the GrantRound.
     * @param _nativeToken The address of the ERC20 token used for the GrantRound.
     * @param _duration uint256, the duration of the GrantRound
     * @param _maxValues MaxValues stored in memory, the maxMessages and maxVoteOptions of the GrantRound as uint256 values
     * @param _treeDepths TreeDepths stored in memory, intStateTreeDepth, messageTreeSubDepth, messageTreeDepth, and voteOptionTreeDepth as uint8 values
     * @param _batchSizes BatchSizes stored in memory, this inlcudes the message batch size and the tally batch size
     * @param _coordinatorPubKey PubKey stored in memory, MACI pubkey of the coordinator of the GrantRounds
     * @param _extContracts ExtContracts stored in memory, this includes the maci, and messageAq contracts that will be used to tally the Poll.
     */
    constructor(
        uint256 _voiceCreditFactor,
        address _coordinator,
        ERC20 _nativeToken,
        uint256 _duration,
        MaxValues memory _maxValues,
        TreeDepths memory _treeDepths,
        BatchSizes memory _batchSizes,
        PubKey memory _coordinatorPubKey,
        ExtContracts memory _extContracts,
        IRecipientRegistry _recipientRegistry
    )
        Poll(
            _duration,
            _maxValues,
            _treeDepths,
            _batchSizes,
            _coordinatorPubKey,
            _extContracts
        )
    {
        voiceCreditFactor = _voiceCreditFactor;
        coordinator = _coordinator;
        nativeToken = _nativeToken;
        recipientRegistry = _recipientRegistry;
    }

    modifier onlyMaci() {
        require(
            msg.sender == address(extContracts.maci),
            "GrantRound: caller is not MACI."
        );
        _;
    }

    /**
     * @notice Allows anyone to publish a batch of messages (an encrypted command and signature).
     * @dev This function also enqueues the messages.
     * @param _messages Message[] The messages to publish as an array of Message structs.
     * @param _encPubKeys PubKey[] An array of epheremal public keys which can be combined with the
     *     coordinator's private key to generate an ECDH shared key with which
     *     to encrypt the message.
     */
    function publishMessageBatch(
        Message[] calldata _messages,
        PubKey[] calldata _encPubKeys
    ) external {
        uint256 batchSize = _messages.length;
        for (uint8 i = 0; i < batchSize; i++) {
            publishMessage(_messages[i], _encPubKeys[i]);
        }

        emit Voted(msg.sender);
    }

    /**
     * @dev Publish the IPFS hash of the vote tally. Only coordinator can publish.
     * @param _tallyHash IPFS hash of the vote tally.
     */
    function publishTallyHash(string calldata _tallyHash) external {
        require(
            msg.sender == coordinator,
            "GrantRound: Sender is not the coordinator"
        );
        require(!isFinalized, "GrantRound: Round finalized");
        require(
            bytes(_tallyHash).length != 0,
            "GrantRound: Tally hash is empty string"
        );
        tallyHash = _tallyHash;

        emit TallyPublished(_tallyHash);
    }

    /*
     * @dev Get the total amount of votes from MACI,
     * verify the total amount of spent voice credits across all recipients,
     * and allow recipients to claim funds.
     * @param _totalSpent Total amount of spent voice credits.
     * @param _totalSpentSalt The salt.
     */
    function finalize(uint256 _alphaDenominator)
        external
        onlyMaci
        isAfterVotingDeadline
    {
        require(!isFinalized, "GrantRound: Already finalized");
        require(stateAqMerged, "GrantRound: State AQ not merged");
        require(
            extContracts.messageAq.treeMerged(),
            "GrantRound: Message AQ not merged"
        );
        require(
            address(extContracts.maci) != address(0),
            "GrantRound: MACI not deployed"
        );
        require(
            bytes(tallyHash).length != 0,
            "GrantRound: Tally hash has not been published"
        );
        // If nobody voted, the round should be cancelled to avoid locking of matching funds
        require(numMessages > 0, "GrantRound: No votes");

        // Total amount of spent voice credits is the size of the pool of direct rewards.
        // Everything else, including unspent voice credits and downscaling error,
        // is considered a part of the matching pool
        matchingPoolSize =
            nativeToken.balanceOf(address(this)) -
            totalSpent *
            voiceCreditFactor;
        alpha = matchingPoolSize / _alphaDenominator; // alpha is the matching pool size divided by the sum of tallyResult^2 for each project
        isFinalized = true;
    }

    /**
     * @dev Cancel funding round.
     */
    function cancel() external onlyOwner {
        require(!isFinalized, "GrantRound: Already finalized");
        isFinalized = true;
        isCancelled = true;

        emit GrantRoundCancelled(isFinalized, isCancelled);
    }

    /**
     * @dev Get allocated token amount (without verification).
     * @param _tallyResult The result of vote tally for the recipient.
     * @param _spent The amount of voice credits spent on the recipient.
     */
    function getAllocatedAmount(uint256 _tallyResult, uint256 _spent)
        public
        view
        returns (uint256)
    {
        return alpha * _tallyResult**2 + _spent * voiceCreditFactor;
    }

    /*
     * @dev Claim allocated tokens.
     * @param _voteOptionIndex Vote option index.
     * @param _tallyResult The result of vote tally for the recipient.
     * @param _tallyResultProof Proof of correctness of the vote tally.
     * @param _tallyResultSalt Salt.
     * @param _spent The amount of voice credits spent on the recipient.
     * @param _spentProof Proof of correctness for the amount of spent credits.
     * @param _spentSalt Salt.
     */
    function claimFunds(
        uint256 _voteOptionIndex,
        uint256 _tallyResult,
        uint256[][] memory _tallyResultProof,
        uint256 _tallyResultSalt,
        uint256 _spentVoiceCreditsHash,
        uint256 _perVOSpentVoiceCreditsHash,
        uint256 _tallyCommitment,
        uint256 _spent
    ) external payable {
        require(isFinalized, "GrantRound: Round not finalized");
        require(!isCancelled, "GrantRound: Round has been cancelled");
        require(
            !recipients[_voteOptionIndex],
            "FundingRound: Funds already claimed"
        );
        {
            bool resultVerified = verifyTallyResult(
                _voteOptionIndex,
                _tallyResult,
                _tallyResultProof,
                _tallyResultSalt,
                _spentVoiceCreditsHash,
                _perVOSpentVoiceCreditsHash,
                _tallyCommitment
            );
            //TODO: Handle donations if accepting contributions
            //TODO: verifyPerVOSpentVoiceCredits should be called after verifying the tally result
            // require( sha256(_spent) == _spentVoiceCreditsHash, "GrantRound: Spent is incorrect" );
            require(resultVerified, "FundingRound: Incorrect tally result");
        }
        recipients[_voteOptionIndex] = true;
        (uint256 deployTime, uint256 duration) = getDeployTimeAndDuration();
        address recipient = recipientRegistry.getRecipientAddress(
            _voteOptionIndex,
            deployTime,
            deployTime + duration
        );
        if (recipient == address(0)) {
            // Send funds back to the matching pool
            recipient = owner();
        }
        uint256 allocatedAmount = getAllocatedAmount(_tallyResult, 0);
        nativeToken.safeTransfer(recipient, allocatedAmount);

        emit FundsClaimed(recipient, _voteOptionIndex, allocatedAmount);
    }

    /*
     * @dev Transfer funds from matching pool to current funding round and finalize it.
     * @param _totalSpent Total amount of spent voice credits.
     * @param _totalSpentSalt The salt.
     */
    function transferMatchingFunds(
        uint256 _voteOptionIndex,
        uint256 _payoutAmount,
        address _erc20Address
    ) external payable onlyOwner {
        require(
            !isFinalized || isCancelled,
            "GrantRound: Round has been cancelled"
        );
        require(
            !recipients[_voteOptionIndex],
            "FundingRound: Funds already claimed"
        );
        recipients[_voteOptionIndex] = true;
        ERC20 roundToken = ERC20(_erc20Address);
        (uint256 deployTime, uint256 duration) = getDeployTimeAndDuration();
        address recipient = recipientRegistry.getRecipientAddress(
            _voteOptionIndex,
            deployTime,
            deployTime + duration
        );
        // Factory contract is the default funding source
        uint256 balance = roundToken.balanceOf(address(this));
        if (balance >= _payoutAmount) {
            roundToken.safeTransfer(recipient, _payoutAmount);
        }
        emit FundsClaimed(recipient, _voteOptionIndex, _payoutAmount);
    }
}
