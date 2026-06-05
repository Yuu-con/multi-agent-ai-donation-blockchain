// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DonationCampaign {
    struct Campaign {
        string title;
        address owner;
        uint256 targetAmount;
        uint256 totalRaised;
        bool exists;
    }

    uint256 public nextCampaignId = 1;
    mapping(uint256 => Campaign) public campaigns;

    event CampaignCreated(uint256 indexed campaignId, string title, uint256 targetAmount, address owner);
    event DonationRecorded(uint256 indexed campaignId, address indexed donor, uint256 amount, uint256 timestamp);

    function createCampaign(string calldata title, uint256 targetAmount) external returns (uint256) {
        require(targetAmount > 0, "targetAmount must be > 0");

        uint256 campaignId = nextCampaignId;
        campaigns[campaignId] = Campaign({
            title: title,
            owner: msg.sender,
            targetAmount: targetAmount,
            totalRaised: 0,
            exists: true
        });
        nextCampaignId++;

        emit CampaignCreated(campaignId, title, targetAmount, msg.sender);
        return campaignId;
    }

    function donate(uint256 campaignId) external payable {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.exists, "campaign not found");
        require(msg.value > 0, "donation must be > 0");

        campaign.totalRaised += msg.value;
        emit DonationRecorded(campaignId, msg.sender, msg.value, block.timestamp);
    }
}
