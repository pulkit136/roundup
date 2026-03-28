import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    flowTestnet: {
      type: "http",
      url: "https://testnet.evm.nodes.onflow.org",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY.replace("0x", "")}`] : [],
      chainId: 545,
    },
  },
};

export default config;