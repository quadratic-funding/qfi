
Abstract contract containing common methods for recipient registries.

## Functions
### setMaxRecipients
```solidity
  function setMaxRecipients(
    uint256 _maxRecipients
  ) external returns (bool)
```

Set maximum number of recipients.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_maxRecipients` | uint256 | Maximum number of recipients.

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`True`| uint256 | if operation is successful.
### _addRecipient
```solidity
  function _addRecipient(
    bytes32 _recipientId,
    address _recipient
  ) internal returns (uint256)
```

Register recipient as eligible for funding allocation.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_recipientId` | bytes32 | The ID of recipient.
|`_recipient` | address | The address that receives funds.

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`Recipient`| bytes32 | index.
### _removeRecipient
```solidity
  function _removeRecipient(
    bytes32 _recipientId
  ) internal
```

Remove recipient from the registry.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_recipientId` | bytes32 | The ID of recipient.

### getRecipientAddress
```solidity
  function getRecipientAddress(
    uint256 _index,
    uint256 _startTime,
    uint256 _endTime
  ) external returns (address)
```

Get recipient address by index.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_index` | uint256 | Recipient index.
|`_startTime` | uint256 | The start time of the funding round.
|`_endTime` | uint256 | The end time of the funding round.

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`Recipient`| uint256 | address.
### getRecipientCount
```solidity
  function getRecipientCount(
  ) public returns (uint256)
```

Get recipient count.


#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`count`|  | of active recipients in the registry.
