// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { 
    ISuperfluid 
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import { 
    ISuperToken 
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";

import {
    SuperTokenV1Library
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

import "@thirdweb-dev/contracts/base/ERC721Base.sol";

contract Scheduler {
    using SuperTokenV1Library for ISuperToken;

    struct Webinar {
        address creator;
        string description;
        ERC721Base nftGate;
        ISuperToken payWithToken;
        uint256 tokenCostToAttend;
        uint256 startTimestamp;
        uint256 endTimestamp;
        address[] attendees;
    }

    Webinar[] webinars;

    constructor() {
    }

    function createWebinar(
        string calldata description,
        ERC721Base nftGate,
        ISuperToken payWithToken,
        uint256 tokenCostToAttend
    ) public returns(uint256 webinarId) {
        webinarId = webinars.length;

        Webinar memory webinar;
        webinar.creator = msg.sender;
        webinar.description = description;
        webinar.nftGate = nftGate;
        webinar.payWithToken = payWithToken;
        webinar.tokenCostToAttend = tokenCostToAttend;

        webinars.push(webinar);
    }

    function endWebinar(uint256 webinarId) public {
        require(webinarId < webinars.length, "webinar does not exist");
        Webinar storage webinar = webinars[webinarId];
        require(webinar.creator == msg.sender);

        webinar.endTimestamp = block.timestamp;
    }

    function attendWebinar(
        uint256 webinarId
    ) public returns(bool) {
        require(webinarId < webinars.length, "webinar does not exist");
        Webinar storage webinar = webinars[webinarId];
    }
}
