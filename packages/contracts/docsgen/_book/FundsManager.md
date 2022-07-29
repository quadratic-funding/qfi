Handles funding sources and donations for Grant rounds

Responsible for sending matching funds to the Grant round contract

## Functions
### addFundingSource
```solidity
  function addFundingSource(
    address _source
  ) external
```

Add matching funds source.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_source` | address | Address of a funding source.

### removeFundingSource
```solidity
  function removeFundingSource(
    address _source
  ) external
```

Remove matching funds source.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`_source` | address | Address of the funding source.

### getMatchingFunds
```solidity
  function getMatchingFunds(
  ) external returns (uint256)
```

Get total amount of matching funds.


### transferMatchingFunds
```solidity
  function transferMatchingFunds(
  ) internal
```




## Events
### FundingSourceAdded
```solidity
  event FundingSourceAdded(
    address _source
  )
```
Event issued when a funding source is correctly added to the set.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`_source`| address | The address of the funding source.
### FundingSourceRemoved
```solidity
  event FundingSourceRemoved(
    address _source
  )
```
Event issued when a funding source is correctly removed from the set.


#### Parameters:
| Name                           | Type          | Description                                    |
| :----------------------------- | :------------ | :--------------------------------------------- |
|`_source`| address | The address of the funding source.
