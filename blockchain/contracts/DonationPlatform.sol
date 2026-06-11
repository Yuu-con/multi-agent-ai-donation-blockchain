// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DonationPlatform {
    struct Campaign {
        uint256 id;
        string title;
        string description;
        address payable receiver;
        uint256 targetAmount;
        uint256 totalReceived;
        uint256 createdAt;
        bool active;
    }

    struct Donation {
        uint256 campaignId;
        address donor;
        uint256 amount;
        uint256 timestamp;
    }

    uint256 public campaignCount;

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Donation[]) public campaignDonations;

    event CampaignCreated(
        uint256 indexed campaignId,
        string title,
        address indexed receiver,
        uint256 targetAmount,
        uint256 createdAt
    );

    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        uint256 timestamp
    );

    event CampaignClosed(uint256 indexed campaignId);

    modifier onlyExistingCampaign(uint256 campaignId) {
        require(campaignId > 0 && campaignId <= campaignCount, "Campaign khong ton tai");
        _;
    }

    modifier onlyActiveCampaign(uint256 campaignId) {
        require(campaignId > 0 && campaignId <= campaignCount, "Campaign khong ton tai");
        require(campaigns[campaignId].active, "Campaign da dong");
        _;
    }

    // Tao chien dich quyen gop moi.
    function createCampaign(
        string memory title,
        string memory description,
        address payable receiver,
        uint256 targetAmount
    ) public returns (uint256) {
        require(receiver != address(0), "Dia chi nhan khong hop le");
        require(targetAmount > 0, "Muc tieu phai lon hon 0");

        campaignCount++;
        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            title: title,
            description: description,
            receiver: receiver,
            targetAmount: targetAmount,
            totalReceived: 0,
            createdAt: block.timestamp,
            active: true
        });

        emit CampaignCreated(campaignCount, title, receiver, targetAmount, block.timestamp);
        return campaignCount;
    }

    // Quyen gop vao chien dich. Tien duoc chuyen truc tiep den receiver.
    function donate(uint256 campaignId) public payable onlyActiveCampaign(campaignId) {
        require(msg.value > 0, "So tien quyen gop phai lon hon 0");

        Campaign storage campaign = campaigns[campaignId];
        campaign.totalReceived += msg.value;

        campaignDonations[campaignId].push(
            Donation({
                campaignId: campaignId,
                donor: msg.sender,
                amount: msg.value,
                timestamp: block.timestamp
            })
        );

        (bool success, ) = campaign.receiver.call{value: msg.value}("");
        require(success, "Chuyen tien that bai");

        emit DonationReceived(campaignId, msg.sender, msg.value, block.timestamp);
    }

    function closeCampaign(uint256 campaignId) public onlyActiveCampaign(campaignId) {
        require(msg.sender == campaigns[campaignId].receiver, "Chi receiver moi co quyen dong");
        campaigns[campaignId].active = false;
        emit CampaignClosed(campaignId);
    }

    function getCampaign(uint256 campaignId)
        public
        view
        onlyExistingCampaign(campaignId)
        returns (Campaign memory)
    {
        return campaigns[campaignId];
    }

    function getCampaignCount() public view returns (uint256) {
        return campaignCount;
    }

    function getDonationsByCampaign(uint256 campaignId)
        public
        view
        onlyExistingCampaign(campaignId)
        returns (Donation[] memory)
    {
        return campaignDonations[campaignId];
    }
}
