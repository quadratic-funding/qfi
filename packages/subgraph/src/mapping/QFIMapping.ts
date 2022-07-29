import { BigInt, log, store } from "@graphprotocol/graph-ts"
import { OwnershipTransferred } from "../../generated/GrantRoundFactory/GrantRoundFactory"
import {
    QFI as QFIContract,
    ContributionWithdrew,
    GrantRoundDeployed,
    GrantRoundFinalized,
    Init,
    QfiInitialized,
    MergeStateAq,
    SignUp,
    ContributionSent,
    VotingPeriodClosed,
    PreRoundContributionPeriodStarted,
    PollProcessorAndTallyerChanged,
    MaciDeployed,
    QfiDeployed,
    FundingSourceAdded,
    FundingSourceRemoved
} from "../../generated/QFI/QFI"
import { GrantRound as GrantRoundContract } from "../../generated/templates/GrantRound/GrantRound"
import {
    QFI as QFISchema,
    GrantRound,
    PublicKey,
    Coordinator,
    Contribution,
    Contributor,
    FundingSource,
    GrantRoundContributor,
    GrantRoundFactory
} from "../../generated/schema"
import { GrantRound as GrantRoundTemplate } from "../../generated/templates"
import { currentStageConverterFromEnumIndexToString } from "../utils/converter"
import { ONE } from "../utils/constants"

/**
 * Handle a smart contract based on MACI (constructor event).
 * @param event Ethereum event emitted when deploying a smart contract based on MACI.
 */
export function handleMaciDeployed(event: MaciDeployed): void {
    log.debug(`MACI Deployed event block: {}`, [event.block.number.toString()])

    // TODO: need to add MaciDeployed event to MACI smart contract to trigger this. For now,
    // we are just not using it (therefore, the QFI creation is on the QfiDeployed handler).

    const timestamp = event.block.timestamp.toString()

    // Get the QFI/MACI instance.
    const qfiAddress = event.address
    const qfiContract = QFIContract.bind(qfiAddress)
    const qfiId = qfiAddress.toHexString()
    const qfi = new QFISchema(qfiId)

    qfi.stateAqAddress = event.params._stateAq
    qfi.pollFactoryAddress = event.params._pollFactory
    qfi.initialVoiceCreditProxyAddress = event.params._initialVoiceCreditProxy
    qfi.signUpGatekeeperAddress = event.params._signUpGatekeeper
    qfi.signUpTimestamp = event.params._timestamp
    qfi.createdAt = timestamp
    qfi.lastUpdatedAt = timestamp

    // External call to contract instance (one time event - good trade-off for sync time).
    qfi.stateTreeDepth = qfiContract.stateTreeDepth()
    qfi.numSignUps = qfiContract.numSignUps()
    qfi.nextGrantRoundId = qfiContract.nextGrantRoundId()
    qfi.contributorCount = qfiContract.contributorCount()
    qfi.voiceCreditFactor = qfiContract.voiceCreditFactor()
    qfi.isInitialized = qfiContract.isInitialised()
    qfi.stateTreeDepth = qfiContract.stateTreeDepth()
    qfi.isStateAqMerged = false
    qfi.currentStage = currentStageConverterFromEnumIndexToString(qfiContract.currentStage().toString())

    qfi.save()

    log.debug(`handleMaciDeployed executed correctly`, [])
}

/**
 * Handle a new QFI instance deploy.
 * @param event Ethereum event emitted when a new QFI instance is deployed.
 */
