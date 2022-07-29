import { BigInt } from "@graphprotocol/graph-ts"

export const ZERO = BigInt.fromI32(0)
export const ONE = BigInt.fromI32(1)

// Relates to schema.graphql Stage enum.
export const NOT_INITIALIZED = "NotInitialized"
export const WAITING_FOR_SIGNUPS_AND_TOPUPS = "WaitingForSignupsAndTopups"
export const VOTING_PERIOD_OPEN = "VotingPeriodOpen"
export const WAITING_FOR_FINALIZATION = "WaitingForFinalization"
export const FINALIZED = "Finalized"
export const CANCELLED = "Cancelled"

// Relates to schema.graphql RequestType enum.
export const REGISTRATION = "Registration"
export const REMOVAL = "Removal"
