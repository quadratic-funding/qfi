// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import {SimpleRecipientRegistry} from "../recipientRegistry/SimpleRecipientRegistry.sol";
import {SignUpGatekeeper} from "qaci-contracts/contracts/gatekeepers/SignUpGatekeeper.sol";
import {MACI} from "qaci-contracts/contracts/MACI.sol";

abstract contract InitialVoiceCreditProxy {
    function getVoiceCredits(address _user, bytes memory _data)
        public
        view
        virtual
        returns (uint256)
    {}
}

contract SimpleHackathon is
    SimpleRecipientRegistry,
    SignUpGatekeeper,
    InitialVoiceCreditProxy
{
    MACI public maci;

    uint256 internal balance;

    constructor(uint256 _balance, address _controller)
        SimpleRecipientRegistry(_controller)
    {
        balance = _balance;
    }

    /*
     * Adds an uninitialised MACI instance to allow for token singups
     * @param _maci The MACI contract interface to be stored
     */
    function setMaciInstance(MACI _maci) public override onlyOwner {
        maci = _maci;
    }

    /*
     * Registers the user if they own the token with the token ID encoded in
     * _data. Throws if the user is does not own the token or if the token has
     * already been used to sign up.
     * @param _user The user's Ethereum address.
     * @param _data noop
     */
    function register(address _user, bytes memory _data) public override {
        require(
            address(maci) == msg.sender,
            "SignUpTokenGatekeeper: only specified MACI instance can call this function"
        );
        require(
            _user == owner(),
            "SignUpTokenGatekeeper: only coordinator can call this function"
        );
    }

    function getVoiceCredits(address, bytes memory)
        public
        view
        override
        returns (uint256)
    {
        return balance;
    }
}