export function handleQfiDeployed(event: QfiDeployed): void {
    log.debug(`QFI Deployed event block: {}`, [event.block.number.toString()])

    const timestamp = event.block.timestamp.toString()

    // Create the QFI/MACI instance.
    const qfiAddress = event.address
    const qfiContract = QFIContract.bind(qfiAddress)
    const qfiId = qfiAddress.toHexString()
    const qfi = new QFISchema(qfiId)

    qfi.grantRoundFactoryAddress = event.params._grantRoundFactory
    qfi.nativeERC20TokenAddress = event.params._nativeToken
    qfi.voiceCreditFactor = event.params._voiceCreditFactor
    qfi.currentStage = currentStageConverterFromEnumIndexToString(event.params._currentStage.toString())

    // From contract.
    qfi.stateAqAddress = qfiContract.stateAq()
    qfi.pollFactoryAddress = qfiContract.pollFactory()
    qfi.initialVoiceCreditProxyAddress = qfiContract.initialVoiceCreditProxy()
    qfi.signUpGatekeeperAddress = qfiContract.signUpGatekeeper()
    qfi.signUpTimestamp = qfiContract.signUpTimestamp()
    qfi.isInitialized = qfiContract.isInitialised()
    qfi.stateTreeDepth = qfiContract.stateTreeDepth()
    qfi.numSignUps = qfiContract.numSignUps()
    qfi.nextGrantRoundId = qfiContract.nextGrantRoundId()
    qfi.contributorCount = qfiContract.contributorCount()
    qfi.voiceCreditFactor = qfiContract.voiceCreditFactor()
    qfi.isInitialized = qfiContract.isInitialised()
    qfi.stateTreeDepth = qfiContract.stateTreeDepth()
    qfi.isStateAqMerged = false
    qfi.currentStage = currentStageConverterFromEnumIndexToString(qfiContract.currentStage().toString())

    qfi.createdAt = timestamp
    qfi.lastUpdatedAt = timestamp

    const grantRoundFactoryAddress = event.params._grantRoundFactory
    const grantRoundFactoryId = grantRoundFactoryAddress.toHexString()
    let grantRoundFactory = GrantRoundFactory.load(grantRoundFactoryId)

    // Check if the Grant Round Factory entity has been already created; otherwise create a new one.
    if (grantRoundFactory !== null) {
        const recipientRegistryAddress = grantRoundFactory.recipientRegistryAddress

        qfi.recipientRegistry = recipientRegistryAddress ? recipientRegistryAddress.toHexString() : null
    } else {
        // Create a new Grant Round Factory entity.
        grantRoundFactory = new GrantRoundFactory(grantRoundFactoryId)
        grantRoundFactory.createdAt = timestamp
        grantRoundFactory.lastUpdatedAt = timestamp

        grantRoundFactory.save()
    }

    qfi.lastUpdatedAt = timestamp
    qfi.save()

    log.debug(`handleQfiDeployed executed correctly`, [])
}

/**
 * Handle the initialization of a smart contract based on MACI.
 * @param event Ethereum event emitted when initializing a smart contract based on MACI.
 */
export function handleInitMaci(event: Init): void {
    log.debug(`Init MACI event block: {}`, [event.block.number.toString()])

    const timestamp = event.block.timestamp.toString()

    // Get the QFI/MACI instance.
    const qfiAddress = event.address
    const qfiContract = QFIContract.bind(qfiAddress)
    const qfiId = qfiAddress.toHexString()
    const qfi = QFISchema.load(qfiId)

    if (qfi !== null) {
        qfi.vkRegistryAddress = event.params._vkRegistry
        qfi.messageAqFactoryPollAddress = event.params._messageAqFactory
        qfi.isInitialized = qfiContract.isInitialised()
        qfi.lastUpdatedAt = timestamp

        qfi.save()
    } else {
        log.error(`QFI entity not found!`, [])
    }

    log.debug(`handleInitMaci executed correctly`, [])
}

/**
 * Handle the initialization of the QFI smart contract.
 * @param event Ethereum event emitted when initializing the QFI smart contract.
 */
export function handleQfiInitialized(event: QfiInitialized): void {
    log.debug(`QfiInitialized event block: {}`, [event.block.number.toString()])

    const timestamp = event.block.timestamp.toString()

    // Get the QFI/MACI instance.
    const qfiAddress = event.address
    const qfiId = qfiAddress.toHexString()
    const qfi = QFISchema.load(qfiId)

    if (qfi !== null) {
        qfi.messageAqFactoryGrantRoundAddress = event.params._messageAqFactoryGrantRounds
        qfi.currentStage = currentStageConverterFromEnumIndexToString(event.params._currentStage.toString())
        qfi.lastUpdatedAt = timestamp

        qfi.save()
    } else {
        log.error(`QFI entity not found!`, [])
    }

    log.debug(`handleQfiInitialized executed correctly`, [])
}

