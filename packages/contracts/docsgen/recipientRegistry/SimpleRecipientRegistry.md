
A simple recipient registry managed by a trusted entity.

## Functions
### constructor
```solidity
  function constructor(
    address _controller
  ) public
```

Deploy the registry.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_controller` | address | Controller address. Normally it's a funding round factory contract.

### addRecipient
```solidity
  function addRecipient(
    address _recipient,
    string _metadata
  ) external
```

Register recipient as eligible for funding allocation.

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

Remove recipient from the registry.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_recipientId` | bytes32 | The ID of recipient.

## Events
### RecipientAdded
```solidity
  event RecipientAdded(
  )
```



### RecipientRemoved
```solidity
  event RecipientRemoved(
  )
```



