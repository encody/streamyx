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

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Scheduler {
    using SuperTokenV1Library for ISuperToken;

    struct Webinar {
        address host;
        string description;
        ERC721 nftGate;
        address payWithToken;
        uint256 tokenCostToAttend;
        int96 tokenRate;
        uint256 startTimestamp;
        uint256 endTimestamp;
        address[] attendeesList;
        mapping(address => bool) attendeesSet;
    }

    Webinar[] webinars;

    constructor() {
    }

    function createWebinarFlow(
        string calldata description,
        ERC721 nftGate,
        address payWithToken,
        int96 tokenRate
    ) public returns(uint256 webinarId) {
        require(payWithToken != address(0), "flow token address must be nonzero");
        require(tokenRate > 0, "tokenRate must not be zero");

        webinarId = webinars.length;

        Webinar memory webinar;
        webinar.host = msg.sender;
        webinar.description = description;
        webinar.nftGate = nftGate;
        webinar.payWithToken = payWithToken;
        webinar.tokenRate = tokenRate;

        webinars.push(webinar);
    }

    function createWebinarFixedRate(
        string calldata description,
        ERC721 nftGate,
        address payWithToken,
        uint256 tokenCostToAttend
    ) public returns(uint256 webinarId) {
        webinarId = webinars.length;

        Webinar memory webinar;
        webinar.host = msg.sender;
        webinar.description = description;
        webinar.nftGate = nftGate;
        webinar.payWithToken = payWithToken;
        webinar.tokenCostToAttend = tokenCostToAttend;

        webinars.push(webinar);
    }

    function endWebinar(uint256 webinarId) public {
        require(webinarId < webinars.length, "webinar does not exist");
        Webinar storage webinar = webinars[webinarId];
        require(webinar.host == msg.sender);

        webinar.endTimestamp = block.timestamp;
    }

    function attendWebinar(
        uint256 webinarId
    ) public {
        require(webinarId < webinars.length, "webinar does not exist");
        Webinar storage webinar = webinars[webinarId];
        require(!webinar.attendeesSet[msg.sender], "already registered for webinar");

        if (address(webinar.nftGate) != address(0)) {
            uint256 balance = webinar.nftGate.balanceOf(msg.sender);
            require(balance > 0, "missing NFT gate");
        }

        if (address(webinar.payWithToken) != address(0)) {
            if (webinar.tokenRate > 0) {
                ISuperToken(webinar.payWithToken).createFlowFrom(msg.sender, webinar.host, webinar.tokenRate);
            } else if (webinar.tokenCostToAttend > 0) {
                ERC20(webinar.payWithToken).transferFrom(msg.sender, webinar.host, webinar.tokenCostToAttend);
            }
        }

        webinar.attendeesList.push(msg.sender);
        webinar.attendeesSet[msg.sender] = true;
    }
}