/**
 * Handle the signup of a new user to QFI/MACI.
 * @param event Ethereum event emitted when someone do signup on QFI/MACI.
 */
export function handleSignUp(event: SignUp): void {
    log.debug(`SignUp event block: {}`, [event.block.number.toString()])

    const timestamp = event.block.timestamp.toString()

    // User public key.
    const publicKeyId = event.transaction.from.toHexString()
    const publicKey = PublicKey.load(publicKeyId)

    if (publicKey === null) {
        // Create a new PublicKey instance.
        const publicKey = new PublicKey(publicKeyId)

        publicKey.x = event.params._userPubKey.x
        publicKey.y = event.params._userPubKey.y
        publicKey.stateIndex = event.params._stateIndex
        publicKey.voiceCreditBalance = event.params._voiceCreditBalance
        publicKey.timestamp = timestamp
        publicKey.lifetimeAmountContributed = new BigInt(0)
        publicKey.lastUpdatedAt = timestamp

        publicKey.save()
    } else {
        log.error(`Public key already in use!`, [])
    }

    // QFI.
    const qfiAddress = event.address
    const qfiId = qfiAddress.toHexString()
    const qfi = QFISchema.load(qfiId)

    if (qfi !== null) {
        qfi.numSignUps = qfi.numSignUps.plus(ONE)
        qfi.lastUpdatedAt = timestamp

        qfi.save()
    } else {
        log.error(`QFI entity not found!`, [])
    }
}

/**
 * Handle the merge of the state message AQ.
 * @param event Ethereum event emitted when the state message AQ is merged.
 */
export function handleMergeStateAq(event: MergeStateAq): void {
    log.debug(`MergeStateAq event block: {}`, [event.block.number.toString()])

    const timestamp = event.block.timestamp.toString()
    const qfiAddress = event.address
    const qfiId = qfiAddress.toHexString()
    const qfi = QFISchema.load(qfiId)

    if (qfi !== null) {
        qfi.isStateAqMerged = true
        qfi.lastUpdatedAt = timestamp

        qfi.save()

        const currentGrantRound = qfi.currentGrantRound
        if (currentGrantRound) {
            // Update GrantRound.
            const grantRound = GrantRound.load(currentGrantRound)

            if (grantRound !== null) {
                grantRound.stateAqMerged = true
                grantRound.lastUpdatedAt = timestamp

                grantRound.save()
            } else {
                log.error("GrantRound is not initialized!", [])
            }
        } else {
            log.error("QFI current GrantRound is not initialized!", [])
        }
    } else {
        log.error("QFI is not initialized!", [])
    }
}

/**
 * Handle the contribution in native ERC20 token to matching pool from a user.
 * @param event Ethereum event emitted when someone donates/fund the matching pool in exchange of VCs.
 */
