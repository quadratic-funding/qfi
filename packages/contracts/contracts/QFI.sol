// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.8.1;

import {MACI} from "qaci-contracts/contracts/MACI.sol";
import {Params} from "qaci-contracts/contracts/Params.sol";

import {PollFactory, Poll, PollProcessorAndTallyer, MessageAqFactory} from "qaci-contracts/contracts/Poll.sol";
import {VkRegistry} from "qaci-contracts/contracts/VkRegistry.sol";
import {InitialVoiceCreditProxy} from "qaci-contracts/contracts/initialVoiceCreditProxy/InitialVoiceCreditProxy.sol";
import {SignUpGatekeeper} from "qaci-contracts/contracts/gatekeepers/SignUpGatekeeper.sol";
import {ConstantInitialVoiceCreditProxy} from "qaci-contracts/contracts/initialVoiceCreditProxy/ConstantInitialVoiceCreditProxy.sol";
import {FreeForAllGatekeeper} from "qaci-contracts/contracts/gatekeepers/FreeForAllSignUpGatekeeper.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {GrantRound} from "./GrantRound.sol";
import {FundsManager} from "./FundsManager.sol";
import {GrantRoundFactory} from "./GrantRoundFactory.sol";

/**
 * @title Quadratic Funding Infrastructure
 * @author Q
 * @notice  Top level contract for the Quadratic Funding Infrastructure
 * @dev Special type of MACI that allows for a quadratic funding scheme.
 */
