# GrantRound
Deploys new Quadratic Funding Round Contracts

Factory Contract to deploy a special type of Poll called GrantRound.

## Functions
### setMessageAqFactory
```solidity
  function setMessageAqFactory(
    contract MessageAqFactory _messageAqFactory
  ) public
```
Sets the MessageAqFactory to use for the grant rounds

public function, _messageAqFactory should deploy new AccQueueQuinaryMaci AccQueue(s), need to set before calling deployGrantRound

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_messageAqFactory` | contract MessageAqFactory | MessageAqFactory stored in memory

### setRecipientRegistry
```solidity
  function setRecipientRegistry(
    contract IRecipientRegistry _recipientRegistry
  ) public
```
Sets the recipientRegistry to use for the grant rounds

public function,

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_recipientRegistry` | contract IRecipientRegistry | IRecipientRegistry stored in memory

### deployGrantRound
```solidity
  function deployGrantRound(
    uint256 _voiceCreditFactor,
    address _coordinator,
    contract ERC20 _nativeToken,
    uint256 _duration,
    struct Params.MaxValues _maxValues,
    struct Params.TreeDepths _treeDepths,
    struct Params.BatchSizes _batchSizes,
    struct IPubKey.PubKey _coordinatorPubKey,
    contract VkRegistry _maci,
    contract IMACI _grantRoundOwner
  ) public returns (contract GrantRound)
```
Deploys a new GrantRound Contract

public function

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_voiceCreditFactor` | uint256 | uint256 The factor by which the voiceCredit is multiplied to determine the amount of voice credits that are distributed to the contributor.
|`_coordinator` | address | The address of the coordinator of the GrantRound.
|`_nativeToken` | contract ERC20 | The address of the ERC20 token used for the GrantRound.
|`_duration` | uint256 | uint256  stored in memory, the duration of the GrantRound
|`_maxValues` | struct Params.MaxValues | MaxValues stored in memory, the maxMessages and maxVoteOptions of the GrantRound as uint256 values
|`_treeDepths` | struct Params.TreeDepths | TreeDepths stored in memory, intStateTreeDepth, messageTreeSubDepth, messageTreeDepth, and voteOptionTreeDepth as uint8 values
|`_batchSizes` | struct Params.BatchSizes | BatchSizes stored in memory, messageBatchSize and tallyBatchSize as uint8 values
|`_coordinatorPubKey` | struct IPubKey.PubKey | PubKey stored in memory, MACI pubkey of the coordinator of the GrantRound
|`_maci` | contract VkRegistry | VkRegistry
|`_grantRoundOwner` | contract IMACI | address stored in memory

## Events
### MessageAqFactoryChanged
```solidity
  event MessageAqFactoryChanged(
    address _messageAqFactory
  )
```
Event issued when the owner sets/changes the address of the MessageAqFactory smart contract.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`_messageAqFactory`| address | The Ethereum address of the new MessageAqFactory smart contract.
### RecipientRegistryChanged
```solidity
  event RecipientRegistryChanged(
    address _recipientRegistry
  )
```
Event issued when the owner sets/changes the address of the RecipientRegistry smart contract.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`_recipientRegistry`| address | The Ethereum address of the new RecipientRegistry smart contract.
