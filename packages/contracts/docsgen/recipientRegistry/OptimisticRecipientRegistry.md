
Recipient registry with optimistic execution of registrations and removals.

## Functions
### constructor
```solidity
  function constructor(
    uint256 _baseDeposit,
    uint256 _challengePeriodDuration,
    address _controller
  ) public
```

Deploy the registry.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_baseDeposit` | uint256 | Deposit required to add or remove item.
|`_challengePeriodDuration` | uint256 | The time owner has to challenge a request (seconds).
|`_controller` | address | Controller address. Normally it's a funding round factory contract.

### setBaseDeposit
```solidity
  function setBaseDeposit(
  ) external
```

Change base deposit.


### setChallengePeriodDuration
```solidity
  function setChallengePeriodDuration(
  ) external
```

Change challenge period duration.


### addRecipient
```solidity
  function addRecipient(
    address _recipient,
    string _metadata
  ) external
```

Submit recipient registration request.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_recipient` | address | The address that receives funds.
|`_metadata` | string | The metadata info of the recipient.

### removeRecipient
```solidity
  function removeRecipient(
    bytes32 _recipientId
  ) external
```

Submit recipient removal request.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_recipientId` | bytes32 | The ID of recipient.

### challengeRequest
```solidity
  function challengeRequest(
    bytes32 _recipientId,
    address payable _beneficiary
  ) external returns (bool)
```

Reject request.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_recipientId` | bytes32 | The ID of recipient.
|`_beneficiary` | address payable | Address to which the deposit should be transferred.

### executeRequest
```solidity
  function executeRequest(
    bytes32 _recipientId
  ) external returns (bool)
```

Execute request.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_recipientId` | bytes32 | The ID of recipient.

## Events
### RequestSubmitted
```solidity
  event RequestSubmitted(
  )
```



### RequestResolved
```solidity
  event RequestResolved(
  )
```