export function handleContributionSent(event: ContributionSent): void {
    log.debug(`ContributionSent event block: {}`, [event.block.number.toString()])

    // Get QFI.
    const qfiAddress = event.address
    const qfiId = qfiAddress.toHexString()
    const qfi = QFISchema.load(qfiId)

    if (qfi !== null) {
        // Get Contributor.
        const contributorAddress = event.params._contributor
        const contributorId = contributorAddress.toHexString()
        let contributor = Contributor.load(contributorId)
        const grantRoundId = qfi.currentGrantRound
        const timestamp = event.block.timestamp.toString()

        if (grantRoundId) {
            // Create a new mapping table for GrantRound-Contribution relationship.
            const mappingTableGRCId = grantRoundId.concat("-").concat(contributorId)
            let mappingTableGRC = GrantRoundContributor.load(mappingTableGRCId)

            // Associate a new PublicKey to the Contributor.
            const publicKeyId = contributorId
            const publicKey = PublicKey.load(publicKeyId)

            if (publicKey !== null) {
                if (contributor === null) {
                    contributor = new Contributor(contributorId)
                }

                if (mappingTableGRC === null) {
                    mappingTableGRC = new GrantRoundContributor(mappingTableGRCId)
                }

                contributor.address = event.params._contributor
                contributor.voiceCredits = publicKey.voiceCreditBalance
                contributor.isRegistered = false // TODO: To be checked.
                contributor.publicKey = publicKeyId
                contributor.txHash = event.transaction.hash
                contributor.createdAt = timestamp
                contributor.lastUpdatedAt = timestamp

                mappingTableGRC.grantRound = grantRoundId
                mappingTableGRC.contributor = contributorId

                contributor.save()
                mappingTableGRC.save()

                // Get the VoiceCreditFactor from QFI contract (for each contribution - trade off to be considered).
                const qfiContract = QFIContract.bind(qfiAddress)
                const voiceCreditFactor = qfiContract.voiceCreditFactor()

                // Create a new Contribution.
                const contributionId = grantRoundId.concat("-").concat(contributorId)
                const contribution = new Contribution(contributionId)

                contribution.contributor = contributorId
                contribution.grantRound = grantRoundId
                contribution.publicKey = publicKeyId
                contribution.amount = event.params._amount
                contribution.voiceCredits = event.params._amount.div(voiceCreditFactor)
                contribution.createdAt = timestamp
                contribution.lastUpdatedAt = timestamp

                contribution.save()

                // Update PublicKey.
                publicKey.voiceCreditBalance = publicKey.voiceCreditBalance.plus(
                    event.params._amount.div(voiceCreditFactor)
                )
                publicKey.lifetimeAmountContributed = publicKey.lifetimeAmountContributed.plus(event.params._amount)

                publicKey.save()

                qfi.contributorCount = qfi.contributorCount.plus(BigInt.fromI32(1))
                qfi.lastUpdatedAt = event.block.timestamp.toString()

                qfi.save()
            } else {
                log.error(`Contributor PublicKey not found!`, [])
            }
        } else {
            log.error(`GrantRound is not initialized!`, [])
        }
    } else {
        log.error(`QFI entity not found!`, [])
    }
}

/**
 * Handle the withdrawn of a user contribution.
 * @param event Ethereum event emitted when someone withdraw a contribution.
 */
export function handleContributionWithdrew(event: ContributionWithdrew): void {
    log.debug(`ContributionWithdrew event block: {}`, [event.block.number.toString()])

    // Get QFI.
    const qfiAddress = event.address
    const qfiId = qfiAddress.toHexString()
    const qfi = QFISchema.load(qfiId)

    if (qfi !== null) {
        // Get Contributor.
        const contributorId = event.params._contributor.toHexString()
        const grantRoundId = qfi.currentGrantRound

        if (grantRoundId !== null) {
            const contributionId = grantRoundId.concat(contributorId)

            // Remove the Contribution from the store.
            store.remove("Contribution", contributionId)
        } else {
            log.error(`QFI current GrantRound is not initialized!`, [])
        }

        // Update QFI.
        qfi.contributorCount = qfi.contributorCount.minus(BigInt.fromI32(1))
        qfi.lastUpdatedAt = event.block.timestamp.toString()

        qfi.save()
    } else {
        log.error(`QFI entity not found!`, [])
    }
}

/**
 * Handle the deploy of a new Grant Round.
 * @param event Ethereum event emitted when a new GrantRound smart contract instance is deployed.
 */