contract QFI is MACI, FundsManager {
    /**
     * Event issued when the QFI contract is deployed.
     * @param _grantRoundFactory The Ethereum smart contract address of the current Grant Round Factory.
     * @param _nativeToken The Ethereum smart contract address of the ERC20 Token used for the current Grant Round.
     * @param _voiceCreditFactor Constant used to handle VCs / Tokens conversions (e.g., reconstruct the exact contribution amount in Token from VCs).
     * @param _currentStage The updated value for the current QFI stage.
     */
    event QfiDeployed(
        address _grantRoundFactory,
        address _nativeToken,
        uint256 _voiceCreditFactor,
        Stage _currentStage
    );

    /**
     * Event issued when the owner (deployer) initialize the QFI contract.
     * @param _messageAqFactoryGrantRounds The Ethereum smart contract address of the Message AQ Factory for the current Grant Round.
     * @param _currentStage The updated value for the current QFI stage.
     */
    event QfiInitialized(
        address _messageAqFactoryGrantRounds,
        Stage _currentStage
    );

    /**
     * Event issued when the owner (deployer) set the PollProcessorAndTallyer contract.
     * @param _pollProcessorAndTallyer The Ethereum smart contract address of the PollProcessorAndTallyer contract for the current Grant Round.
     */
    event PollProcessorAndTallyerChanged(address _pollProcessorAndTallyer);

    /**
     * Event issued when an unregistered user signs up and contributes to the current Grant Round.
     * @param _contributor The Ethereum address of who sends the contribution.
     * @param _amount The amount in native ERC20 tokens submitted as contribution.
     */
    event ContributionSent(address _contributor, uint256 _amount);

    /**
     * Event issued when a contributor decides to withdraw his/her contribution for the current Grant Round.
     * @param _contributor The Ethereum address of who withdraws the contribution.
     */
    event ContributionWithdrew(address _contributor);

    /**
     * Event issued when the owner (deployer) deploy a new Grant Round.
     * @param _currentGrantRound The Ethereum smart contract address of the current Grant Round.
     * @param _duration The duration of the current Grant Round.
     * @param _maxValues The maximum amount of messages and vote options of the current Grant Round.
     * @param _treeDepths The intStateTreeDepth, messageTreeSubDepth, messageTreeDepth, and voteOptionTreeDepth.
     * @param _batchSizes The message and vote tally batch sizes.
     * @param _coordinatorPubKey The MACI public key of the coordinator of the current Grant Round.
     * @param _currentStage The updated value for the current QFI stage.
     */
    event GrantRoundDeployed(
        address _currentGrantRound,
        uint256 _duration,
        MaxValues _maxValues,
        TreeDepths _treeDepths,
        BatchSizes _batchSizes,
        PubKey _coordinatorPubKey,
        Stage _currentStage
    );

    /**
     * Event issued when the owner (deployer) decides to close the voting period for the current Grant Round.
     * @param _currentStage The updated value for the current QFI stage.
     */
    event VotingPeriodClosed(Stage _currentStage);

    /**
     * Event issued when the owner (deployer) decides to start accepting contribution/signup period for the next Grant Round.
     * @param _currentStage The updated value for the current QFI stage.
     */
    event PreRoundContributionPeriodStarted(Stage _currentStage);

    /**
     * Event issued when the owner finalizes the current Grant Round.
     * @param _currentGrantRound The Ethereum smart contract address of the current Grant Round.
     * @param _currentStage The updated value for the current QFI stage.
     */
    event GrantRoundFinalized(address _currentGrantRound, Stage _currentStage);

    using SafeERC20 for ERC20;
    enum Stage {
        // The contract is not yet initialized
        NOT_INITIALIZED,
        // The current poll/grant round is NOT started and MACI is waiting for SignUp/Topups from contributions
        WAITING_FOR_SIGNUPS_AND_TOPUPS,
        // The current poll/grant round is started, voice credit balances are locked, can submit messages to current poll
        VOTING_PERIOD_OPEN,
        // The current poll/grant round is over, cannot submit messages to current poll, but votes have not been tallied yet
        WAITING_FOR_FINALIZATION,
        // The current poll/grant round is over, and votes have been tallied, and matching funds have been distributed to grant contract
        FINALIZED,
        // The current poll/grant round is cancelled, and contributions can be withdrawn
        CANCELLED
    }

    Stage public currentStage;
    // Constants
    uint256 private constant MAX_VOICE_CREDITS = 10**9; // MACI allows 2 ** 32 voice credits max
    uint256 private constant MAX_CONTRIBUTION_AMOUNT = 10**4; // In tokens

    // State
    uint256 public voiceCreditFactor;

    struct ContributorStatus {
        uint256 voiceCredits;
        bool isRegistered;
    }

    MessageAqFactory public messageAqFactoryGrants;
    GrantRoundFactory public grantRoundFactory;
    GrantRound public currentGrantRound;
    PollProcessorAndTallyer public pollProcessorAndTallyer;

    uint256 public nextGrantRoundId;
    uint256 public contributorCount;
    ERC20 public nativeToken;

    // A mapping of grantRound IDs to GrantRound contracts.
    mapping(uint256 => GrantRound) public grantRounds;
    mapping(address => ContributorStatus) private contributors;

    /**
     * @notice Constructor for the Quadratic Funding Infrastructure
     * @dev Binds the contracts that are needed for the Quadratic Funding Infrastructure
     * @param _grantRoundFactory GrantRoundFactory, the contract that will be used to create GrantRounds which are a special type of Poll
     * @param _pollFactory PollFactory, the contract that will be used to create Polls
     * @param _signUpGatekeeper SignUpGatekeeper, the contract that will be used to limit who can sign up to MACI
     * @param _initialVoiceCreditProxy InitialVoiceCreditProxy, the contract that will be used to set the initial voice credit balance for a user
     */
    constructor(
        ERC20 _nativeToken,
        GrantRoundFactory _grantRoundFactory,
        PollFactory _pollFactory,
        SignUpGatekeeper _signUpGatekeeper,
        InitialVoiceCreditProxy _initialVoiceCreditProxy
    ) MACI(_pollFactory, _signUpGatekeeper, _initialVoiceCreditProxy) {
        grantRoundFactory = _grantRoundFactory;
        currentStage = Stage.NOT_INITIALIZED;
        nativeToken = _nativeToken;
        voiceCreditFactor =
            (MAX_CONTRIBUTION_AMOUNT * uint256(10)**nativeToken.decimals()) /
            MAX_VOICE_CREDITS;
        voiceCreditFactor = voiceCreditFactor > 0 ? voiceCreditFactor : 1;

        emit QfiDeployed(
            address(_grantRoundFactory),
            address(_nativeToken),
            voiceCreditFactor,
            currentStage
        );
    }

    /*
     * Initialise the various factory/helper contracts. This should only be run
     * once and it must be run before deploying the first Poll.
     */
    function initialize(
        VkRegistry _vkRegistry,
        MessageAqFactory _messageAqFactoryPolls,
        MessageAqFactory _messageAqFactoryGrantRounds
    ) public onlyOwner {
        // The VkRegistry owner must be the owner of this contract, this is checked in the init function
        init(_vkRegistry, _messageAqFactoryPolls);

        messageAqFactoryGrants = _messageAqFactoryGrantRounds;

        require(
            grantRoundFactory.owner() == address(this),
            "MACI: GrantFactory owner incorrectly set"
        );

        // The PollFactory needs to store the MessageAqFactory address
        grantRoundFactory.setMessageAqFactory(_messageAqFactoryGrantRounds);

        // The MessageAQFactory owner must be the PollFactory contract
        require(
            messageAqFactoryGrants.owner() == address(grantRoundFactory),
            "MACI: MessageAqFactory owner incorrectly set"
        );
        currentStage = Stage.WAITING_FOR_SIGNUPS_AND_TOPUPS;

        emit QfiInitialized(
            address(_messageAqFactoryGrantRounds),
            currentStage
        );
    }

    /**
     * @notice Sets the PollProcessorAndTallyer to use for the grant round
     * @dev public function,
     * @param _pollProcessorAndTallyer PollProcessorAndTallyer stored in memory
     */
    function setPollProcessorAndTallyer(
        PollProcessorAndTallyer _pollProcessorAndTallyer
    ) public onlyOwner {
        pollProcessorAndTallyer = _pollProcessorAndTallyer;

        emit PollProcessorAndTallyerChanged(address(_pollProcessorAndTallyer));
    }

    /**
     * @notice Contribute tokens to this funding round.
     * @dev public function, allows a user to contribute to this funding round by sending tokens in exchange for voice credits.
     * @param pubKey Contributor's public key.
     * @param amount Contribution amount.
     */
    function contribute(PubKey calldata pubKey, uint256 amount) external {
        require(
            numSignUps < STATE_TREE_ARITY**stateTreeDepth,
            "MACI: maximum number of signups reached"
        );
        require(
            currentStage == Stage.WAITING_FOR_SIGNUPS_AND_TOPUPS,
            "QFI: Not accepting signups or top ups"
        );
        require(
            amount > 0,
            "QFI: Contribution amount must be greater than zero"
        );
        require(
            amount <= MAX_VOICE_CREDITS * voiceCreditFactor,
            "QFI: Contribution amount is too large"
        );
        // TODO: TOP UP CHECK
        require(
            contributors[msg.sender].voiceCredits == 0,
            "QFI: top ups not supported, donate to matching pool instead"
        );
        uint256 voiceCredits = amount / voiceCreditFactor;
        contributors[msg.sender] = ContributorStatus(voiceCredits, false);
        contributorCount += 1;
        bytes memory signUpGatekeeperData = abi.encode(
            msg.sender,
            voiceCredits
        );
        bytes memory initialVoiceCreditProxyData = abi.encode(
            msg.sender,
            voiceCredits
        );
        nativeToken.safeTransferFrom(msg.sender, address(this), amount);

        signUp(pubKey, signUpGatekeeperData, initialVoiceCreditProxyData);

        emit ContributionSent(msg.sender, amount);
    }

    /**
     * @dev Get the amount of voice credits for a given address.
     * This function is a part of the InitialVoiceCreditProxy interface.
     * @param _data Encoded address of a user.
     */
    function getVoiceCredits(
        address, /* _caller */
        bytes memory _data
    ) public view returns (uint256) {
        address user = abi.decode(_data, (address));
        uint256 initialVoiceCredits = contributors[user].voiceCredits;
        require(
            initialVoiceCredits > 0,
            "FundingRound: User does not have any voice credits"
        );
        return initialVoiceCredits;
    }

    /**
     * @dev Withdraw contributed funds from the pool if the round has been cancelled.
     */
    function withdrawContribution() external {
        require(
            currentStage == Stage.WAITING_FOR_SIGNUPS_AND_TOPUPS,
            "QFI: Not accepting signups or top ups"
        );
        // Reconstruction of exact contribution amount from VCs may not be possible due to a loss of precision
        uint256 amount = contributors[msg.sender].voiceCredits *
            voiceCreditFactor;
        require(amount > 0, "FundingRound: Nothing to withdraw");
        contributors[msg.sender].voiceCredits = 0;
        nativeToken.safeTransfer(msg.sender, amount);

        emit ContributionWithdrew(msg.sender);
    }

    /**
     * @notice Deploys a new grant round.
     * @dev Deploys a special kind of Poll called a GrantRound.
     * @param _duration uint256  stored in memory, the duration of the GrantRound
     * @param _maxValues MaxValues stored in memory, the maxMessages and maxVoteOptions of the GrantRound as uint256 values
     * @param _treeDepths TreeDepths stored in memory, intStateTreeDepth, messageTreeSubDepth, messageTreeDepth, and voteOptionTreeDepth as uint8 values
     * @param _coordinatorPubKey PubKey stored in memory, MACI pubkey of the coordinator of the GrantRounds
     */
    function deployGrantRound(
        uint256 _duration,
        MaxValues memory _maxValues,
        TreeDepths memory _treeDepths,
        PubKey memory _coordinatorPubKey,
        address coordinator
    ) public afterInit onlyOwner {
        require(
            currentStage == Stage.WAITING_FOR_SIGNUPS_AND_TOPUPS,
            "MACI: Cannot deploy a new grant round while not in the WAITING_FOR_SIGNUPS_AND_TOPUPS stage"
        );
        uint256 pollId = nextPollId;
        uint256 grantRoundId = nextGrantRoundId;

        // The message batch size and the tally batch size
        BatchSizes memory batchSizes = BatchSizes(
            uint8(MESSAGE_TREE_ARITY)**uint8(_treeDepths.messageTreeSubDepth),
            uint8(STATE_TREE_ARITY)**uint8(_treeDepths.intStateTreeDepth)
        );

        GrantRound g = grantRoundFactory.deployGrantRound(
            voiceCreditFactor,
            coordinator,
            nativeToken,
            _duration,
            _maxValues,
            _treeDepths,
            batchSizes,
            _coordinatorPubKey,
            vkRegistry,
            this,
            owner()
        );

        currentGrantRound = g;
        polls[pollId] = g;
        grantRounds[grantRoundId] = g;
        // Increment the grantRound ID for the next poll
        nextGrantRoundId++;
        // Increment the poll ID for the next poll
        nextPollId++;

        currentStage = Stage.VOTING_PERIOD_OPEN;

        emit GrantRoundDeployed(
            address(currentGrantRound),
            _duration,
            _maxValues,
            _treeDepths,
            batchSizes,
            _coordinatorPubKey,
            currentStage
        );
    }

    /**
     * @notice Retrieves the grant round contract given its ID.
     * @dev public view function, returns the Poll address given its grantRoundId.
     * @param _grantRoundId uint256 grantRoundId of the GrantRound to retrieve
     * @return returns the GrantRound contract
     */
    function getGrantRound(uint256 _grantRoundId)
        public
        view
        returns (GrantRound)
    {
        require(
            _grantRoundId < nextGrantRoundId,
            "MACI: grantRound with _grantRoundId does not exist"
        );
        return grantRounds[_grantRoundId];
    }

    /**
     * @notice Calculate the voting deadline for a grant round.
     * @dev public view function
     * @param grantRound uint256 grantRoundId of the GrantRound to use
     * @return uint256 the voting deadline for the current grant round
     */
    function getVotingDeadline(uint256 grantRound)
        public
        view
        returns (uint256)
    {
        GrantRound g = getGrantRound(grantRound);
        (uint256 deployTime, uint256 duration) = g.getDeployTimeAndDuration();
        // Require that the voting period is over
        uint256 deadline = duration + deployTime;
        return deadline;
    }

    function closeVotingAndWaitForDeadline() public onlyOwner {
        require(
            currentStage == Stage.VOTING_PERIOD_OPEN,
            "MACI: WAITING_FOR_SIGNUPS_AND_TOPUPS Cannot deploy a new grant round"
        );
        //TODO: ACTUALLY CLOSE THE VOTING PERIOD on the grant round contract
        currentStage = Stage.WAITING_FOR_FINALIZATION;

        emit VotingPeriodClosed(currentStage);
    }

    function finalizeCurrentRound(
        uint256 _finalTallyCommitment,
        uint256 _finalSbCommitment,
        uint256 _alphaDenominator
    ) external onlyOwner {
        require(
            currentStage == Stage.WAITING_FOR_FINALIZATION,
            "QFI: Cannot finalize a grant round while not in the WAITING_FOR_FINALIZATION stage"
        );
        require(
            pollProcessorAndTallyer.processingComplete(),
            "QFI: messages have not been proccessed"
        );
        require(
            _finalSbCommitment == pollProcessorAndTallyer.sbCommitment(),
            "QFI: finalTallyCommitment does not match the current grant round's tally commitment"
        );
        require(
            _finalTallyCommitment == pollProcessorAndTallyer.tallyCommitment(),
            "QFI: finalTallyCommitment does not match the current grant round's tally commitment"
        );

        GrantRound g = currentGrantRound;

        //NOTE: matching pool will be balance of the grant contract less the totalSpent * voiceCreditFactor
        transferMatchingFunds(g);
        //NOTE: tansfer the funds to the grant round contract first before finalizing, so that the matching pool is calculated correctly
        g.finalize(_alphaDenominator);

        currentStage = Stage.FINALIZED;

        emit GrantRoundFinalized(address(g), currentStage);
    }

    function acceptContributionsAndTopUpsBeforeNewRound() public onlyOwner {
        require(
            currentStage == Stage.FINALIZED,
            "QFI: Cannot deploy a new grant round while not in the WAITING_FOR_SIGNUPS_AND_TOPUPS stage"
        );
        currentStage = Stage.WAITING_FOR_SIGNUPS_AND_TOPUPS;

        emit PreRoundContributionPeriodStarted(currentStage);
    }
}
