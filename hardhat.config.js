require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    base: {
      url: "https://mainnet.base.org",
      chainId: 8453,
      // accounts: [process.env.PRIVATE_KEY], // Uncomment and add private key for deployment
    },
    baseSepolia: {
      url: "https://sepolia.base.org", 
      chainId: 84532,
      // accounts: [process.env.PRIVATE_KEY], // Uncomment and add private key for deployment
    },
  },
};