
Interface of the recipient registry.

This contract must do the following:

- Add recipients to the registry.
- Allow only legitimate recipients into the registry.
- Assign an unique index to each recipient.
- Limit the maximum number of entries according to a parameter set by the funding round factory.
- Remove invalid entries.
- Prevent indices from changing during the funding round.
- Find address of a recipient by their unique index.

## Functions
### setMaxRecipients
```solidity
  function setMaxRecipients(
  ) external returns (bool)
```




### getRecipientAddress
```solidity
  function getRecipientAddress(
  ) external returns (address)
```




