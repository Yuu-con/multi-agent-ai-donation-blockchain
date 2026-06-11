const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying DonationPlatform with account:", deployer.address);

  const DonationPlatform = await hre.ethers.getContractFactory("DonationPlatform");
  const contract = await DonationPlatform.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("DonationPlatform deployed to:", address);
  console.log("Use this value as DONATION_CONTRACT_ADDRESS in backend/.env");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
