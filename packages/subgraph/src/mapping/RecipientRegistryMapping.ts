import { log } from "@graphprotocol/graph-ts"
import {
    OwnershipTransferred,
    RequestResolved,
    RequestSubmitted
} from "../../generated/OptimisticRecipientRegistry/OptimisticRecipientRegistry"
import { RecipientAdded, RecipientRemoved } from "../../generated/SimpleHackathon/SimpleHackathon"

import { Recipient, RecipientRegistry } from "../../generated/schema"
import { REGISTRATION } from "../utils/constants"
import { requestTypeConverterFromEnumIndexToString } from "../utils/converter"

/**
 * (e.g., Store a PublicKey in the storage).
 * @param event Ethereum event emitted when XYZ.
 */
export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    log.debug(`OwnershipTransferred event block: {}`, [event.block.number.toString()])
}

/**
 * Store a registration/removal request for a Recipient.
 * @param event Ethereum event emitted when someone make a registration/removal request for a Recipient.
 */
export function handleRequestSubmitted(event: RequestSubmitted): void {
    log.debug(`RequestSubmitted event block: {}`, [event.block.number.toString()])

    const timestamp = event.block.timestamp.toString()

    const recipientRegistryId = event.address.toHexString()
    const recipientRegistry = RecipientRegistry.load(recipientRegistryId)

    if (recipientRegistry !== null) {
        // Create a new request for the Recipient.
        const recipientId = event.params._recipientId.toHexString()
        const recipient = new Recipient(recipientId)

        recipient.requestType = requestTypeConverterFromEnumIndexToString(event.params._type.toString())
        recipient.submissionTime = event.block.timestamp
        recipient.requesterAddress = event.transaction.from
        recipient.deposit = event.transaction.value
        recipient.requestSubmittedHash = event.transaction.hash
        recipient.recipientRegistry = recipientRegistryId
        recipient.requestRecipientAddress = event.params._recipient
        recipient.requestRecipientMetadata = event.params._metadata
        recipient.createdAt = timestamp
        recipient.lastUpdatedAt = timestamp

        recipient.save()
    } else log.error(`Recipient Registry entity not found!`, [])

    log.debug(`handleRequestSubmitted executed correctly`, [])
}

/**
 * Handle the request resolution for a Recipient.
 * @param event Ethereum event emitted when the request for a Recipient is resolved.
 */
export function handleRequestResolved(event: RequestResolved): void {
    log.debug(`RequestResolved event block: {}`, [event.block.number.toString()])

    const timestamp = event.block.timestamp.toString()

    // Calculate the RecipientRegistry identifier.
    const recipientRegistryId = event.address.toHexString()
    const recipientRegistry = RecipientRegistry.load(recipientRegistryId)

    if (recipientRegistry !== null) {
        const recipientId = event.params._recipientId.toHexString()
        const recipient = Recipient.load(recipientId)

        if (recipient !== null) {
            recipient.requestType = requestTypeConverterFromEnumIndexToString(event.params._type.toString())
            recipient.rejected = event.params._rejected
            recipient.resolutionTime = event.params._timestamp
            recipient.requestResolvedHash = event.transaction.hash

            if (!recipient.rejected) {
                if (recipient.requestType === REGISTRATION) {
                    recipient.metadata = recipient.requestRecipientMetadata
                    recipient.address = recipient.requestRecipientAddress
                    recipient.addedAt = event.params._timestamp
                    recipient.voteOptionIndex = event.params._recipientIndex
                } else recipient.removedAt = event.params._timestamp
            }

            recipient.lastUpdatedAt = timestamp

            recipient.save()
        } else log.error(`Recipient entity not found!`, [])
    } else log.error(`Recipient Registry entity not found!`, [])

    log.debug(`handleRequestResolved executed correctly`, [])
}

/**
 * Add a new Recipient.
 * @param event Ethereum event emitted when someone adds a new Recipient.
 */
export function handleRecipientAdded(event: RecipientAdded): void {
    log.debug(`RecipientAdded event block: {}`, [event.block.number.toString()])

    const timestamp = event.block.timestamp.toString()

    const recipientRegistryId = event.address.toHexString()
    const recipientRegistry = RecipientRegistry.load(recipientRegistryId)

    if (recipientRegistry !== null) {
        // Create a new request for the Recipient.
        const recipientId = event.params._recipientId.toHexString()
        const recipient = new Recipient(recipientId)

        recipient.deposit = event.transaction.value
        recipient.recipientRegistry = recipientRegistryId
        recipient.address = event.params._recipient
        recipient.metadata = event.params._metadata
        recipient.voteOptionIndex = event.params._index
        recipient.addedAt = event.params._timestamp

        recipient.createdAt = timestamp
        recipient.lastUpdatedAt = timestamp

        recipient.save()
    } else log.error(`Recipient Registry entity not found!`, [])

    log.debug(`handleRecipientAdded executed correctly`, [])
}

/**
 * Remove a Recipient.
 * @param event Ethereum event emitted when someone removes a Recipient.
 */

export function handleRecipientRemoved(event: RecipientRemoved): void {
    log.debug(`RecipientRemoved event block: {}`, [event.block.number.toString()])

    const timestamp = event.block.timestamp.toString()

    // Calculate the RecipientRegistry identifier.
    const recipientRegistryId = event.address.toHexString()
    const recipientRegistry = RecipientRegistry.load(recipientRegistryId)

    if (recipientRegistry !== null) {
        const recipientId = event.params._recipientId.toHexString()
        const recipient = Recipient.load(recipientId)

        if (recipient !== null) {
            recipient.removedAt = event.params._timestamp
            recipient.lastUpdatedAt = timestamp

            recipient.save()
        } else log.error(`Recipient entity not found!`, [])
    } else log.error(`Recipient Registry entity not found!`, [])

    log.debug(`handleRecipientRemoved executed correctly`, [])
}
