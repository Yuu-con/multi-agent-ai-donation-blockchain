const DonationCampaign = artifacts.require("DonationCampaign");

module.exports = function (deployer) {
  deployer.deploy(DonationCampaign);
};
