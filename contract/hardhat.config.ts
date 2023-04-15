require('dotenv').config();
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.18',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: 'mumbai',
  networks: {
    mumbai: {
      chainId: 80001,
      url: process.env.MUMBAI_URL!,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
};

export default config;
