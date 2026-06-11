require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: __dirname + "/.env" });

const ganacheNetwork = {
  url: process.env.GANACHE_URL || "http://127.0.0.1:7545",
};

if (process.env.PRIVATE_KEY) {
  ganacheNetwork.accounts = [process.env.PRIVATE_KEY];
}

module.exports = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: process.env.LOCALHOST_RPC_URL || "http://127.0.0.1:8545",
    },
    ganache: ganacheNetwork,
  },
};