export function handleGrantRoundDeployed(event: GrantRoundDeployed): void {
    log.debug(`GrantRoundDeployed event block: {}`, [event.block.number.toString()])

    const grantRoundId = event.params._currentGrantRound.toHexString()
    const grantRound = GrantRound.load(grantRoundId)

    const timestamp = event.block.timestamp.toString()
    const qfiAddress = event.address
    const coordinatorAddress = event.transaction.from
    const qfiContract = QFIContract.bind(qfiAddress)
    const voiceCreditFactor = qfiContract.voiceCreditFactor()

    if (grantRound === null) {
        // Start indexing the GrantRound.
        GrantRoundTemplate.create(event.params._currentGrantRound)
        // Create a new GrantRound entity.
        const grantRound = new GrantRound(grantRoundId)

        grantRound.duration = event.params._duration
        grantRound.maxMessages = event.params._maxValues.maxMessages
        grantRound.maxVoteOptions = event.params._maxValues.maxVoteOptions
        grantRound.messageTreeDepth = new BigInt(event.params._treeDepths.messageTreeDepth)
        grantRound.messageTreeSubDepth = new BigInt(event.params._treeDepths.messageTreeSubDepth)
        grantRound.voteOptionTreeDepth = new BigInt(event.params._treeDepths.voteOptionTreeDepth)
        grantRound.intStateTreeDepth = new BigInt(event.params._treeDepths.intStateTreeDepth)
        grantRound.deployTimestamp = event.block.timestamp
        grantRound.messageBatchSize = new BigInt(event.params._batchSizes.messageBatchSize)
        grantRound.tallyBatchSize = new BigInt(event.params._batchSizes.tallyBatchSize)
        grantRound.voiceCreditFactor = voiceCreditFactor
        grantRound.qfi = qfiAddress.toHexString()
        grantRound.coordinator = coordinatorAddress.toHexString()
        grantRound.createdAt = timestamp
        grantRound.lastUpdatedAt = timestamp

        grantRound.save()

        // Store the Coordinator.
        const coordinatorId = coordinatorAddress.toHexString()
        const coordinator = Coordinator.load(coordinatorId)

        if (coordinator === null) {
            const coordinator = new Coordinator(coordinatorId)

            coordinator.address = coordinatorAddress
            coordinator.publicKey = event.params._coordinatorPubKey.toString()
            coordinator.qfi = qfiAddress.toHexString()
            coordinator.grantRounds = [grantRoundId]
            coordinator.timestamp = timestamp

            coordinator.save()
        }

        // Update QFI.
        const qfiId = qfiAddress.toHexString()
        const qfi = QFISchema.load(qfiId)

        if (qfi !== null) {
            qfi.coordinator = coordinatorId
            qfi.currentGrantRound = grantRoundId.toString()
            qfi.nextGrantRoundId = qfi.nextGrantRoundId.plus(BigInt.fromI32(1))
            qfi.currentStage = currentStageConverterFromEnumIndexToString(event.params._currentStage.toString())
            qfi.lastUpdatedAt = event.block.timestamp.toString()

            qfi.save()
        } else {
            log.error(`QFI entity not found!`, [])
        }

        // Update Recipient Registry
    } else {
        log.error(`Grant Round already exists!`, [])
    }
}

/**
 * Handle the finalization step for a Grant Round.
 * @param event Ethereum event emitted when a Grant Round is finalized.
 */
export function handleGrantRoundFinalized(event: GrantRoundFinalized): void {
    log.debug(`GrantRoundFinalized event block: {}`, [event.block.number.toString()])

    // Get Grant Round.
    const grantRoundId = event.params._currentGrantRound.toHexString()
    const grantRoundContract = GrantRoundContract.bind(event.params._currentGrantRound)
    const grantRound = GrantRound.load(grantRoundId)

    // Read from Grant Round contract (there are no other possibilities to read these information).
    const totalSpent = grantRoundContract.totalSpent()
    const totalVotes = grantRoundContract.totalVotes()
    const tallyHash = grantRoundContract.tallyHash()
    const isFinalized = grantRoundContract.isFinalized()
    const isCancelled = grantRoundContract.isCancelled()
    const matchingPoolSize = grantRoundContract.matchingPoolSize()

    if (grantRound !== null) {
        grantRound.totalSpent = totalSpent
        grantRound.totalVotes = totalVotes
        grantRound.tallyHash = tallyHash
        grantRound.isFinalized = isFinalized
        grantRound.isCancelled = isCancelled
        grantRound.matchingPoolSize = matchingPoolSize

        grantRound.save()
    } else {
        log.error(`GrantRound entity not found!`, [])
    }

    // Update QFI.
    const qfiAddress = event.address
    const qfiId = qfiAddress.toHexString()
    const qfi = QFISchema.load(qfiId)

    if (qfi !== null) {
        qfi.currentStage = currentStageConverterFromEnumIndexToString(event.params._currentStage.toString())

        qfi.save()
    } else {
        log.error(`QFI entity not found!`, [])
    }
}

/**
 * (e.g., Add a Group in the storage).
 * @param event Ethereum event emitted when XYZ.
 */
