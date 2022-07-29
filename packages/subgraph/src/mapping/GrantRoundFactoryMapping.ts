import { log } from "@graphprotocol/graph-ts"
import {
    OwnershipTransferred,
    MessageAqFactoryChanged,
    RecipientRegistryChanged
} from "../../generated/GrantRoundFactory/GrantRoundFactory"
import { OptimisticRecipientRegistry as RecipientRegistryContract } from "../../generated/OptimisticRecipientRegistry/OptimisticRecipientRegistry"
import {
    QFI as QFISchema,
    GrantRound,
    RecipientRegistry,
    GrantRoundFactory as GrantRoundFactorySchema
} from "../../generated/schema"
import { ZERO } from "../utils/constants"

/**
 * (e.g., Store a PublicKey in the storage).
 * @param event Ethereum event emitted when XYZ.
 */
export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    log.debug(`OwnershipTransferred event block: {}`, [event.block.number.toString()])
}

/**
 * Handle the change of the MessageAqFactory contract for the GrantRound Factory.
 * @param event Ethereum event emitted when a new MessageAqFactory contract is used by the GrantRound Factory.
 */
export function handleMessageAqFactoryChanged(event: MessageAqFactoryChanged): void {
    log.debug(`MessageAqFactoryChanged event block: {}`, [event.block.number.toString()])

    const timestamp = event.block.timestamp.toString()

    const grantRoundFactoryAddress = event.address
    const grantRoundFactoryId = grantRoundFactoryAddress.toHexString()
    let grantRoundFactory = GrantRoundFactorySchema.load(grantRoundFactoryId)

    if (grantRoundFactory === null) {
        // Create a new Grant Round Factory entity.
        grantRoundFactory = new GrantRoundFactorySchema(grantRoundFactoryId)
        grantRoundFactory.createdAt = timestamp
    }

    // Update the MessageAqFactory address.
    grantRoundFactory.messageAqFactoryAddress = event.params._messageAqFactory
    grantRoundFactory.lastUpdatedAt = timestamp

    grantRoundFactory.save()

    log.debug(`handleMessageAqFactoryChanged executed correctly`, [])
}

/**
 * (e.g., Store a PublicKey in the storage).
 * @param event Ethereum event emitted when XYZ.
 */
export function handleRecipientRegistryChanged(event: RecipientRegistryChanged): void {
    log.debug(`RecipientRegistryChanged event block: {}`, [event.block.number.toString()])

    const timestamp = event.block.timestamp.toString()

    const recipientRegistryAddress = event.params._recipientRegistry

    // Update Grant Round Factory entity.
    const grantRoundFactoryAddress = event.address
    const grantRoundFactoryId = grantRoundFactoryAddress.toHexString()
    let grantRoundFactory = GrantRoundFactorySchema.load(grantRoundFactoryId)

    if (grantRoundFactory === null) {
        // Create a new GrantRoundFactory entity.
        grantRoundFactory = new GrantRoundFactorySchema(grantRoundFactoryId)
        grantRoundFactory.createdAt = timestamp
    }

    // Update.
    grantRoundFactory.recipientRegistryAddress = recipientRegistryAddress
    grantRoundFactory.lastUpdatedAt = timestamp

    grantRoundFactory.save()

    // Create/Update Recipient Registry.
    const recipientRegistryContract = RecipientRegistryContract.bind(recipientRegistryAddress)
    const recipientRegistryId = recipientRegistryAddress.toHexString()
    let recipientRegistry = RecipientRegistry.load(recipientRegistryId)

    // Read from contract (trade-off, only when changing registry. May not be changed for multiple rounds).
    const baseDepositCall = recipientRegistryContract.try_baseDeposit() // exists only in OptimisticRecipientRegistry.
    const challengePeriodDurationCall = recipientRegistryContract.try_challengePeriodDuration() // exists only in OptimisticRecipientRegistry.
    const baseDeposit = baseDepositCall.reverted ? ZERO : baseDepositCall.value
    const challengePeriodDuration = challengePeriodDurationCall.reverted ? ZERO : challengePeriodDurationCall.value

    const controller = recipientRegistryContract.controller()
    const maxRecipients = recipientRegistryContract.maxRecipients()

    if (recipientRegistry === null) {
        // Create a new Recipient Registry entity.
        recipientRegistry = new RecipientRegistry(recipientRegistryId)

        recipientRegistry.grantRoundFactoryAddress = event.address
        recipientRegistry.baseDeposit = baseDeposit
        recipientRegistry.challengePeriodDuration = challengePeriodDuration
        recipientRegistry.controller = controller
        recipientRegistry.maxRecipients = maxRecipients
        recipientRegistry.createdAt = timestamp
        recipientRegistry.lastUpdatedAt = timestamp
    } else {
        log.error(`RecipientRegistry entity already in use!`, [])
    }

    // nb. may happen that the tx may not be signed from QFI contract owner.
    const qfiAddress = event.address
    const qfiId = qfiAddress.toHexString()
    const qfi = new QFISchema(qfiId)

    if (qfi !== null) {
        const grantRoundId = qfi.currentGrantRound

        if (grantRoundId !== null) {
            // Updates.
            recipientRegistry.grantRound = grantRoundId

            qfi.recipientRegistry = recipientRegistryId
            qfi.lastUpdatedAt = event.block.timestamp.toString()
            qfi.save()

            // Update GrantRound.
            const grantRound = GrantRound.load(grantRoundId)

            if (grantRound !== null) {
                grantRound.recipientRegistry = recipientRegistryId
                grantRound.lastUpdatedAt = timestamp

                grantRound.save()
            } else log.error(`GrantRound entity not found!`, [])
        }
    }

    recipientRegistry.save()

    log.debug(`handleRecipientRegistryChanged executed correctly`, [])
}
