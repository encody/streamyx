// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;


import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { 
    ISuperfluid 
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { 
    ISuperToken 
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import {
    SuperTokenV1Library
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

contract Scheduler is Ownable2Step {
    using SafeCast for uint256;
    using SafeCast for uint96;
    using SafeCast for int96;
    using SuperTokenV1Library for ISuperToken;

    event WebinarStarted(uint256 webinarId);
    event WebinarEnded(uint256 webinarId);
    event SponsorshipProposed(address indexed sponsor, address indexed host, uint256 sponsorshipId);
    event SponsorshipAccepted(address indexed sponsor, address indexed host, uint256 sponsorshipId);

    struct Webinar {
        address host;
        string description;
        ERC721 nftGate;
        address payWithToken;
        uint256 tokenCostToAttend;
        uint256 startTimestamp;
        uint256 endTimestamp;
        uint256 sponsorshipIndexPlusOne;
        address[] attendeesList;
        mapping(address => uint256) attendeesMapToListIndexPlusOne;
    }

    struct Sponsorship {
        address sponsor;
        address host;
        ERC721 nftGate;
        ISuperToken payWithToken;
        int96 tokenRate;
        uint32 targetAttendance;
        bool isAccepted;
    }

    Webinar[] webinars;
    Sponsorship[] sponsorships;
    int96 contractFeeInThousanths;

    function ownerWithdrawErc20(address token, uint256 amount) public onlyOwner {
        require(token != address(0));
        require(amount != 0);
        ERC20(token).transfer(owner(), amount);
    }

    function proposeSponsorship(
        address host,
        ERC721 nftGate,
        ISuperToken payWithToken,
        int96 tokenRate,
        uint32 targetAttendance
    ) public returns(uint256 sponsorshipId) {
        sponsorshipId = sponsorships.length;

        sponsorships.push(Sponsorship({
            sponsor: msg.sender,
            host: host,
            nftGate: nftGate,
            payWithToken: payWithToken,
            tokenRate: tokenRate,
            targetAttendance: targetAttendance,
            isAccepted: false
        }));

        emit SponsorshipProposed(msg.sender, host, sponsorshipId);
    }

    function acceptSponsorshipProposal(uint256 sponsorshipId, string calldata description) public returns(uint256 webinarId) {
        require(sponsorshipId < sponsorships.length, "sponsorship proposal does not exist");
        Sponsorship storage proposal = sponsorships[sponsorshipId];
        require(!proposal.isAccepted, "proposal has already been accepted");
        require(proposal.host == msg.sender, "msg.sender cannot accept this proposal");

        proposal.isAccepted = true;

        webinarId = webinars.length;

        Webinar storage webinar = webinars.push();
        webinar.host = proposal.host;
        webinar.description = description;
        webinar.nftGate = proposal.nftGate;
        webinar.sponsorshipIndexPlusOne = sponsorshipId + 1;
    }

    function createWebinarFixedRate(
        string calldata description,
        ERC721 nftGate,
        address payWithToken,
        uint256 tokenCostToAttend
    ) public returns(uint256 webinarId) {
        webinarId = webinars.length;

        Webinar storage webinar = webinars.push();
        webinar.host = msg.sender;
        webinar.description = description;
        webinar.nftGate = nftGate;
        webinar.payWithToken = payWithToken;
        webinar.tokenCostToAttend = tokenCostToAttend;
    }

    function startWebinar(uint256 webinarId) public {
        require(webinarId < webinars.length, "webinar does not exist");
        Webinar storage webinar = webinars[webinarId];
        require(webinar.host == msg.sender);
        require(webinar.startTimestamp == 0, "webinar already started");

        webinar.startTimestamp = block.timestamp;

        if (webinar.sponsorshipIndexPlusOne != 0) {
            Sponsorship storage sponsorship = sponsorships[webinar.sponsorshipIndexPlusOne - 1];
            int96 rateToContract = sponsorship.tokenRate * contractFeeInThousanths / 1000;
            int96 rateToHost = sponsorship.tokenRate - rateToContract;

            sponsorship.payWithToken.createFlowFrom(sponsorship.sponsor, webinar.host, rateToHost);
            sponsorship.payWithToken.createFlowFrom(sponsorship.sponsor, address(this), rateToContract);
        }
    }

    function endWebinar(uint256 webinarId) public {
        require(webinarId < webinars.length, "webinar does not exist");
        Webinar storage webinar = webinars[webinarId];
        require(webinar.host == msg.sender);
        require(webinar.startTimestamp != 0, "webinar has not yet started");
        require(webinar.endTimestamp == 0, "webinar already ended");

        webinar.endTimestamp = block.timestamp;

        if (webinar.sponsorshipIndexPlusOne != 0) {
            Sponsorship storage sponsorship = sponsorships[webinar.sponsorshipIndexPlusOne - 1];

            sponsorship.payWithToken.deleteFlowFrom(sponsorship.sponsor, webinar.host);
            sponsorship.payWithToken.deleteFlowFrom(sponsorship.sponsor, address(this));
        }
    }

    function attendWebinar(uint256 webinarId) public {
        require(webinarId < webinars.length, "webinar does not exist");
        Webinar storage webinar = webinars[webinarId];
        require(webinar.attendeesMapToListIndexPlusOne[msg.sender] == 0, "msg.sender is already marked as attending");

        uint256 attendeeIndex = webinar.attendeesList.length;
        webinar.attendeesList.push(msg.sender);
        webinar.attendeesMapToListIndexPlusOne[msg.sender] = attendeeIndex + 1;

        if (address(webinar.nftGate) != address(0)) {
            uint256 balance = webinar.nftGate.balanceOf(msg.sender);
            require(balance > 0, "missing NFT gate");
        }

        if (address(webinar.payWithToken) != address(0) && webinar.tokenCostToAttend > 0) {
            ERC20 paymentToken = ERC20(webinar.payWithToken);
            uint256 amountToContract = webinar.tokenCostToAttend * contractFeeInThousanths.toUint256() / 1000;
            uint256 amountToHost = webinar.tokenCostToAttend - amountToContract;

            paymentToken.transferFrom(msg.sender, webinar.host, amountToHost);
            paymentToken.transferFrom(msg.sender, address(this), amountToContract);
        }
    }

    // function addressAttendsWebinar
}