export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    log.debug(`OwnershipTransferred event block: {}`, [event.block.number.toString()])
}

/**
 * Handle the closing of the voting period for a Grant Round.
 * @param event Ethereum event emitted when a voting period for a Grant Round is over.
 */
export function handleVotingPeriodClosed(event: VotingPeriodClosed): void {
    log.debug(`VotingPeriodClosed event block: {}`, [event.block.number.toString()])

    // Update QFI.
    const qfiAddress = event.address
    const qfiId = qfiAddress.toHexString()
    const qfi = QFISchema.load(qfiId)

    if (qfi !== null) {
        qfi.currentStage = currentStageConverterFromEnumIndexToString(event.params._currentStage.toString())

        qfi.save()
    } else {
        log.error(`QFI entity not found!`, [])
    }
}

/**
 * Handle the pre round contribution period start for a Grant Round.
 * @param event Ethereum event emitted when a pre round contribution period for a Grant Round is starting.
 */
export function handlePreRoundContributionPeriodStarted(event: PreRoundContributionPeriodStarted): void {
    log.debug(`PreRoundContributionPeriodStarted event block: {}`, [event.block.number.toString()])

    // Update QFI.
    const qfiAddress = event.address
    const qfiId = qfiAddress.toHexString()
    const qfi = QFISchema.load(qfiId)

    if (qfi !== null) {
        qfi.currentStage = currentStageConverterFromEnumIndexToString(event.params._currentStage.toString())

        qfi.save()
    } else {
        log.error(`QFI entity not found!`, [])
    }
}

/**
 * Handle the update of the PPT contract used for a Grant Round.
 * @param event Ethereum event emitted when a PPT contract is set for a Grant Round.
 */
export function handlePollProcessorAndTallyerChanged(event: PollProcessorAndTallyerChanged): void {
    log.debug(`PollProcessorAndTallyerChanged event block: {}`, [event.block.number.toString()])

    // Update QFI.
    const qfiAddress = event.address
    const qfiId = qfiAddress.toHexString()
    const qfi = QFISchema.load(qfiId)

    if (qfi !== null) {
        qfi.pollProcessorAndTallyerAddress = event.params._pollProcessorAndTallyer

        qfi.save()
    } else {
        log.error(`QFI entity not found!`, [])
    }
}

/**
 * Handle the addition of a Funding Source.
 * @param event Ethereum event emitted when a Funding Source is added.
 */
export function handleFundingSourceAdded(event: FundingSourceAdded): void {
    log.debug(`FundingSourceAdded event block: {}`, [event.block.number.toString()])

    const timestamp = event.block.timestamp.toString()
    // Update QFI.
    const qfiAddress = event.address
    const qfiId = qfiAddress.toHexString()
    const qfi = QFISchema.load(qfiId)

    if (qfi !== null) {
        // Create a new Funding Source.
        const fundingSourceId = event.params._source.toHexString()
        const fundingSource = new FundingSource(fundingSourceId)

        fundingSource.address = event.params._source
        fundingSource.qfi = qfiId
        fundingSource.isActive = true
        fundingSource.createdAt = timestamp
        fundingSource.lastUpdatedAt = timestamp

        fundingSource.save()
    } else {
        log.error(`QFI entity not found!`, [])
    }
}

/**
 * Handle the removal of a Funding Source.
 * @param event Ethereum event emitted when a Funding Source is removed.
 */
export function handleFundingSourceRemoved(event: FundingSourceRemoved): void {
    log.debug(`FundingSourceRemoved event block: {}`, [event.block.number.toString()])

    const timestamp = event.block.timestamp.toString()
    // Update QFI.
    const qfiAddress = event.address
    const qfiId = qfiAddress.toHexString()
    const qfi = QFISchema.load(qfiId)

    if (qfi !== null) {
        const fundingSourceId = event.params._source.toHexString()
        const fundingSource = FundingSource.load(fundingSourceId)

        if (fundingSource !== null) {
            fundingSource.isActive = false
            fundingSource.lastUpdatedAt = timestamp

            fundingSource.save()
        } else {
            log.error(`FundingSource entity not found!`, [])
        }
    } else {
        log.error(`QFI entity not found!`, [])
    }
}
